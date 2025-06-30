
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import PerformanceChart from '@/components/PerformanceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Calendar, Zap } from 'lucide-react';

interface PortfolioData {
  totalInvested: number;
  totalReturns: number;
  monthlyAvgReturns: number;
  totalGeneration: number;
  performanceData: Array<{
    month: string;
    generation: number;
    savings: number;
  }>;
}

const Portfolio = () => {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalInvested: 0,
    totalReturns: 0,
    monthlyAvgReturns: 0,
    totalGeneration: 0,
    performanceData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPortfolioData();
    }
  }, [user]);

  const fetchPortfolioData = async () => {
    try {
      // Fetch investments
      const { data: investments } = await supabase
        .from('investments')
        .select('amount_invested')
        .eq('user_id', user?.id);

      // Fetch performance data
      const { data: performance } = await supabase
        .from('portfolio_performance')
        .select('*')
        .eq('user_id', user?.id)
        .order('month', { ascending: true });

      const totalInvested = investments?.reduce((sum, inv) => sum + inv.amount_invested, 0) || 0;
      const totalGeneration = performance?.reduce((sum, perf) => sum + perf.total_generation_kwh, 0) || 0;
      const totalSavings = performance?.reduce((sum, perf) => sum + perf.savings_amount, 0) || 0;

      const performanceData = performance?.map(perf => ({
        month: new Date(perf.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        generation: perf.total_generation_kwh,
        savings: perf.savings_amount
      })) || [];

      setPortfolioData({
        totalInvested,
        totalReturns: totalSavings,
        monthlyAvgReturns: performance?.length ? totalSavings / performance.length : 0,
        totalGeneration,
        performanceData
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Performance</h1>
          <p className="text-gray-600">Track your solar investment returns and environmental impact</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{portfolioData.totalInvested.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{portfolioData.totalReturns.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Avg</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{portfolioData.monthlyAvgReturns.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Generated</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioData.totalGeneration.toLocaleString()} kWh</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance Chart</TabsTrigger>
            <TabsTrigger value="projections">Future Projections</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioData.performanceData.length > 0 ? (
                  <PerformanceChart data={portfolioData.performanceData} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No performance data available yet.</p>
                    <p className="text-sm mt-2">Data will appear once your investments start generating returns.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections">
            <Card>
              <CardHeader>
                <CardTitle>Future Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Future projection features coming soon.</p>
                  <p className="text-sm mt-2">We're working on advanced analytics to show your expected returns.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;
