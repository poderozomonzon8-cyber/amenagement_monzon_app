import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Project = Database['public']['Tables']['projects']['Row'];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProjects(data || []);
    setLoading(false);
  }, []);

  const getById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const create = useCallback(async (newProject: Omit<Project, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select()
      .single();
    if (error) throw error;
    getAll();
    return data;
  }, [getAll]);

  const update = useCallback(async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
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
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
    getAll();
  }, [getAll]);

  useEffect(() => {
    getAll();

    const subscription = supabase
      .channel('projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => getAll())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [getAll]);

  return {
    projects,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    del,
  };
}

