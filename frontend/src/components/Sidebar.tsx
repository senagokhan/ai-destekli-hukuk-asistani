import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  MessageSquare, 
  User, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/auth/useAuthStore';

const navigation = [
  { name: 'Anasayfa', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Belgeler', href: '/documents', icon: FileText },
  { name: 'Davalar', href: '/cases', icon: Scale },
  { name: 'Sohbet', href: '/chat', icon: MessageSquare },
  { name: 'Profil', href: '/profile', icon: User },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, roles, logout } = useAuthStore();

  const isAdmin = roles.includes('ROLE_ADMIN');

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-md"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Hukuk Asistanı</h1>
          </div>

          {/* User info */}
          <div className="mb-6 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">{user?.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                {isAdmin ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </>
                ) : (
                  'Avukat'
                )}
              </Badge>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-6" />

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </>
  );
};
