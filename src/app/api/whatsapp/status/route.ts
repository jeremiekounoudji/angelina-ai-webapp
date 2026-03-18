import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;

export async function GET(req: NextRequest) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ error: "Evolution API not configured" }, { status: 500 });
  }

  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instanceName = req.nextUrl.searchParams.get("instanceName");
  if (!instanceName) {
    return NextResponse.json({ error: "instanceName is required" }, { status: 400 });
  }

  // Verify the user owns an instance with this name
  const { data: instance, error: instError } = await supabase
    .from("whatsapp_instances")
    .select("id, company_id")
    .eq("instance_name", instanceName)
    .single();

  if (instError || !instance) {
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
    const res = await fetch(
      `${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`,
      { headers: { apikey: EVOLUTION_API_KEY } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch status" }, { status: 502 });
    }

    const data = await res.json();
    const connectionStatus = data[0]?.connectionStatus ?? "disconnected";
    return NextResponse.json({ connectionStatus });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
