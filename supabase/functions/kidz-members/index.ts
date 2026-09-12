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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = new URL(req.url);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminPassword = Deno.env.get("ADMIN_PASSWORD") || "";
  const db = createClient(supabaseUrl, serviceKey);

  if (req.method === "GET") {
    const resource = url.searchParams.get("resource") || "members";
    if (resource === "members") {
      const { data, error } = await db.from("kidz_members")
        .select("*").order("sort_order", { ascending: true });
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true, items:data || [] });
    }
    if (resource === "gallery") {
      const { data, error } = await db.from("kidz_gallery")
        .select("*").order("created_at", { ascending: false });
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true, items:data || [] });
    }
    if (resource === "media_groups") {
      const { data, error } = await db.from("kidz_media_groups")
        .select("*").order("sort_order", { ascending: true });
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true, items:data || [] });
    }
    return json({ ok:false, error:"Recurso inválido" }, 400);
  }

  if (req.method !== "POST") return json({ ok:false, error:"Método inválido" }, 405);

  let body:any = {};
  try { body = await req.json(); } catch {
    return json({ ok:false, error:"JSON inválido" }, 400);
  }

  if (!body.password || body.password !== adminPassword) {
    return json({ ok:false, error:"No autorizado" }, 401);
  }

  const resource = body.resource;
  const action = body.action;

  if (resource === "members") {
    if (action === "upsert") {
      const item = body.item || {};
      if (!item.id || !item.name) return json({ ok:false, error:"Faltan datos" }, 400);

      const row = {
        id: String(item.id),
        name: String(item.name),
        subtitle: String(item.subtitle || ""),
        real_name: String(item.real_name || ""),
        state_id: String(item.state_id || ""),
        phone: String(item.phone || ""),
        photo: String(item.photo || ""),
        sort_order: Number(item.sort_order || 0),
        updated_at: new Date().toISOString(),
      };

      const { error } = await db.from("kidz_members").upsert(row, { onConflict:"id" });
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true });
    }

    if (action === "delete") {
      const { error } = await db.from("kidz_members").delete().eq("id", String(body.id || ""));
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true });
    }
  }

  if (resource === "gallery") {
    if (action === "upsert") {
      const item = body.item || {};
      if (!item.id || !item.src) return json({ ok:false, error:"Faltan datos" }, 400);

      const row = {
        id: String(item.id),
        src: String(item.src),
        caption: String(item.caption || ""),
        sort_order: Number(item.sort_order || 0),
        media_type: String(item.media_type || "image"),
        group_id: String(item.group_id || ""),
        updated_at: new Date().toISOString(),
      };

      const { error } = await db.from("kidz_gallery").upsert(row, { onConflict:"id" });
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true });
    }

    if (action === "delete") {
      const { error } = await db.from("kidz_gallery").delete().eq("id", String(body.id || ""));
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true });
    }
  }


  if (resource === "media_groups") {
    if (action === "upsert") {
      const item = body.item || {};
      if (!item.id || !item.name) return json({ ok:false, error:"Faltan datos" }, 400);

      const row = {
        id: String(item.id),
        name: String(item.name),
        description: String(item.description || ""),
        group_type: String(item.group_type || "image"),
        sort_order: Number(item.sort_order || 0),
        updated_at: new Date().toISOString(),
      };

      const { error } = await db.from("kidz_media_groups").upsert(row, { onConflict:"id" });
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      const { error: moveError } = await db.from("kidz_gallery")
        .update({ group_id:"" }).eq("group_id", id);
      if (moveError) return json({ ok:false, error:moveError.message }, 500);

      const { error } = await db.from("kidz_media_groups").delete().eq("id", id);
      if (error) return json({ ok:false, error:error.message }, 500);
      return json({ ok:true });
    }
  }

  return json({ ok:false, error:"Acción inválida" }, 400);
});
