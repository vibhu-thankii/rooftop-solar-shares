
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Calculator, DollarSign, TrendingUp, Calendar } from 'lucide-react';

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

interface InvestmentModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InvestmentModal = ({ project, isOpen, onClose, onSuccess }: InvestmentModalProps) => {
  const { user } = useAuth();
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!project) return null;

  const soldShares = project.sold_shares || 0;
  const availableShares = project.available_shares - soldShares;
  const totalInvestment = shares * project.price_per_share;
  const expectedAnnualReturn = totalInvestment * (project.expected_roi / 100);
  const expectedMonthlyReturn = expectedAnnualReturn / 12;

  const handleInvestment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make an investment.",
        variant: "destructive",
      });
      return;
    }

    if (shares > availableShares) {
      toast({
        title: "Insufficient shares",
        description: `Only ${availableShares} shares are available.`,
        variant: "destructive",
      });
      return;
    }

    if (shares < 1) {
      toast({
        title: "Invalid amount",
        description: "Please select at least 1 share.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: project.id,
          shares_purchased: shares,
          amount_invested: totalInvestment,
          investment_date: new Date().toISOString(),
          payment_status: 'completed'
        });

      if (error) throw error;

      // Update project sold shares
      await supabase
        .from('projects')
        .update({ 
          sold_shares: soldShares + shares 
        })
        .eq('id', project.id);

      toast({
        title: "Investment successful!",
        description: `You have successfully invested ₹${totalInvestment.toLocaleString()} in ${project.title}.`,
      });

      onSuccess();
      onClose();
      setShares(1);
    } catch (error: any) {
      toast({
        title: "Investment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Invest in {project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={project.image_url || '/placeholder.svg'}
              alt={project.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-gray-600 text-sm">{project.location}</p>
              <Badge variant="outline">{project.expected_roi}% ROI</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Price per Share</span>
              </div>
              <p className="text-xl font-bold">₹{project.price_per_share.toLocaleString()}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Available Shares</span>
              </div>
              <p className="text-xl font-bold">{availableShares.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="shares">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                min="1"
                max={availableShares}
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max: {availableShares.toLocaleString()} shares available
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Calculator className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-semibold text-yellow-800">Investment Calculator</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Investment</p>
                  <p className="text-lg font-bold">₹{totalInvestment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expected Annual Return</p>
                  <p className="text-lg font-bold text-green-600">₹{expectedAnnualReturn.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expected Monthly Return</p>
                  <p className="text-lg font-bold text-green-600">₹{expectedMonthlyReturn.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-semibold text-blue-800">Important Dates</span>
              </div>
              <div className="text-sm space-y-1">
                {project.installation_date && (
                  <p>Installation: {new Date(project.installation_date).toLocaleDateString()}</p>
                )}
                <p>Returns start: Approximately 2 months after installation</p>
                <p>Full ROI period: 8-10 years</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleInvestment} 
              disabled={loading || shares > availableShares}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Invest ₹${totalInvestment.toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentModal;
