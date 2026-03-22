import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type BillingDocument = Database['public']['Tables']['billing_documents']['Row'];

export function useBillingDocuments() {
  const [billingDocuments, setBillingDocuments] = useState<BillingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('billing_documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setBillingDocuments(data || []);
    setLoading(false);
  }, []);

  const getById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('billing_documents')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const create = useCallback(async (newDoc: Omit<BillingDocument, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('billing_documents')
      .insert(newDoc)
      .select()
      .single();
    if (error) throw error;
    getAll();
    return data;
  }, [getAll]);

  const update = useCallback(async (id: string, updates: Partial<BillingDocument>) => {
    const { data, error } = await supabase
      .from('billing_documents')
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
      .from('billing_documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
    getAll();
  }, [getAll]);

  useEffect(() => {
    getAll();

    const subscription = supabase
      .channel('billing_documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'billing_documents' }, () => getAll())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [getAll]);

  return {
    billingDocuments,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    del,
  };
}

