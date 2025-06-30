
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, TrendingUp } from 'lucide-react';

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

interface ProjectCardProps {
  project: Project;
  onInvest: (project: Project) => void;
}

const ProjectCard = ({ project, onInvest }: ProjectCardProps) => {
  const progressPercentage = ((project.sold_shares || 0) / project.available_shares) * 100;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-green-600">
          {project.expected_roi}% ROI
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{project.title}</CardTitle>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          {project.location}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-1 text-yellow-500" />
            <span>{project.capacity_kw} kW</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span>₹{project.price_per_share.toLocaleString()}/share</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{project.sold_shares || 0}/{project.available_shares} shares</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <Button 
          onClick={() => onInvest(project)} 
          className="w-full"
          disabled={progressPercentage >= 100}
        >
          {progressPercentage >= 100 ? 'Fully Funded' : 'Invest Now'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
