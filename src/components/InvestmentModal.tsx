
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
}

interface InvestmentModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InvestmentModal = ({ project, isOpen, onClose, onSuccess }: InvestmentModalProps) => {
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!project) return null;

  const totalAmount = shares * project.price_per_share;
  const availableShares = project.available_shares - (project.sold_shares || 0);

  const handleInvest = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: project.id,
          shares_purchased: shares,
          amount_invested: totalAmount,
          payment_status: 'completed', // In real app, this would be handled by payment gateway
        });

      if (error) throw error;

      // Update project sold shares
      await supabase
        .from('projects')
        .update({ 
          sold_shares: (project.sold_shares || 0) + shares 
        })
        .eq('id', project.id);

      toast({
        title: "Investment successful!",
        description: `You have successfully invested ₹${totalAmount.toLocaleString()} in ${project.title}`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Investment failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Expected ROI</span>
              <Badge variant="secondary">{project.expected_roi}%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Price per share</span>
              <span className="font-medium">₹{project.price_per_share.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Available shares</span>
              <span className="font-medium">{availableShares}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shares">Number of shares</Label>
            <Input
              id="shares"
              type="number"
              min="1"
              max={availableShares}
              value={shares}
              onChange={(e) => setShares(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between font-medium">
              <span>Total Investment</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleInvest} disabled={loading} className="flex-1">
              {loading ? 'Processing...' : 'Invest Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentModal;
