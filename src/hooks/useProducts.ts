"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { Product } from "@/types/database";
import toast from "react-hot-toast";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export function useProducts() {
  const supabase = useMemo(() => createClient(), []);
  const { company } = useAuth();
  const { t } = useTranslationNamespace('hooks.products');
  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  // Use selectors to get stable references
  const products = useAppStore((state) => state.products);
  const addProduct = useAppStore((state) => state.addProduct);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const removeProduct = useAppStore((state) => state.removeProduct);
  const loading = useAppStore((state) => state.loading.products);
  const error = useAppStore((state) => state.errors.products);

  const fetchProducts = useCallback(
    async (forceRefresh = false) => {
      const companyId = company?.id;
      if (!companyId) return;

      // Check if we've already fetched for this company
      if (!forceRefresh && hasFetchedRef.current && currentCompanyIdRef.current === companyId) {
        return;
      }

      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        return;
      }

      try {
        isFetchingRef.current = true;
        useAppStore.getState().setLoading("products", true);
        useAppStore.getState().setError("products", null);

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        useAppStore.getState().setProducts(data || []);
        hasFetchedRef.current = true;
        currentCompanyIdRef.current = companyId;
        return data || [];
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.loadFailed');
        useAppStore.getState().setError("products", errorMessage);
        toast.error(errorMessage);
        return [];
      } finally {
        isFetchingRef.current = false;
        useAppStore.getState().setLoading("products", false);
      }
    },
    [company?.id, supabase, t]
  );

  const createProduct = useCallback(
    async (productData: Omit<Product, "id" | "created_at" | "company_id">) => {
      const companyId = company?.id;
      if (!companyId) {
        toast.error(t('errors.createFailed'));
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .insert({
            ...productData,
            company_id: companyId,
          })
          .select()
          .single();

        if (error) throw error;

        addProduct(data);
        toast.success(t('success.created'));
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.createFailed');
        toast.error(errorMessage);
        return null;
      }
    },
    [addProduct, company?.id, supabase, t]
  );

  const editProduct = useCallback(
    async (productId: string, productData: Partial<Product>) => {
      try {
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId)
          .select()
          .single();

        if (error) throw error;

        updateProduct(productId, data);
        toast.success(t('success.updated'));
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.updateFailed');
        toast.error(errorMessage);
        return null;
      }
    },
    [supabase, t, updateProduct]
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) throw error;

        removeProduct(productId);
        toast.success(t('success.deleted'));
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.deleteFailed');
        toast.error(errorMessage);
        return false;
      }
    },
    [removeProduct, supabase, t]
  );

  // Store fetchProducts in a ref to avoid dependency issues
  const fetchProductsRef = useRef(fetchProducts);
  fetchProductsRef.current = fetchProducts;

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
      fetchProductsRef.current();
    }
    
    // Cleanup: ensure loading is false if component unmounts during fetch
    return () => {
      if (isFetchingRef.current) {
        useAppStore.getState().setLoading('products', false);
      }
    };
  }, [company?.id]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    editProduct,
    deleteProduct,
    refetch: () => fetchProducts(true),
  };
}
