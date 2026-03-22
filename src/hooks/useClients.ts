import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Client = Database['public']['Tables']['clients']['Row'];

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('company_name');
    if (error) setError(error.message);
    else setClients(data || []);
    setLoading(false);
  }, []);

  const getById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const create = useCallback(async (newClient: Omit<Client, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('clients')
      .insert(newClient)
      .select()
      .single();
    if (error) throw error;
    getAll();
    return data;
  }, [getAll]);

  const update = useCallback(async (id: string, updates: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients')
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
      .from('clients')
      .delete()
      .eq('id', id);
    if (error) throw error;
    getAll();
  }, [getAll]);

  useEffect(() => {
    getAll();

    const subscription = supabase
      .channel('clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => getAll())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [getAll]);

  return {
    clients,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    del,
  };
}

