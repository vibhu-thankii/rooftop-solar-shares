
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  capacity_kw: number;
  total_cost: number;
  available_shares: number;
  sold_shares: number;
  price_per_share: number;
  expected_roi: number;
  image_url: string;
  installation_date?: string;
  project_status: string;
  energy_output_kwh_year?: number;
  carbon_offset_kg_year?: number;
  warranty_years?: number;
  maintenance_fee_annual?: number;
}

interface FilterOptions {
  search: string;
  location: string;
  minROI: string;
  maxInvestment: string;
  status: string;
}

export const useProjects = (filters?: FilterOptions) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'funded') {
          query = query.eq('project_status', 'funded');
        } else {
          query = query.eq('project_status', 'active');
        }
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.minROI) {
        query = query.gte('expected_roi', parseFloat(filters.minROI));
      }

      if (filters?.maxInvestment) {
        query = query.lte('price_per_share', parseFloat(filters.maxInvestment));
      }

      const { data, error } = await query;

      if (error) throw error;

      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      toast({
        title: "Error loading projects",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => 
        prev.map(p => 
          p.id === projectId ? { ...p, ...updates } : p
        )
      );

      toast({
        title: "Project updated successfully",
      });
    } catch (err: any) {
      console.error('Error updating project:', err);
      toast({
        title: "Error updating project",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  useEffect(() => {
    // Set up real-time subscription for project updates
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    updateProject,
  };
};
