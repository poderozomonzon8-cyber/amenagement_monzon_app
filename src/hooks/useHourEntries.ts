import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type HourEntry = Database['public']['Tables']['hour_entries']['Row'];

export function useHourEntries() {
  const [entries, setEntries] = useState<HourEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hour_entries')
      .select('*, employee:employees(first_name, last_name), project:projects(title)');
    if (error) setError(error.message);
    else setEntries(data || []);
    setLoading(false);
  }, []);

  const getById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('hour_entries')
      .select('*, employee:employees(first_name, last_name), project:projects(title)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const create = useCallback(async (newEntry: Omit<HourEntry, 'id' | 'created_at'> & { totalCost?: number }) => {
    const { data, error } = await supabase
      .from('hour_entries')
      .insert(newEntry)
      .select()
      .single();
    if (error) throw error;
    getAll();
    return data;
  }, [getAll]);

  const update = useCallback(async (id: string, updates: Partial<HourEntry>) => {
    const { data, error } = await supabase
      .from('hour_entries')
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
      .from('hour_entries')
      .delete()
      .eq('id', id);
    if (error) throw error;
    getAll();
  }, [getAll]);

  useEffect(() => {
    getAll();

    const subscription = supabase
      .channel('hour_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hour_entries' }, () => getAll())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [getAll]);

  return {
    entries,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    del,
  };
}

