import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Employee = Database['public']['Tables']['employees']['Row'];

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get all
  const getAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('first_name');
    if (error) setError(error.message);
    else setEmployees(data || []);
    setLoading(false);
  }, []);

  // Get by ID
  const getById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  // Create
  const create = useCallback(async (newEmployee: Omit<Employee, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('employees')
      .insert(newEmployee)
      .select()
      .single();
    if (error) throw error;
    getAll(); // refresh
    return data;
  }, [getAll]);

  // Update
  const update = useCallback(async (id: string, updates: Partial<Employee>) => {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    getAll(); // refresh
    return data;
  }, [getAll]);

  // Delete
  const del = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    if (error) throw error;
    getAll(); // refresh
  }, [getAll]);

  // Realtime
  useEffect(() => {
    getAll();

    const subscription = supabase
      .channel('employees')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => getAll())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [getAll]);

  return {
    employees,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    del,
  };
}

