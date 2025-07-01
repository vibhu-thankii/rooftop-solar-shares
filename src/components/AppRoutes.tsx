
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Marketplace from '@/pages/Marketplace';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Profile from '@/pages/Profile';
import Host from '@/pages/Host';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

const AppRoutes = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/host" element={<Host />} />
      
      {/* Protected Routes */}
      {user && (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
        </>
      )}
      
      {/* Admin Routes */}
      {user && isAdmin && (
        <Route path="/admin" element={<Admin />} />
      )}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
