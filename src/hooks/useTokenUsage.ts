"use client";

import { useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store";
import { TokenUsage, TokenPurchase } from "@/types/database";
import toast from 'react-hot-toast';

export function useTokenUsage(companyId?: string) {
  const supabase = createClient();
  
  const {
    tokenUsage,
    setTokenUsage,
    tokenPurchases,
    setTokenPurchases,
    addTokenPurchase,
    loading,
    setLoading,
    errors,
    setError,
  } = useAppStore();

  const fetchTokenUsage = useCallback(async (forceRefresh = false) => {
    if (!companyId) return;

    // Return cached data if available and not forcing refresh
    if (tokenUsage && tokenPurchases.length > 0 && !forceRefresh) {
      return { usage: tokenUsage, purchases: tokenPurchases };
    }

    try {
      setLoading('tokenUsage', true);
      setError('tokenUsage', null);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Fetch current month usage
      const { data: usageData, error: usageError } = await supabase
        .from("token_usage")
        .select("*")
        .eq("company_id", companyId)
        .eq("usage_month", currentMonth)
        .eq("usage_year", currentYear)
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        throw usageError;
      }

      setTokenUsage(usageData);

      // Fetch purchase history
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("token_purchases")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (purchasesError) throw purchasesError;

      setTokenPurchases(purchasesData || []);
      
      return { usage: usageData, purchases: purchasesData || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch token usage';
      setError('tokenUsage', errorMessage);
      toast.error(errorMessage);
      return { usage: null, purchases: [] };
    } finally {
      setLoading('tokenUsage', false);
    }
  }, [companyId, tokenUsage, tokenPurchases.length, supabase, setTokenUsage, setTokenPurchases, setLoading, setError]);

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

  // Auto-fetch on mount if no data
  useEffect(() => {
    if (companyId && !tokenUsage && !loading.tokenUsage) {
      fetchTokenUsage();
    }
  }, [companyId, tokenUsage, loading.tokenUsage, fetchTokenUsage]);

  return {
    usage: tokenUsage,
    purchases: tokenPurchases,
    loading: loading.tokenUsage,
    error: errors.tokenUsage,
    consumeTokens,
    purchaseTokens,
    refetch: () => fetchTokenUsage(true),
  };
}