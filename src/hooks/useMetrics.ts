"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { Metrics } from "@/types/database";
import toast from "react-hot-toast";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export function useMetrics() {
  const supabase = useMemo(() => createClient(), []);
  const { company } = useAuth();
  const { t } = useTranslationNamespace("hooks.metrics");
  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  // Use selectors to get stable references
  const metrics = useAppStore((state) => state.metrics);
  const loading = useAppStore((state) => state.loading.metrics);
  const error = useAppStore((state) => state.errors.metrics);

  const fetchMetrics = useCallback(
    async (companyId?: string, forceRefresh = false) => {
      const targetCompanyId = companyId || company?.id;
      if (!targetCompanyId) return null;

      // Check if we've already fetched for this company
      if (
        !forceRefresh &&
        hasFetchedRef.current &&
        currentCompanyIdRef.current === targetCompanyId
      ) {
        return metrics;
      }

      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        return null;
      }

      try {
        isFetchingRef.current = true;
        useAppStore.getState().setLoading("metrics", true);
        useAppStore.getState().setError("metrics", null);

        const { data, error } = await supabase
          .from("metrics")
          .select("*")
          .eq("company_id", targetCompanyId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        useAppStore.getState().setMetrics(data);
        hasFetchedRef.current = true;
        currentCompanyIdRef.current = targetCompanyId;
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.loadFailed");
        useAppStore.getState().setError("metrics", errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        useAppStore.getState().setLoading("metrics", false);
        isFetchingRef.current = false;
      }
    },
    [company?.id, t, supabase, metrics]
  );

  const updateMetrics = useCallback(
    async (companyId: string, updates: Partial<Metrics>) => {
      try {
        const { data, error } = await supabase
          .from("metrics")
          .update(updates)
          .eq("company_id", companyId)
          .select()
          .single();

        if (error) throw error;

        useAppStore.getState().setMetrics(data);
        toast.success("Metrics updated successfully");
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update metrics";
        toast.error(errorMessage);
        return null;
      }
    },
    [supabase]
  );

  const incrementMetric = useCallback(
    async (
      companyId: string,
      metric: keyof Pick<
        Metrics,
        | "messages_sent_total"
        | "products_created_total"
        | "users_created_total"
        | "prospects_contacted_total"
      >,
      increment = 1
    ) => {
      try {
        const { data, error } = await supabase.rpc("increment_metric", {
          company_uuid: companyId,
          metric_name: metric,
          increment_by: increment,
        });

        if (error) throw error;

        // Refresh metrics after increment
        await fetchMetrics(companyId, true);
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to increment ${metric}`;
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchMetrics, supabase]
  );

  // Store fetchMetrics in a ref to avoid dependency issues
  const fetchMetricsRef = useRef(fetchMetrics);
  fetchMetricsRef.current = fetchMetrics;

  // Reset tracking when company changes
  useEffect(() => {
    if (company?.id !== currentCompanyIdRef.current) {
      hasFetchedRef.current = false;
      currentCompanyIdRef.current = null;
    }
  }, [company?.id]);

  // Simple effect - only fetch once per company
  useEffect(() => {
    if (company?.id && !hasFetchedRef.current && !isFetchingRef.current) {
      fetchMetricsRef.current();
    }

    // Cleanup: ensure loading is false if component unmounts during fetch
    return () => {
      if (isFetchingRef.current) {
        useAppStore.getState().setLoading("metrics", false);
      }
    };
  }, [company?.id]);

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    updateMetrics,
    incrementMetric,
    refetch: () => fetchMetrics(undefined, true),
  };
}
