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
  const fetchedCompanyId = useRef<string | null>(null);

  const {
    products,
    setProducts,
    addProduct,
    updateProduct,
    removeProduct,
    loading,
    setLoading,
    errors,
    setError,
  } = useAppStore();

  const fetchProducts = useCallback(
    async (forceRefresh = false) => {
      const companyId = company?.id;
      if (!companyId) return;

      // Prevent duplicate fetches for the same company
      if (!forceRefresh && fetchedCompanyId.current === companyId) {
        return products;
      }

      try {
        setLoading("products", true);
        setError("products", null);

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setProducts(data || []);
        fetchedCompanyId.current = companyId;
        return data || [];
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.loadFailed');
        setError("products", errorMessage);
        toast.error(errorMessage);
        return [];
      } finally {
        setLoading("products", false);
      }
    },
    []
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
    []
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
    []
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
    []
  );

  // Simple effect that only runs when company changes
  useEffect(() => {
    if (company?.id && fetchedCompanyId.current !== company.id) {
      fetchProducts();
    }
  }, [company?.id]);

  return {
    products,
    loading: loading.products,
    error: errors.products,
    fetchProducts,
    createProduct,
    editProduct,
    deleteProduct,
    refetch: () => fetchProducts(true),
  };
}
