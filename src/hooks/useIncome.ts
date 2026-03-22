import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Income = Database['public']['Tables']['income']['Row'];

export function useIncome() {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .order('date', { ascending: false });
    if (error) setError(error.message);
    else setIncome(data || []);
    setLoading(false);
  }, []);

  const getById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const create = useCallback(async (newIncome: Omit<Income, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('income')
      .insert(newIncome)
      .select()
      .single();
    if (error) throw error;
    getAll();
    return data;
  }, [getAll]);

  const update = useCallback(async (id: string, updates: Partial<Income>) => {
    const { data, error } = await supabase
      .from('income')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    getAll();
    return data;
  }, [getAll]);

  const del = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id);
    if (error) throw error;
    getAll();
  }, [getAll]);

  useEffect(() => {
    getAll();

    const subscription = supabase
      .channel('income')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'income' }, () => getAll())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [getAll]);

  return {
    income,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    del,
  };
}

