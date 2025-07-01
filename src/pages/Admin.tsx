
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Building, TrendingUp, AlertCircle, Check, X, Plus } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalInvestments: 0,
    pendingApplications: 0
  });
  const [hostApplications, setHostApplications] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    location: '',
    capacity_kw: '',
    total_cost: '',
    available_shares: '',
    price_per_share: '',
    expected_roi: '',
    image_url: ''
  });

  useEffect(() => {
    if (!user) return;
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.is_admin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        return;
      }

      // Fetch stats
      const [usersRes, projectsRes, investmentsRes, applicationsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('investments').select('id', { count: 'exact' }),
        supabase.from('host_applications').select('id', { count: 'exact' }).eq('application_status', 'pending')
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalProjects: projectsRes.count || 0,
        totalInvestments: investmentsRes.count || 0,
        pendingApplications: applicationsRes.count || 0
      });

      // Fetch detailed data
      const [applicationsData, projectsData, investmentsData] = await Promise.all([
        supabase.from('host_applications').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('investments').select('*, projects(title)').order('created_at', { ascending: false })
      ]);

      setHostApplications(applicationsData.data || []);
      setProjects(projectsData.data || []);
      setInvestments(investmentsData.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error loading admin data",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('host_applications')
        .update({ 
          application_status: status,
          admin_notes: notes || null
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Application updated",
        description: `Application ${status} successfully.`,
      });

      fetchAdminData();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error updating application",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const createProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          title: newProject.title,
          description: newProject.description,
          location: newProject.location,
          capacity_kw: parseFloat(newProject.capacity_kw),
          total_cost: parseFloat(newProject.total_cost),
          available_shares: parseInt(newProject.available_shares),
          price_per_share: parseFloat(newProject.price_per_share),
          expected_roi: parseFloat(newProject.expected_roi),
          image_url: newProject.image_url || null,
          project_status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Project created",
        description: "New project added successfully.",
      });

      setNewProjectDialog(false);
      setNewProject({
        title: '',
        description: '',
        location: '',
        capacity_kw: '',
        total_cost: '',
        available_shares: '',
        price_per_share: '',
        expected_roi: '',
        image_url: ''
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error creating project",
        description: "Please check all fields and try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your solar investment platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvestments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Host Applications</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Host Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Property Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hostApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>{application.full_name}</TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.property_type}</TableCell>
                        <TableCell>{application.property_address}</TableCell>
                        <TableCell>
                          <Badge variant={
                            application.application_status === 'approved' ? 'default' :
                            application.application_status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {application.application_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'approved')}
                              disabled={application.application_status === 'approved'}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              disabled={application.application_status === 'rejected'}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Projects</CardTitle>
                <Dialog open={newProjectDialog} onOpenChange={setNewProjectDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newProject.title}
                          onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newProject.location}
                          onChange={(e) => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newProject.description}
                          onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity (kW)</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={newProject.capacity_kw}
                          onChange={(e) => setNewProject(prev => ({ ...prev, capacity_kw: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost">Total Cost (₹)</Label>
                        <Input
                          id="cost"
                          type="number"
                          value={newProject.total_cost}
                          onChange={(e) => setNewProject(prev => ({ ...prev, total_cost: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shares">Available Shares</Label>
                        <Input
                          id="shares"
                          type="number"
                          value={newProject.available_shares}
                          onChange={(e) => setNewProject(prev => ({ ...prev, available_shares: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price per Share (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProject.price_per_share}
                          onChange={(e) => setNewProject(prev => ({ ...prev, price_per_share: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roi">Expected ROI (%)</Label>
                        <Input
                          id="roi"
                          type="number"
                          value={newProject.expected_roi}
                          onChange={(e) => setNewProject(prev => ({ ...prev, expected_roi: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                          id="image"
                          value={newProject.image_url}
                          onChange={(e) => setNewProject(prev => ({ ...prev, image_url: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={createProject} className="w-full">
                      Create Project
                    </Button>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Price/Share</TableHead>
                      <TableHead>ROI</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Funding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{project.location}</TableCell>
                        <TableCell>{project.capacity_kw} kW</TableCell>
                        <TableCell>₹{project.price_per_share.toLocaleString()}</TableCell>
                        <TableCell>{project.expected_roi}%</TableCell>
                        <TableCell>
                          <Badge variant={project.project_status === 'active' ? 'default' : 'secondary'}>
                            {project.project_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {Math.round(((project.sold_shares || 0) / project.available_shares) * 100)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments">
            <Card>
              <CardHeader>
                <CardTitle>Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((investment) => (
                      <TableRow key={investment.id}>
                        <TableCell>{investment.projects?.title || 'Unknown Project'}</TableCell>
                        <TableCell>₹{investment.amount_invested.toLocaleString()}</TableCell>
                        <TableCell>{investment.shares_purchased}</TableCell>
                        <TableCell>{new Date(investment.investment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={investment.payment_status === 'completed' ? 'default' : 'secondary'}>
                            {investment.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
