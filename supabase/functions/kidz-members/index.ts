import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// ── Token helpers (mismos que kidz-login) ─────────────────────────────
function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(secretKey: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(new Uint8Array(sig));
}

async function verifyToken(secretKey: string, token: string): Promise<boolean> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^[0-9a-f]{64}$/.test(sig)) return false;
  if (sig !== (await hmacHex(secretKey, payload))) return false;
  const m = /^kidz:session:(\d+):/.exec(payload);
  if (!m) return false;
  return Number(m[1]) > Date.now();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = new URL(req.url);
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    if (req.method === "GET") {
      const resource = url.searchParams.get("resource") || "members";
      const table =
        resource === "members" ? "kidz_members" :
        resource === "gallery" ? "kidz_gallery" :
        resource === "media_groups" ? "kidz_media_groups" : "";

      if (!table) return json({ ok:false, error:"Recurso inválido" }, 400);

      let q = db.from(table).select("*");
      if (resource === "members" || resource === "media_groups") q = q.order("sort_order", { ascending:true });
      if (resource === "gallery") q = q.order("created_at", { ascending:false });

      const { data, error } = await q;
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true, items:data || [] });
    }

    if (req.method !== "POST") return json({ ok:false, error:"Método inválido" }, 405);

    const body = await req.json();
    const resource = String(body.resource || "");
    const action = String(body.action || "");
    const secret = Deno.env.get("ADMIN_PASSWORD") || "";
    const credential = String(body.password || "");
    const isAdmin =
      credential !== "" &&
      (credential === secret || (await verifyToken(secret, credential)));

    // Public/OG-capable writes: upload media and create/edit groups.
    // Destructive actions + member management remain Admin-only.
    const publicWrite =
      (resource === "gallery" && action === "upsert") ||
      (resource === "media_groups" && action === "upsert");

    if (!isAdmin && !publicWrite) {
      return json({ ok:false, error:"No autorizado" }, 401);
    }

    if (resource === "members") {
      if (action === "upsert") {
        const item = body.item || {};
        const row = {
          id:String(item.id), name:String(item.name), subtitle:String(item.subtitle||""),
          real_name:String(item.real_name||""), state_id:String(item.state_id||""),
          phone:String(item.phone||""), photo:String(item.photo||""),
          sort_order:Number(item.sort_order||0), updated_at:new Date().toISOString(),
        };
        const { error } = await db.from("kidz_members").upsert(row,{onConflict:"id"});
        if (error) return json({ok:false,error:error.message},500);
        return json({ok:true});
      }
      if (action === "delete") {
        const { error } = await db.from("kidz_members").delete().eq("id",String(body.id||""));
        if (error) return json({ok:false,error:error.message},500);
        return json({ok:true});
      }
    }

    if (resource === "gallery") {
      if (action === "upsert") {
        const item = body.item || {};
        if (!item.id || !item.src) return json({ok:false,error:"Faltan datos"},400);
        const row = {
          id:String(item.id), src:String(item.src), caption:String(item.caption||""),
          sort_order:Number(item.sort_order||0), media_type:String(item.media_type||"image"),
          group_id:String(item.group_id||""), updated_at:new Date().toISOString(),
        };
        const { error } = await db.from("kidz_gallery").upsert(row,{onConflict:"id"});
        if (error) return json({ok:false,error:error.message},500);
        return json({ok:true});
      }
      if (action === "delete") {
        const { error } = await db.from("kidz_gallery").delete().eq("id",String(body.id||""));
        if (error) return json({ok:false,error:error.message},500);
        return json({ok:true});
      }
    }

    if (resource === "media_groups") {
      if (action === "upsert") {
        const item = body.item || {};
        if (!item.id || !item.name) return json({ok:false,error:"Faltan datos"},400);
        const row = {
          id:String(item.id), name:String(item.name), description:String(item.description||""),
          group_type:String(item.group_type||"image"), sort_order:Number(item.sort_order||0),
          updated_at:new Date().toISOString(),
        };
        const { error } = await db.from("kidz_media_groups").upsert(row,{onConflict:"id"});
        if (error) return json({ok:false,error:error.message},500);
        return json({ok:true});
      }
      if (action === "delete") {
        const id=String(body.id||"");
        const { error:moveError }=await db.from("kidz_gallery").update({group_id:""}).eq("group_id",id);
        if (moveError) return json({ok:false,error:moveError.message},500);
        const { error }=await db.from("kidz_media_groups").delete().eq("id",id);
        if (error) return json({ok:false,error:error.message},500);
        return json({ok:true});
      }
    }

    return json({ok:false,error:"Acción inválida"},400);
  } catch (error) {
    return json({ok:false,error:error instanceof Error?error.message:"Error interno"},500);
  }
});
