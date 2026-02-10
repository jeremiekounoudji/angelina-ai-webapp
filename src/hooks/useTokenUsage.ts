"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store";
import toast from 'react-hot-toast';

export function useTokenUsage(companyId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  
  // Use selectors to get stable references
  const tokenUsage = useAppStore((state) => state.tokenUsage);
  const tokenPurchases = useAppStore((state) => state.tokenPurchases);
  const addTokenPurchase = useAppStore((state) => state.addTokenPurchase);
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
        // Refresh usage data
        await fetchTokenUsage(true);
        toast.success(`${tokensToConsume} tokens consumed`);
        return true;
      }
      
      toast.error('Not enough tokens available');
      return false; // Not enough tokens
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to consume tokens';
      toast.error(errorMessage);
      return false;
    }
  }, [companyId, supabase, fetchTokenUsage]);

  const purchaseTokens = useCallback(async (tokenAmount: number, paymentData: {
    amount: number;
    currency?: string;
    transactionId?: string;
  }) => {
    if (!companyId) return false;

    try {
      const { data, error } = await supabase
        .from("token_purchases")
        .insert({
          company_id: companyId,
          tokens_purchased: tokenAmount,
          amount_paid: paymentData.amount,
          currency: paymentData.currency || 'USD',
          transaction_id: paymentData.transactionId,
          payment_status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      addTokenPurchase(data);

      // Update current usage with purchased tokens
      if (tokenUsage) {
        const { error: updateError } = await supabase
          .from("token_usage")
          .update({
            tokens_purchased: tokenUsage.tokens_purchased + tokenAmount,
            tokens_remaining: tokenUsage.tokens_remaining + tokenAmount
          })
          .eq("id", tokenUsage.id);

        if (updateError) throw updateError;
      }

      // Refresh data
      await fetchTokenUsage(true);
      toast.success(`${tokenAmount.toLocaleString()} tokens purchased successfully`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to purchase tokens';
      toast.error(errorMessage);
      return false;
    }
  }, [companyId, supabase, tokenUsage, addTokenPurchase, fetchTokenUsage]);

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
    purchaseTokens,
    refetch: () => fetchTokenUsage(true),
  };
}