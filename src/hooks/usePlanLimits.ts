"use client";

import { useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store";
import { PlanLimits } from "@/types/database";
import toast from 'react-hot-toast';
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export function usePlanLimits(companyId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const { t } = useTranslationNamespace('hooks.planLimits');
  
  const {
    planLimits,
    setPlanLimits,
    loading,
    setLoading,
    errors,
    setError,
  } = useAppStore();

  const fetchLimits = useCallback(async (forceRefresh = false) => {
    if (!companyId) return;

    // Return cached data if available and not forcing refresh
    if (planLimits && !forceRefresh) {
      return planLimits;
    }

    try {
      setLoading('planLimits', true);
      setError('planLimits', null);

      const { data, error: limitsError } = await supabase.rpc('get_company_limits', {
        company_uuid: companyId
      });

      if (limitsError) throw limitsError;

      if (data && data.length > 0) {
        setPlanLimits(data[0]);
        return data[0];
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.limitExceeded');
      console.log(error);
      
      setError('planLimits', errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading('planLimits', false);
    }
  }, [companyId, planLimits, setPlanLimits, setLoading, setError, t]);

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
  }, [companyId, t]);

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
  }, [companyId, t]);

  // Auto-fetch on mount if no data
  useEffect(() => {
    if (companyId && !planLimits && !loading.planLimits) {
      fetchLimits();
    }
  }, [companyId, planLimits, loading.planLimits]);

  return {
    limits: planLimits,
    loading: loading.planLimits,
    error: errors.planLimits,
    canAddUser,
    canAddProduct,
    refetch: () => fetchLimits(true),
  };
}