
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Calendar, TrendingUp, Users } from 'lucide-react';

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

  const progressPercentage = ((project.sold_shares || 0) / project.available_shares) * 100;
  const remainingShares = project.available_shares - (project.sold_shares || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>
            
            <p className="text-gray-700">{project.description}</p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Capacity</span>
                </div>
                <p className="text-2xl font-bold">{project.capacity_kw} kW</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Expected ROI</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{project.expected_roi}%</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Investment Progress</span>
                <span>{project.sold_shares || 0}/{project.available_shares} shares</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹{((project.sold_shares || 0) * project.price_per_share).toLocaleString()} raised</span>
                <span>{progressPercentage.toFixed(1)}% funded</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Price per share</span>
                <span className="font-semibold">₹{project.price_per_share.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total project cost</span>
                <span className="font-semibold">₹{project.total_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shares available</span>
                <span className="font-semibold">{remainingShares}</span>
              </div>
              {project.installation_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Installation date</span>
                  <span className="font-semibold">
                    {new Date(project.installation_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => onInvest(project)} 
              className="w-full"
              disabled={remainingShares <= 0}
            >
              {remainingShares <= 0 ? 'Fully Funded' : 'Invest Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetails;
