
import { useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FilterOptions {
  search: string;
  location: string;
  minROI: string;
  maxInvestment: string;
  status: string;
}

interface SearchAndFilterProps {
  onFiltersChange: (filters: FilterOptions) => void;
  resultsCount?: number;
  loading?: boolean;
}

const SearchAndFilter = ({ onFiltersChange, resultsCount, loading }: SearchAndFilterProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    location: '',
    minROI: '',
    maxInvestment: '',
    status: ''
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      location: '',
      minROI: '',
      maxInvestment: '',
      status: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Filter Projects</h3>
              {hasActiveFilters && (
                <Badge variant="outline">{Object.values(filters).filter(v => v !== '').length} active</Badge>
              )}
            </div>
            {typeof resultsCount === 'number' && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                <span>{resultsCount.toLocaleString()} projects found</span>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects by title, description, or location..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="City, State"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Min ROI (%)</label>
              <Input
                type="number"
                placeholder="8"
                min="0"
                max="50"
                value={filters.minROI}
                onChange={(e) => handleFilterChange('minROI', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Max Investment (₹)</label>
              <Input
                type="number"
                placeholder="100000"
                min="0"
                value={filters.maxInvestment}
                onChange={(e) => handleFilterChange('maxInvestment', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  <SelectItem value="active">Available</SelectItem>
                  <SelectItem value="funded">Fully Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Find the perfect investment opportunity</span>
            </div>
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              size="sm"
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>  
  );
};

export default SearchAndFilter;
