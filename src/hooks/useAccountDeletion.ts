"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import toast from "react-hot-toast";

export function useAccountDeletion() {
  const supabase = useMemo(() => createClient(), []);
  const { user, company } = useAuth();
  const { t } = useTranslationNamespace("dashboard.settings");
  const [loading, setLoading] = useState(false);

  const requestDeletion = async (reason?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);

      // Check for existing pending request
      const { data: existing } = await supabase
        .from("account_deletion_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

      if (existing) {
        toast.error(t("deleteAccount.alreadyPending") as string);
        return false;
      }

      const { error } = await supabase
        .from("account_deletion_requests")
        .insert({
          user_id: user.id,
          company_id: company?.id ?? null,
          reason: reason?.trim() || null,
          status: "pending",
        });

      if (error) throw error;

      toast.success(t("deleteAccount.success") as string);
      return true;
    } catch {
      toast.error(t("deleteAccount.errors.failed") as string);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { requestDeletion, loading };
}
