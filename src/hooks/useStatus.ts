"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Status } from "@/types/database";
import toast from "react-hot-toast";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export function useStatus(companyId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const { t } = useTranslationNamespace('hooks.status');
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("status")
        .select("*")
        .eq("company_id", companyId)
        .order("position", { ascending: true });

      if (fetchError) throw fetchError;

      setStatuses(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.fetchFailed');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [companyId, supabase, t]);

  const createStatus = useCallback(
    async (statusData: Omit<Status, "id" | "created_at" | "updated_at">) => {
      if (!companyId) return null;

      try {
        setLoading(true);

        // Check if can add status
        const { data: canAdd, error: checkError } = await supabase.rpc(
          "can_add_status",
          { company_uuid: companyId }
        );

        if (checkError) throw checkError;
        if (!canAdd) {
          toast.error(t('errors.limitReached'));
          return null;
        }

        const { data, error: insertError } = await supabase
          .from("status")
          .insert([statusData])
          .select()
          .single();

        if (insertError) throw insertError;

        // Update metrics
        await supabase.rpc("increment_status_count", {
          company_uuid: companyId
        });

        toast.success(t('success.created'));
        await fetchStatuses();
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('errors.createFailed');
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [companyId, supabase, t, fetchStatuses]
  );

  const updateStatus = useCallback(
    async (id: string, updates: Partial<Status>) => {
      try {
        setLoading(true);

        const { data, error: updateError } = await supabase
          .from("status")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;

        toast.success(t('success.updated'));
        await fetchStatuses();
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('errors.updateFailed');
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase, t, fetchStatuses]
  );

  const deleteStatus = useCallback(
    async (id: string) => {
      if (!companyId) return false;

      try {
        setLoading(true);

        const { error: deleteError } = await supabase
          .from("status")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        // Decrement metrics
        await supabase.rpc("decrement_status_count", {
          company_uuid: companyId
        });

        toast.success(t('success.deleted'));
        await fetchStatuses();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('errors.deleteFailed');
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [companyId, supabase, t, fetchStatuses]
  );

  useEffect(() => {
    if (companyId) {
      fetchStatuses();
    }
  }, [companyId, fetchStatuses]);

  return {
    statuses,
    loading,
    error,
    createStatus,
    updateStatus,
    deleteStatus,
    refetch: fetchStatuses,
  };
}
