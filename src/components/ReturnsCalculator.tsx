
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const ReturnsCalculator = () => {
  const [investment, setInvestment] = useState(50000);
  const [roi, setRoi] = useState([12]);
  const [years, setYears] = useState([5]);

  const annualReturn = investment * (roi[0] / 100);
  const monthlyReturn = annualReturn / 12;
  const totalReturn = investment + (annualReturn * years[0]);
  const totalProfit = totalReturn - investment;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Returns Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="investment">Investment Amount (₹)</Label>
            <Input
              id="investment"
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value) || 0)}
              placeholder="50000"
            />
          </div>

          <div className="space-y-3">
            <Label>Expected ROI: {roi[0]}%</Label>
            <Slider
              value={roi}
              onValueChange={setRoi}
              max={20}
              min={8}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>8%</span>
              <span>14%</span>
              <span>20%</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Investment Period: {years[0]} years</Label>
            <Slider
              value={years}
              onValueChange={setYears}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 year</span>
              <span>5 years</span>
              <span>10 years</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <DollarSign className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Monthly Return</p>
            <p className="text-xl font-bold text-blue-600">
              ₹{monthlyReturn.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg text-center">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Annual Return</p>
            <p className="text-xl font-bold text-green-600">
              ₹{annualReturn.toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total Profit</p>
            <p className="text-xl font-bold text-purple-600">
              ₹{totalProfit.toLocaleString()}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <Calculator className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-xl font-bold text-orange-600">
              ₹{totalReturn.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Calculation Breakdown</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <p>• Initial Investment: ₹{investment.toLocaleString()}</p>
            <p>• Annual ROI: {roi[0]}%</p>
            <p>• Investment Period: {years[0]} {years[0] === 1 ? 'year' : 'years'}</p>
            <p>• Monthly Returns: ₹{monthlyReturn.toLocaleString()}</p>
            <p>• Total Profit After {years[0]} years: ₹{totalProfit.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReturnsCalculator;
