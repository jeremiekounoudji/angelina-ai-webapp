"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store";
import toast from 'react-hot-toast';
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export function usePlanLimits(companyId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const { t } = useTranslationNamespace('hooks.planLimits');
  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  
  // Use selectors to get stable references
  const planLimits = useAppStore((state) => state.planLimits);
  const loading = useAppStore((state) => state.loading.planLimits);
  const error = useAppStore((state) => state.errors.planLimits);

  const fetchLimits = useCallback(async (forceRefresh = false) => {
    if (!companyId) return;

    // Check if we've already fetched for this company
    if (!forceRefresh && hasFetchedRef.current && currentCompanyIdRef.current === companyId) {
      return planLimits;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      useAppStore.getState().setLoading('planLimits', true);
      useAppStore.getState().setError('planLimits', null);

      const { data, error: limitsError } = await supabase.rpc('get_company_limits', {
        company_uuid: companyId
      });

      if (limitsError) throw limitsError;

      if (data && data.length > 0) {
        useAppStore.getState().setPlanLimits(data[0]);
        hasFetchedRef.current = true;
        currentCompanyIdRef.current = companyId;
        return data[0];
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.limitExceeded');
      console.log(error);
      
      useAppStore.getState().setError('planLimits', errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      useAppStore.getState().setLoading('planLimits', false);
      isFetchingRef.current = false;
    }
  }, [companyId, t, supabase, planLimits]);

  const canAddUser = useCallback(async (): Promise<boolean> => {
    if (!companyId) return false;

    try {
      const { data, error } = await supabase.rpc('can_add_user', {
        company_uuid: companyId
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.userLimitReached');
      console.log(error);
      
      toast.error(errorMessage);
      return false;
    }
  }, [companyId, t, supabase]);

  const canAddProduct = useCallback(async (): Promise<boolean> => {
    if (!companyId) return false;

    try {
      const { data, error } = await supabase.rpc('can_add_product', {
        company_uuid: companyId
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.limitExceeded');
      
      console.log(error);
      toast.error(errorMessage);
      return false;
    }
  }, [companyId, t, supabase]);

  // Store fetchLimits in a ref to avoid dependency issues
  const fetchLimitsRef = useRef(fetchLimits);
  fetchLimitsRef.current = fetchLimits;

  // Reset tracking when company changes
  useEffect(() => {
    if (companyId !== currentCompanyIdRef.current) {
      hasFetchedRef.current = false;
      currentCompanyIdRef.current = null;
    }
  }, [companyId]);

  // Simple effect - only fetch once per company
  useEffect(() => {
    if (companyId && !hasFetchedRef.current && !isFetchingRef.current) {
      fetchLimitsRef.current();
    }
    
    // Cleanup: ensure loading is false if component unmounts during fetch
    return () => {
      if (isFetchingRef.current) {
        useAppStore.getState().setLoading('planLimits', false);
      }
    };
  }, [companyId]);

  return {
    limits: planLimits,
    loading,
    error,
    canAddUser,
    canAddProduct,
    refetch: () => fetchLimits(true),
  };
}