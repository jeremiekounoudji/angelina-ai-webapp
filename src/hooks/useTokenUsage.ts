"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store";
import toast from 'react-hot-toast';
import { createTranslationFunction, DEFAULT_LOCALE, type Locale } from "@/locales";

function getT() {
  const locale = (typeof window !== 'undefined' ? localStorage.getItem('locale') : null) as Locale | null;
  return createTranslationFunction(locale ?? DEFAULT_LOCALE);
}

export function useTokenUsage(companyId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  
  // Use selectors to get stable references
  const tokenUsage = useAppStore((state) => state.tokenUsage);
  const tokenPurchases = useAppStore((state) => state.tokenPurchases);
  const loading = useAppStore((state) => state.loading.tokenUsage);
  const error = useAppStore((state) => state.errors.tokenUsage);

  const fetchTokenUsage = useCallback(async (forceRefresh = false) => {
    if (!companyId) return;

    // Check if we've already fetched for this company
    if (!forceRefresh && hasFetchedRef.current && currentCompanyIdRef.current === companyId) {
      return { usage: tokenUsage, purchases: tokenPurchases };
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      useAppStore.getState().setLoading('tokenUsage', true);
      useAppStore.getState().setError('tokenUsage', null);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Fetch current month usage
      const { data: usageData, error: usageError } = await supabase
        .from("token_usage")
        .select("*")
        .eq("company_id", companyId)
        .eq("usage_month", currentMonth)
        .eq("usage_year", currentYear)
       ;

      if (usageError && usageError.code !== 'PGRST116') {
        throw usageError;
      }

      useAppStore.getState().setTokenUsage(usageData);

      // Fetch purchase history
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("token_purchases")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false})
        .limit(10);

      if (purchasesError) throw purchasesError;

      useAppStore.getState().setTokenPurchases(purchasesData || []);
      hasFetchedRef.current = true;
      currentCompanyIdRef.current = companyId;
      
      return { usage: usageData, purchases: purchasesData || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch token usage';
      useAppStore.getState().setError('tokenUsage', errorMessage);
      toast.error(errorMessage);
      return { usage: null, purchases: [] };
    } finally {
      useAppStore.getState().setLoading('tokenUsage', false);
      isFetchingRef.current = false;
    }
  }, [companyId, supabase, tokenUsage, tokenPurchases]);

  const consumeTokens = useCallback(async (tokensToConsume: number) => {
    if (!companyId) return false;

    try {
      const { data, error } = await supabase.rpc('update_token_usage', {
        company_uuid: companyId,
        tokens_consumed: tokensToConsume
      });

      if (error) throw error;

      if (data) {
        await fetchTokenUsage(true);
        toast.success(getT()('hooks.tokens.success.consumed', { count: tokensToConsume }));
        return true;
      }

      toast.error(getT()('hooks.tokens.errors.notEnough'));
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : getT()('hooks.tokens.errors.consumeFailed');
      toast.error(errorMessage);
      return false;
    }
  }, [companyId, supabase, fetchTokenUsage]);

  // Token purchases are recorded server-side only (via FedaPay webhook).
  // This client method only refreshes the local cache after a confirmed payment.
  const refreshAfterPurchase = useCallback(async () => {
    await fetchTokenUsage(true);
  }, [fetchTokenUsage]);

  // Store fetchTokenUsage in a ref to avoid dependency issues
  const fetchTokenUsageRef = useRef(fetchTokenUsage);
  fetchTokenUsageRef.current = fetchTokenUsage;

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
      fetchTokenUsageRef.current();
    }
    
    // Cleanup: ensure loading is false if component unmounts during fetch
    return () => {
      if (isFetchingRef.current) {
        useAppStore.getState().setLoading('tokenUsage', false);
      }
    };
  }, [companyId]);

  return {
    usage: tokenUsage,
    purchases: tokenPurchases,
    loading,
    error,
    consumeTokens,
    refreshAfterPurchase,
    refetch: () => fetchTokenUsage(true),
  };
}