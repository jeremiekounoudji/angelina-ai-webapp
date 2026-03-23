/**
 * GET /api/whatsapp/credentials?companyId=<uuid>
 *
 * Returns the decrypted WhatsApp API key for a company's active instance.
 * Intended for server-to-server use (e.g. n8n workflows).
 *
 * Auth: Bearer token via N8N_WEBHOOK_SECRET env var.
 * Never expose this endpoint publicly without the secret.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";

const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

export async function GET(req: NextRequest) {
  // Validate shared secret
  const authHeader = req.headers.get("authorization");
  if (!WEBHOOK_SECRET || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  const supabase = await createServerClient();

  const { data: instance, error } = await supabase
    .from("whatsapp_instances")
    .select("instance_name, instance_id, api_key, status")
    .eq("company_id", companyId)
    .eq("status", "connected")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !instance) {
    return NextResponse.json({ error: "No active instance found" }, { status: 404 });
  }

  if (!instance.api_key) {
    return NextResponse.json({ error: "No API key stored for this instance" }, { status: 404 });
  }

  try {
    const apiKey = await decrypt(instance.api_key);
    return NextResponse.json({
      instanceName: instance.instance_name,
      instanceId: instance.instance_id,
      apiKey,
    });
  } catch {
    return NextResponse.json({ error: "Failed to decrypt credentials" }, { status: 500 });
  }
}
