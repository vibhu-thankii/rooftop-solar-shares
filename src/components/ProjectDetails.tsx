
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Zap, TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';

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

interface ProjectDetailsProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onInvest: (project: Project) => void;
}

const ProjectDetails = ({ project, isOpen, onClose, onInvest }: ProjectDetailsProps) => {
  if (!project) return null;

  const soldShares = project.sold_shares || 0;
  const progressPercentage = (soldShares / project.available_shares) * 100;
  const isFullyFunded = soldShares >= project.available_shares;
  const remainingShares = project.available_shares - soldShares;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img
                src={project.image_url || '/placeholder.svg'}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge variant={isFullyFunded ? "secondary" : "default"}>
                  {isFullyFunded ? "Fully Funded" : "Available"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Project Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {project.description || "A premium solar installation project designed to provide sustainable energy solutions while generating attractive returns for investors."}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Key Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  High-efficiency solar panels with 25-year warranty
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Professional installation and maintenance
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Regular performance monitoring and reporting
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Insurance coverage and weather protection
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Location</span>
                </div>
                <p className="font-semibold">{project.location}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Capacity</span>
                </div>
                <p className="font-semibold">{project.capacity_kw} kW</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Expected ROI</span>
                </div>
                <p className="font-semibold">{project.expected_roi}% annually</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Price per Share</span>
                </div>
                <p className="font-semibold">₹{project.price_per_share.toLocaleString()}</p>
              </div>
            </div>

            {project.installation_date && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Installation Date</span>
                </div>
                <p className="font-semibold">
                  {new Date(project.installation_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Investment Progress
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Shares Sold</span>
                  <span>{soldShares.toLocaleString()} of {project.available_shares.toLocaleString()}</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{progressPercentage.toFixed(1)}% funded</span>
                  <span>{remainingShares.toLocaleString()} shares remaining</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Investment Highlights</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Projected monthly returns starting from month 2</li>
                <li>• Government subsidies and tax benefits</li>
                <li>• Professional property management included</li>
                <li>• Exit options available after 3 years</li>
              </ul>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => onInvest(project)}
              disabled={isFullyFunded}
            >
              {isFullyFunded ? "Fully Funded" : `Invest from ₹${project.price_per_share.toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetails;
