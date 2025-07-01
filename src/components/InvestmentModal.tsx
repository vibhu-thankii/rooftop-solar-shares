
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Calculator, DollarSign, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [error, setError] = useState<string | null>(null);

  if (!project) return null;

  const soldShares = project.sold_shares || 0;
  const availableShares = project.available_shares - soldShares;
  const totalInvestment = shares * project.price_per_share;
  const expectedAnnualReturn = totalInvestment * (project.expected_roi / 100);
  const expectedMonthlyReturn = expectedAnnualReturn / 12;

  const validateInvestment = () => {
    if (!user) {
      setError("Please sign in to make an investment.");
      return false;
    }

    if (shares < 1) {
      setError("Please select at least 1 share.");
      return false;
    }

    if (shares > availableShares) {
      setError(`Only ${availableShares} shares are available.`);
      return false;
    }

    if (totalInvestment < project.price_per_share) {
      setError(`Minimum investment is ₹${project.price_per_share.toLocaleString()}.`);
      return false;
    }

    return true;
  };

  const handleInvestment = async () => {
    setError(null);
    
    if (!validateInvestment()) return;

    setLoading(true);

    try {
      // First, check if shares are still available (race condition prevention)
      const { data: currentProject, error: fetchError } = await supabase
        .from('projects')
        .select('sold_shares, available_shares')
        .eq('id', project.id)
        .single();

      if (fetchError) throw fetchError;

      const currentSoldShares = currentProject.sold_shares || 0;
      const currentAvailableShares = currentProject.available_shares - currentSoldShares;

      if (shares > currentAvailableShares) {
        throw new Error(`Only ${currentAvailableShares} shares are currently available.`);
      }

      // Create the investment record
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: project.id,
          shares_purchased: shares,
          amount_invested: totalInvestment,
          investment_date: new Date().toISOString(),
          payment_status: 'completed'
        });

      if (investmentError) throw investmentError;

      // Create a success notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Investment Successful!',
          message: `You have successfully invested ₹${totalInvestment.toLocaleString()} in ${project.title}. You purchased ${shares} shares.`,
          type: 'success'
        });

      toast({
        title: "Investment successful!",
        description: `You have successfully invested ₹${totalInvestment.toLocaleString()} in ${project.title}.`,
      });

      onSuccess();
      onClose();
      setShares(1);
      setError(null);
    } catch (error: any) {
      console.error('Investment error:', error);
      setError(error.message);
      toast({
        title: "Investment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSharesChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const clampedValue = Math.max(1, Math.min(numValue, availableShares));
    setShares(clampedValue);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Invest in {project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                onChange={(e) => handleSharesChange(e.target.value)}
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
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvestment} 
              disabled={loading || shares > availableShares || !!error}
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
