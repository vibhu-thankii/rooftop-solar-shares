
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Wallet, Zap, Calendar } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface Investment {
  id: string;
  shares_purchased: number;
  amount_invested: number;
  investment_date: string;
  project: {
    title: string;
    location: string;
    expected_roi: number;
    image_url: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          id,
          shares_purchased,
          amount_invested,
          investment_date,
          projects:project_id (
            title,
            location,
            expected_roi,
            image_url
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const formattedData = data?.map(investment => ({
        ...investment,
        project: Array.isArray(investment.projects) ? investment.projects[0] : investment.projects
      })) || [];

      setInvestments(formattedData as Investment[]);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0);
  const totalShares = investments.reduce((sum, inv) => sum + inv.shares_purchased, 0);
  const avgROI = investments.length > 0 
    ? investments.reduce((sum, inv) => sum + inv.project.expected_roi, 0) / investments.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Dashboard</h1>
          <p className="text-gray-600">Track your solar investments and returns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalInvested.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalShares}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgROI.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="investments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="investments">My Investments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="investments" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : investments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No investments yet</p>
                  <p className="text-sm text-gray-400">Start investing in solar projects to see them here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {investments.map((investment) => (
                  <Card key={investment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={investment.project.image_url}
                          alt={investment.project.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{investment.project.title}</h3>
                              <p className="text-sm text-gray-600">{investment.project.location}</p>
                            </div>
                            <Badge variant="secondary">
                              {investment.project.expected_roi}% ROI
                            </Badge>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Shares</span>
                              <p className="font-medium">{investment.shares_purchased}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount</span>
                              <p className="font-medium">₹{investment.amount_invested.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Date</span>
                              <p className="font-medium">
                                {new Date(investment.investment_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Performance data will be available once your investments start generating returns.</p>
                  <p className="text-sm mt-2">Check back after your solar projects become operational.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
