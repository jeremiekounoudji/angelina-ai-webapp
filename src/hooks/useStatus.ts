"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { Status } from "@/types/database";
import toast from "react-hot-toast";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export function useStatus(companyId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const { company } = useAuth();
  const { t } = useTranslationNamespace("hooks.status");

  const resolvedCompanyId = companyId ?? company?.id;

  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const statuses = useAppStore((s) => s.statuses);
  const addStatusToStore = useAppStore((s) => s.addStatus);
  const updateStatusInStore = useAppStore((s) => s.updateStatus);
  const removeStatusFromStore = useAppStore((s) => s.removeStatus);
  const loading = useAppStore((s) => s.loading.statuses);
  const error = useAppStore((s) => s.errors.statuses);

  const fetchStatuses = useCallback(
    async (forceRefresh = false) => {
      if (!resolvedCompanyId) return;

      if (!forceRefresh && hasFetchedRef.current && currentCompanyIdRef.current === resolvedCompanyId) {
        return;
      }

      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        useAppStore.getState().setLoading("statuses", true);
        useAppStore.getState().setError("statuses", null);

        const { data, error } = await supabase
          .from("status")
          .select("*")
          .eq("company_id", resolvedCompanyId)
          .order("position", { ascending: true });

        if (error) throw error;

        useAppStore.getState().setStatuses(data || []);
        hasFetchedRef.current = true;
        currentCompanyIdRef.current = resolvedCompanyId;
        return data || [];
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("errors.fetchFailed");
        useAppStore.getState().setError("statuses", msg);
        toast.error(msg);
        return [];
      } finally {
        isFetchingRef.current = false;
        useAppStore.getState().setLoading("statuses", false);
      }
    },
    [resolvedCompanyId, supabase, t]
  );

  const createStatus = useCallback(
    async (statusData: Omit<Status, "id" | "created_at" | "updated_at">) => {
      if (!resolvedCompanyId) return null;

      try {
        const { data: canAdd, error: checkError } = await supabase.rpc("can_add_status", {
          company_uuid: resolvedCompanyId,
        });
        if (checkError) throw checkError;
        if (!canAdd) { toast.error(t("errors.limitReached")); return null; }

        const { data, error } = await supabase
          .from("status")
          .insert([statusData])
          .select()
          .single();

        if (error) throw error;

        addStatusToStore(data);
        toast.success(t("success.created"));
        // Force refetch to get server-computed fields (next_post_at, etc.)
        await fetchStatuses(true);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("errors.createFailed");
        toast.error(msg);
        return null;
      }
    },
    [resolvedCompanyId, supabase, t, addStatusToStore, fetchStatuses]
  );

  const updateStatus = useCallback(
    async (id: string, updates: Partial<Status>) => {
      if (!resolvedCompanyId) return null;

      try {
        const { data, error } = await supabase
          .from("status")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("company_id", resolvedCompanyId)
          .select()
          .single();

        if (error) throw error;

        updateStatusInStore(id, data);
        toast.success(t("success.updated"));
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("errors.updateFailed");
        toast.error(msg);
        return null;
      }
    },
    [resolvedCompanyId, supabase, t, updateStatusInStore]
  );

  const deleteStatus = useCallback(
    async (id: string) => {
      if (!resolvedCompanyId) return false;

      try {
        const { error } = await supabase
          .from("status")
          .delete()
          .eq("id", id)
          .eq("company_id", resolvedCompanyId);

        if (error) throw error;

        removeStatusFromStore(id);
        toast.success(t("success.deleted"));
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("errors.deleteFailed");
        toast.error(msg);
        return false;
      }
    },
    [resolvedCompanyId, supabase, t, removeStatusFromStore]
  );

  const fetchStatusesRef = useRef(fetchStatuses);
  fetchStatusesRef.current = fetchStatuses;

  // Reset tracking when company changes
  useEffect(() => {
    if (resolvedCompanyId !== currentCompanyIdRef.current) {
      hasFetchedRef.current = false;
      currentCompanyIdRef.current = null;
    }
  }, [resolvedCompanyId]);

  // Fetch once per company
  useEffect(() => {
    if (resolvedCompanyId && !hasFetchedRef.current && !isFetchingRef.current) {
      fetchStatusesRef.current();
    }

    return () => {
      if (isFetchingRef.current) {
        useAppStore.getState().setLoading("statuses", false);
      }
    };
  }, [resolvedCompanyId]);

  return {
    statuses,
    loading,
    error,
    fetchStatuses,
    createStatus,
    updateStatus,
    deleteStatus,
    refetch: () => fetchStatuses(true),
  };
}
