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

// Sesión emitida por el servidor. El navegador NUNCA guarda la contraseña en
// claro: solo guarda este token firmado, que además expira.
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 h

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

async function issueToken(secretKey: string): Promise<{ token: string; exp: number }> {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomUUID();
  const payload = `kidz:session:${exp}:${nonce}`;
  const sig = await hmacHex(secretKey, payload);
  return { token: `${payload}.${sig}`, exp };
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
  if (req.method !== "POST") return json({ ok: false, error: "Método inválido" }, 405);

  try {
    const body = await req.json();
    const secret = Deno.env.get("ADMIN_PASSWORD") || "";
    const action = String(body.action || "login");

    if (action === "validate") {
      const token = String(body.token || "");
      const valid = token ? await verifyToken(secret, token) : false;
      return valid
        ? json({ ok: true, role: "admin" })
        : json({ ok: false, error: "Sesión inválida o expirada." }, 401);
    }

    const password = String(body.password || "");
    if (!secret || password !== secret) {
      return json({ ok: false, error: "Contraseña incorrecta." }, 401);
    }
    const { token, exp } = await issueToken(secret);
    return json({ ok: true, role: "admin", token, exp });
  } catch (error) {
    return json(
      { ok: false, error: error instanceof Error ? error.message : "Error interno" },
      500,
    );
  }
});