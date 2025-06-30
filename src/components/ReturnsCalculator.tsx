
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp } from 'lucide-react';

const ReturnsCalculator = () => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [expectedROI, setExpectedROI] = useState('12');
  const [timeHorizon, setTimeHorizon] = useState('5');
  const [results, setResults] = useState<{
    monthlyReturns: number;
    yearlyReturns: number;
    totalReturns: number;
  } | null>(null);

  const calculateReturns = () => {
    const principal = parseFloat(investmentAmount);
    const roi = parseFloat(expectedROI) / 100;
    const years = parseFloat(timeHorizon);

    if (principal && roi && years) {
      const yearlyReturns = principal * roi;
      const monthlyReturns = yearlyReturns / 12;
      const totalReturns = yearlyReturns * years;

      setResults({
        monthlyReturns,
        yearlyReturns,
        totalReturns
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Returns Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="investment">Investment Amount (₹)</Label>
            <Input
              id="investment"
              type="number"
              placeholder="50000"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roi">Expected ROI (%)</Label>
            <Input
              id="roi"
              type="number"
              value={expectedROI}
              onChange={(e) => setExpectedROI(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="years">Time Horizon (Years)</Label>
            <Input
              id="years"
              type="number"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
            />
          </div>
        </div>
        
        <Button onClick={calculateReturns} className="w-full">
          Calculate Returns
        </Button>
        
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600 mb-1">Monthly Returns</p>
              <p className="text-xl font-bold text-green-700">
                ₹{results.monthlyReturns.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600 mb-1">Yearly Returns</p>
              <p className="text-xl font-bold text-blue-700">
                ₹{results.yearlyReturns.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600 mb-1">Total Returns ({timeHorizon} years)</p>
              <p className="text-xl font-bold text-purple-700">
                ₹{results.totalReturns.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReturnsCalculator;
