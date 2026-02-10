"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { SubscriptionPlan, Payment } from "@/types/database";
import toast from "react-hot-toast";

export function useSubscriptions() {
  const supabase = createClient();
  // useMemo(() => createClient(), []);
  const { company } = useAuth();
  // create loading state here
  const [loading, setLoading] = useState(false)

  const {
    subscriptionPlans,
    setSubscriptionPlans,
    payments,
    setPayments,
    // loading,
    // setLoading,
    errors,
    setError,
  } = useAppStore();

  const fetchPlans = 
  useCallback(async (forceRefresh = false) => {
    // Return cached data if available and not forcing refresh
    console.log("debug-1");

    if (subscriptionPlans.length > 0 && !forceRefresh) {
      setLoading( false);

      return subscriptionPlans;
    }

    try {
      console.log("debug-2");

      setLoading( true);
      setError("subscriptionPlans", null);

      // Fetch subscription plans with their features
        console.log("debug 3-a");

      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select(
          `
          *,
          subscription_features (
            id,
            feature
          )
        `
        )
        .order("price_monthly", { ascending: true });

        console.log("debug 3-a");
        
      if (plansError) throw plansError;

      // Transform the data to match our interface
      const transformedPlans: SubscriptionPlan[] =
        plansData?.map(
          (plan: SubscriptionPlan & { subscription_features?: string[] }) => ({
            ...plan,
            features: plan.subscription_features || [],
          })
        ) || [];
console.log("debug-3",transformedPlans);

      setSubscriptionPlans(transformedPlans);
      console.log("Fetched subscription plans:", transformedPlans);
      setLoading( false);
      return transformedPlans;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch subscription plans";

      console.log("error", errorMessage);

      setError("subscriptionPlans", errorMessage);
      setLoading( false);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading( false);
    }
  }, [setError, setLoading, setSubscriptionPlans, subscriptionPlans, supabase]);

  const fetchPayments = useCallback(
    async (forceRefresh = false) => {
      if (!company?.id) return;

      // Return cached data if available and not forcing refresh
      if (payments.length > 0 && !forceRefresh) {
        return payments;
      }

      try {
        setLoading(true);
        setError("payments", null);

        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select(
            `
          *,
          subscription_plans (
            id,
            title,
            price_monthly
          )
        `
          )
          .eq("company_id", company.id)
          .order("created_at", { ascending: false });

        if (paymentsError) throw paymentsError;

        const transformedPayments: Payment[] =
          paymentsData?.map(
            (payment: Payment & { subscription_plans?: SubscriptionPlan }) => ({
              ...payment,
              plan: payment.subscription_plans,
            })
          ) || [];
        console.log("debug-1");

        setPayments(transformedPayments);
        return transformedPayments;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch payments";
        setError("payments", errorMessage);
        toast.error(errorMessage);
        console.log("debug-1");

        return [];
      } finally {
        setLoading( false);
      }
    },
    [company?.id, payments, setPayments, setLoading, setError, supabase]
  );

  // Auto-fetch on mount if no data
  useEffect(() => {
    if (subscriptionPlans.length === 0 && !loading) {
      console.log("Fetching subscription plan:", subscriptionPlans);

      fetchPlans();
    }
  }, [subscriptionPlans, loading, fetchPlans]);

  useEffect(() => {
    if (company?.id && payments.length === 0 && !loading) {
      console.log("Fetching payments for company:", company.id);
      fetchPayments();
    }
  }, [company?.id, payments.length, loading, fetchPayments]);

  return {
    plans: subscriptionPlans,
    payments,
    loading: loading || loading,
    error: errors.subscriptionPlans || errors.payments,
    refetchPlans: () => fetchPlans(true),
    refetchPayments: () => fetchPayments(true),
    refetch: () => {
      fetchPlans(true);
      fetchPayments(true);
    },
  };
}
