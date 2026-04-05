import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, Shield } from 'lucide-react';
import { useAuthStore } from '@/auth/useAuthStore';

export const Navbar = () => {
  const { user, roles } = useAuthStore();
  const isAdmin = roles.includes('ROLE_ADMIN');

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Hukuk Asistanı</span>
          </Link>

          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </>
                ) : (
                  'Avukat'
                )}
              </Badge>
              <span className="text-sm font-medium text-slate-700">
                {user?.username}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
