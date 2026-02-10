"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { User } from "@/types/database";
import toast from 'react-hot-toast';

export function useUsers() {
  const supabase = useMemo(() => createClient(), []);
  const { company } = useAuth();
  const hasFetchedRef = useRef(false);
  const currentCompanyIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  
  // Use selectors to get stable references
  const users = useAppStore((state) => state.users);
  const addUser = useAppStore((state) => state.addUser);
  const updateUser = useAppStore((state) => state.updateUser);
  const removeUser = useAppStore((state) => state.removeUser);
  const loading = useAppStore((state) => state.loading.users);
  const error = useAppStore((state) => state.errors.users);

  const fetchUsers = useCallback(async (forceRefresh = false) => {
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
      useAppStore.getState().setLoading('users', true);
      useAppStore.getState().setError('users', null);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      useAppStore.getState().setUsers(data || []);
      hasFetchedRef.current = true;
      currentCompanyIdRef.current = companyId;
      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      useAppStore.getState().setError('users', errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      isFetchingRef.current = false;
      useAppStore.getState().setLoading('users', false);
    }
  }, [company?.id, supabase]);

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'created_at' | 'company_id'>) => {
    if (!company?.id) {
      toast.error('No company selected');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          company_id: company.id,
        })
        .select()
        .single();

      if (error) throw error;

      addUser(data);
      toast.success('User created successfully');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(errorMessage);
      return null;
    }
  }, [company?.id, supabase, addUser]);

  const editUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      updateUser(userId, data);
      toast.success('User updated successfully');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(errorMessage);
      return null;
    }
  }, [supabase, updateUser]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      removeUser(userId);
      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
      return false;
    }
  }, [supabase, removeUser]);

  // Store fetchUsers in a ref to avoid dependency issues
  const fetchUsersRef = useRef(fetchUsers);
  fetchUsersRef.current = fetchUsers;

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
      fetchUsersRef.current();
    }
    
    // Cleanup: ensure loading is false if component unmounts during fetch
    return () => {
      if (isFetchingRef.current) {
        useAppStore.getState().setLoading('users', false);
      }
    };
  }, [company?.id]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    editUser,
    deleteUser,
    refetch: () => fetchUsers(true),
  };
}