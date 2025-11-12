"use client";

import { useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { User } from "@/types/database";
import toast from 'react-hot-toast';

export function useUsers() {
  const supabase = createClient();
  const { company } = useAuth();
  
  const {
    users,
    setUsers,
    addUser,
    updateUser,
    removeUser,
    loading,
    setLoading,
    errors,
    setError,
  } = useAppStore();

  const fetchUsers = useCallback(async (forceRefresh = false) => {
    if (!company?.id) return;

    // Return cached data if available and not forcing refresh
    if (users.length > 0 && !forceRefresh) {
      return users;
    }

    try {
      setLoading('users', true);
      setError('users', null);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      setError('users', errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading('users', false);
    }
  }, [company?.id, users, supabase, setUsers, setLoading, setError]);

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

  // Auto-fetch on mount if no data
  useEffect(() => {
    if (company?.id && users.length === 0 && !loading.users) {
      fetchUsers();
    }
  }, [company?.id, users.length, loading.users, fetchUsers]);

  return {
    users,
    loading: loading.users,
    error: errors.users,
    fetchUsers,
    createUser,
    editUser,
    deleteUser,
    refetch: () => fetchUsers(true),
  };
}