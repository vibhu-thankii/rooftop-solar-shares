
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, Zap, TrendingUp, Calendar, Leaf, Shield } from 'lucide-react';

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

interface ProjectCardProps {
  project: Project;
  onInvest: (project: Project) => void;
}

const ProjectCard = ({ project, onInvest }: ProjectCardProps) => {
  const soldShares = project.sold_shares || 0;
  const progressPercentage = (soldShares / project.available_shares) * 100;
  const isFullyFunded = soldShares >= project.available_shares;
  const isActive = project.project_status === 'active';

  const getStatusBadge = () => {
    if (isFullyFunded) return { variant: "secondary" as const, text: "Fully Funded" };
    if (!isActive) return { variant: "destructive" as const, text: "Inactive" };
    return { variant: "default" as const, text: "Available" };
  };

  const statusBadge = getStatusBadge();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={project.image_url || '/placeholder.svg'}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge variant={statusBadge.variant}>
            {statusBadge.text}
          </Badge>
        </div>
        {project.carbon_offset_kg_year && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Leaf className="h-3 w-3 mr-1" />
              {project.carbon_offset_kg_year}kg CO₂/year
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
          <Badge variant="outline" className="ml-2">
            {project.expected_roi}% ROI
          </Badge>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          {project.location}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm line-clamp-2">
          {project.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
            <div>
              <p className="text-gray-600">Capacity</p>
              <p className="font-medium">{project.capacity_kw} kW</p>
              {project.energy_output_kwh_year && (
                <p className="text-xs text-gray-500">{project.energy_output_kwh_year.toLocaleString()} kWh/year</p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
            <div>
              <p className="text-gray-600">Per Share</p>
              <p className="font-medium">₹{project.price_per_share.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {project.warranty_years && (
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="h-4 w-4 mr-2 text-blue-500" />
            <span>{project.warranty_years} year warranty</span>
          </div>
        )}

        {project.installation_date && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Installation: {new Date(project.installation_date).toLocaleDateString()}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Funding Progress</span>
            <span>{soldShares.toLocaleString()}/{project.available_shares.toLocaleString()} shares</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-600">
            {progressPercentage.toFixed(1)}% funded
          </p>
        </div>

        <Button 
          className="w-full" 
          onClick={(e) => {
            e.stopPropagation();
            onInvest(project);
          }}
          disabled={isFullyFunded || !isActive}
        >
          {isFullyFunded ? "Fully Funded" : !isActive ? "Not Available" : "Invest Now"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
