
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import ProjectCard from '@/components/ProjectCard';
import InvestmentModal from '@/components/InvestmentModal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sun, TrendingUp, Users, Zap } from 'lucide-react';

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
}

const Home = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestSuccess = () => {
    fetchProjects(); // Refresh projects after investment
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Invest in Solar,<br />
              Power the Future
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Join the renewable energy revolution. Invest in solar projects and earn sustainable returns
              while helping create a cleaner planet.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="min-w-[200px]">
                    Start Investing
                  </Button>
                </Link>
                <Link to="/host">
                  <Button size="lg" variant="outline" className="min-w-[200px] border-white text-white hover:bg-white hover:text-gray-900">
                    Host Your Property
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <Sun className="h-12 w-12 text-yellow-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">kW Installed</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <TrendingUp className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">12-15%</h3>
              <p className="text-gray-600">Average ROI</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">1000+</h3>
              <p className="text-gray-600">Happy Investors</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Zap className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">50+</h3>
              <p className="text-gray-600">Active Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Solar Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover high-potential solar installations and start earning sustainable returns today
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onInvest={(project) => {
                  if (!user) {
                    // Redirect to auth if not logged in
                    window.location.href = '/auth';
                    return;
                  }
                  setSelectedProject(project);
                }}
              />
            ))}
          </div>
        )}

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects available at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon for new investment opportunities!</p>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How RooftopLease Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Investors</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold">Browse Projects</h4>
                    <p className="text-gray-600">Explore verified solar projects with detailed information and expected returns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold">Invest in Shares</h4>
                    <p className="text-gray-600">Buy shares starting from ₹25,000 and own a portion of the solar installation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold">Earn Returns</h4>
                    <p className="text-gray-600">Receive monthly returns from electricity generation and government incentives</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Property Owners</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold">Apply to Host</h4>
                    <p className="text-gray-600">Submit your property details for our team to assess solar potential</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold">Free Installation</h4>
                    <p className="text-gray-600">We handle all installation costs and maintenance through investor funding</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold">Earn Lease Income</h4>
                    <p className="text-gray-600">Receive monthly lease payments for your rooftop space usage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InvestmentModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onSuccess={handleInvestSuccess}
      />
    </div>
  );
};

export default Home;
