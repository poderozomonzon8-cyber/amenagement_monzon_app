import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type ServiceProduct = Database['public']['Tables']['service_products']['Row'];

export function useServiceProducts() {
  const [serviceProducts, setServiceProducts] = useState<ServiceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_products')
      .select('*')
      .order('name');
    if (error) setError(error.message);
    else setServiceProducts(data || []);
    setLoading(false);
  }, []);

  const getById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('service_products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const create = useCallback(async (newItem: Omit<ServiceProduct, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('service_products')
      .insert(newItem)
      .select()
      .single();
    if (error) throw error;
    getAll();
    return data;
  }, [getAll]);

  const update = useCallback(async (id: string, updates: Partial<ServiceProduct>) => {
    const { data, error } = await supabase
      .from('service_products')
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
      .from('service_products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    getAll();
  }, [getAll]);

  useEffect(() => {
    getAll();

    const subscription = supabase
      .channel('service_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_products' }, () => getAll())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [getAll]);

  return {
    serviceProducts,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    del,
  };
}

