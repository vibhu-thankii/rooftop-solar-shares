
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ProjectCard from '@/components/ProjectCard';
import ProjectDetails from '@/components/ProjectDetails';
import SearchAndFilter from '@/components/SearchAndFilter';
import InvestmentModal from '@/components/InvestmentModal';
import ReturnsCalculator from '@/components/ReturnsCalculator';
import { useProjects } from '@/hooks/useProjects';

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
  project_status?: string;
  energy_output_kwh_year?: number;
  carbon_offset_kg_year?: number;
  warranty_years?: number;
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
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    location: '',
    minROI: '',
    maxInvestment: '',
    status: ''
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [investmentProject, setInvestmentProject] = useState<Project | null>(null);

  const { projects, loading, refetch } = useProjects(filters);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
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
    refetch();
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
          <SearchAndFilter 
            onFiltersChange={handleFiltersChange} 
            resultsCount={projects.length}
            loading={loading}
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects match your criteria.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
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
