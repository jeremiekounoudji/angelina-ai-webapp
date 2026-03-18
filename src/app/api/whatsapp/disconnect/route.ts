import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;

const BodySchema = z.object({
  instanceName: z.string().min(1),
  instanceId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ error: "Evolution API not configured" }, { status: 500 });
  }

  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { instanceName, instanceId } = parsed.data;

  // Verify ownership
  const { data: instance } = await supabase
    .from("whatsapp_instances")
    .select("id, company_id")
    .eq("instance_name", instanceName)
    .single();

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", instance.company_id)
    .eq("user_id", user.id)
    .single();

  if (!company) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
      method: "DELETE",
      headers: { apikey: EVOLUTION_API_KEY },
    }).catch(() => null);

    await supabase
      .from("whatsapp_instances")
      .update({ status: "disconnected", updated_at: new Date().toISOString() })
      .eq("instance_id", instanceId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
