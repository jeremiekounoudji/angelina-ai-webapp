"use client";

import { useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { Metrics } from "@/types/database";
import toast from 'react-hot-toast';
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export function useMetrics() {
  const supabase = useMemo(() => createClient(), []);
  const { company } = useAuth();
  const { t } = useTranslationNamespace('hooks.metrics');
  
  const {
    metrics,
    setMetrics,
    loading,
    setLoading,
    errors,
    setError,
  } = useAppStore();

  const fetchMetrics = useCallback(async (companyId?: string, forceRefresh = false) => {
    const targetCompanyId = companyId || company?.id;
    if (!targetCompanyId) return null;

    // Return cached data if available and not forcing refresh
    if (metrics && !forceRefresh) {
      return metrics;
    }

    try {
      setLoading('metrics', true);
      setError('metrics', null);

      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', targetCompanyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setMetrics(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.loadFailed');
      setError('metrics', errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading('metrics', false);
    }
  }, [company?.id, metrics, setMetrics, setLoading, setError, t, supabase]);

  const updateMetrics = useCallback(async (companyId: string, updates: Partial<Metrics>) => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .update(updates)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;

      setMetrics(data);
      toast.success('Metrics updated successfully');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update metrics';
      toast.error(errorMessage);
      return null;
    }
  }, [setMetrics, supabase]);

  const incrementMetric = useCallback(async (
    companyId: string, 
    metric: keyof Pick<Metrics, 'messages_sent_total' | 'products_created_total' | 'users_created_total' | 'prospects_contacted_total'>,
    increment = 1
  ) => {
    try {
      const { data, error } = await supabase.rpc('increment_metric', {
        company_uuid: companyId,
        metric_name: metric,
        increment_by: increment
      });

      if (error) throw error;
      
      // Refresh metrics after increment
      await fetchMetrics(companyId, true);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to increment ${metric}`;
      toast.error(errorMessage);
      return false;
    }
  }, [fetchMetrics, supabase]);

  // Auto-fetch on mount if no data
  useEffect(() => {
    if (company?.id && !metrics && !loading.metrics) {
      fetchMetrics();
    }
  }, [company?.id, metrics, loading.metrics, fetchMetrics]);

  return {
    metrics,
    loading: loading.metrics,
    error: errors.metrics,
    fetchMetrics,
    updateMetrics,
    incrementMetric,
    refetch: () => fetchMetrics(undefined, true),
  };
}