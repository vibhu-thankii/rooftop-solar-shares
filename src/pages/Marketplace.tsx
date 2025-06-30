
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import ProjectCard from '@/components/ProjectCard';
import ProjectDetails from '@/components/ProjectDetails';
import SearchAndFilter from '@/components/SearchAndFilter';
import InvestmentModal from '@/components/InvestmentModal';
import ReturnsCalculator from '@/components/ReturnsCalculator';

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
}

interface FilterOptions {
  search: string;
  location: string;
  minROI: string;
  maxInvestment: string;
  status: string;
}

const Marketplace = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [investmentProject, setInvestmentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: FilterOptions) => {
    let filtered = [...projects];

    if (filters.search) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(project =>
        project.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minROI) {
      filtered = filtered.filter(project =>
        (project.expected_roi || 0) >= parseFloat(filters.minROI)
      );
    }

    if (filters.maxInvestment) {
      filtered = filtered.filter(project =>
        project.price_per_share <= parseFloat(filters.maxInvestment)
      );
    }

    if (filters.status) {
      if (filters.status === 'funded') {
        filtered = filtered.filter(project =>
          (project.sold_shares || 0) >= project.available_shares
        );
      } else if (filters.status === 'active') {
        filtered = filtered.filter(project =>
          (project.sold_shares || 0) < project.available_shares
        );
      }
    }

    setFilteredProjects(filtered);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleInvestClick = (project: Project) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setSelectedProject(null);
    setInvestmentProject(project);
  };

  const handleInvestmentSuccess = () => {
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Solar Project Marketplace</h1>
          <p className="text-gray-600">Discover and invest in high-potential solar projects</p>
        </div>

        <div className="mb-8">
          <ReturnsCalculator />
        </div>

        <div className="mb-6">
          <SearchAndFilter onFiltersChange={handleFiltersChange} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects match your criteria.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div key={project.id} onClick={() => handleProjectClick(project)} className="cursor-pointer">
                <ProjectCard
                  project={project}
                  onInvest={(project) => handleInvestClick(project)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectDetails
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onInvest={handleInvestClick}
      />

      <InvestmentModal
        project={investmentProject}
        isOpen={!!investmentProject}
        onClose={() => setInvestmentProject(null)}
        onSuccess={handleInvestmentSuccess}
      />
    </div>
  );
};

export default Marketplace;
