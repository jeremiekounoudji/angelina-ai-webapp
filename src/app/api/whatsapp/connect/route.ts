import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;

const BodySchema = z.object({
  phoneNumber: z.string().min(10).max(15).regex(/^\d+$/),
  companyId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ error: "Evolution API not configured" }, { status: 500 });
  }

  // Verify authenticated session
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

  const { phoneNumber, companyId } = parsed.data;

  // Verify the user owns this company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("user_id", user.id)
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 1. Cleanup old instances in DB and Evolution API
    const { data: existingInstances } = await supabase
      .from("whatsapp_instances")
      .select("instance_name")
      .eq("company_id", companyId);

    if (existingInstances?.length) {
      for (const inst of existingInstances) {
        await fetch(`${EVOLUTION_API_URL}/instance/delete/${inst.instance_name}`, {
          method: "DELETE",
          headers: { apikey: EVOLUTION_API_KEY },
        }).catch(() => null);
      }
      await supabase.from("whatsapp_instances").delete().eq("company_id", companyId);
    }

    // 2. Create new instance
    const instanceName = `company_${companyId}}_MERRYELODJICK`;
    const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
      body: JSON.stringify({ instanceName, integration: "WHATSAPP-BAILEYS", qrcode: true }),
    });

    if (!createRes.ok) {
      return NextResponse.json({ error: "Failed to create WhatsApp instance" }, { status: 502 });
    }

    const instanceData = await createRes.json();

    // 3. Wait briefly then restart
    await new Promise((r) => setTimeout(r, 2000));
    await fetch(`${EVOLUTION_API_URL}/instance/restart/${instanceName}`, {
      method: "PUT",
      headers: { apikey: EVOLUTION_API_KEY },
    }).catch(() => null);

    // 4. Poll for QR code (up to 10 attempts)
    let qrCodeData = "";
    let pairingCode = "";
    for (let i = 0; i < 10; i++) {
      const connRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
        headers: { apikey: EVOLUTION_API_KEY },
      });
      if (connRes.ok) {
        const connData = await connRes.json();
        if (connData.code || connData.base64) {
          qrCodeData = connData.code || connData.base64;
          break;
        }
        if (connData.pairingCode) {
          pairingCode = connData.pairingCode;
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 1000 + i * 500));
    }

    // Fallback: try pairing code
    if (!qrCodeData && !pairingCode) {
      const pairRes = await fetch(
        `${EVOLUTION_API_URL}/instance/connect/${instanceName}?number=${phoneNumber}`,
        { headers: { apikey: EVOLUTION_API_KEY } }
      ).catch(() => null);
      if (pairRes?.ok) {
        const pairData = await pairRes.json();
        pairingCode = pairData.pairingCode || "";
      }
    }

    // 5. Save to DB — encrypt the API key before persisting
    const encryptedApiKey = instanceData.hash
      ? await encrypt(instanceData.hash)
      : null;

    const { data: savedInstance, error: dbError } = await supabase
      .from("whatsapp_instances")
      .insert({
        company_id: companyId,
        instance_name: instanceData.instance.instanceName,
        instance_id: instanceData.instance.instanceId,
        phone_number: phoneNumber,
        status: "connecting",
        pairing_code: pairingCode,
        api_key: encryptedApiKey,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: "Failed to save instance" }, { status: 500 });
    }

    return NextResponse.json({
      instanceId: savedInstance.id,
      evolutionInstanceId: savedInstance.instance_id,
      instanceName,
      qrCodeData,
      pairingCode,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
