"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { SubscriptionPlan, Payment } from "@/types/database";
import toast from "react-hot-toast";

const FETCH_TIMEOUT = 15000; // 15 seconds

export function useSubscriptions() {
  // Stable client — must not be recreated on every render
  const [supabase] = useState(() => createClient());
  const { company } = useAuth();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    subscriptionPlans,
    setSubscriptionPlans,
    payments,
    setPayments,
    errors,
    setError,
  } = useAppStore();

  // Use refs to access latest values inside callbacks without adding them to deps
  const subscriptionPlansRef = useRef(subscriptionPlans);
  subscriptionPlansRef.current = subscriptionPlans;
  const paymentsRef = useRef(payments);
  paymentsRef.current = payments;

  const fetchPlans = useCallback(
    async (forceRefresh = false) => {
      if (subscriptionPlansRef.current.length > 0 && !forceRefresh) {
        setLoading(false);
        return subscriptionPlansRef.current;
      }

      try {
        setLoading(true);
        setError("subscriptionPlans", null);

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error("Request timeout. Please check your connection."));
          }, FETCH_TIMEOUT);
        });

        // Fetch with timeout
        const fetchPromise = supabase
          .from("subscription_plans")
          .select(
            `
          *,
          subscription_features (
            id,
            feature,
            feature_fr
          )
        `
          )
          .order("price_monthly", { ascending: true });

        const { data: plansData, error: plansError } = await Promise.race([
          fetchPromise,
          timeoutPromise,
        ]);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (plansError) throw plansError;

        const transformedPlans: SubscriptionPlan[] =
          plansData?.map((plan: any) => ({
            ...plan,
            features: plan.subscription_features || [],
          })) || [];

        setSubscriptionPlans(transformedPlans);
        setLoading(false);
        return transformedPlans;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription plans";

        setError("subscriptionPlans", errorMessage);
        setLoading(false);
        toast.error(errorMessage);
        return [];
      } finally {
        setLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    },
    [setError, setSubscriptionPlans, supabase]
  );

  const fetchPayments = useCallback(
    async (forceRefresh = false) => {
      if (!company?.id) return;

      if (paymentsRef.current.length > 0 && !forceRefresh) {
        return paymentsRef.current;
      }

      try {
        setLoading(true);
        setError("payments", null);

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error("Request timeout. Please check your connection."));
          }, FETCH_TIMEOUT);
        });

        const fetchPromise = supabase
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

        const { data: paymentsData, error: paymentsError } = await Promise.race(
          [fetchPromise, timeoutPromise]
        );

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (paymentsError) throw paymentsError;

        const transformedPayments: Payment[] =
          paymentsData?.map((payment: any) => ({
            ...payment,
            plan: payment.subscription_plans,
          })) || [];

        setPayments(transformedPayments);
        return transformedPayments;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch payments";
        setError("payments", errorMessage);
        toast.error(errorMessage);
        return [];
      } finally {
        setLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    },
    [company?.id, setPayments, setError, supabase]
  );

  // Run once on mount (or when company becomes available) — refs handle the cache check
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (company?.id) {
      fetchPayments();
    }
  }, [company?.id, fetchPayments]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    plans: subscriptionPlans,
    payments,
    loading,
    error: errors.subscriptionPlans || errors.payments,
    refetchPlans: () => fetchPlans(true),
    refetchPayments: () => fetchPayments(true),
    refetch: () => {
      fetchPlans(true);
      fetchPayments(true);
    },
  };
}
