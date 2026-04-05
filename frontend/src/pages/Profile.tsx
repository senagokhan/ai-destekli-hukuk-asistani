import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { useAuthStore } from '@/auth/useAuthStore';
import apiClient from '@/api/axios';
import { AUTH } from '@/api/endpoints';
import dayjs from 'dayjs';

export const Profile = () => {
  const { user, roles, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const isAdmin = roles.includes('ROLE_ADMIN');

  const handleRefreshProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(AUTH.ME);
      // Update user in store if needed
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Kullanıcı bilgileri yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profil</h1>
        <p className="text-slate-600 mt-2">
          Hesap bilgilerinizi görüntüleyin ve yönetin.
        </p>
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-2xl shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Kullanıcı Adı</label>
              <p className="text-slate-900 font-medium">{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-slate-900 font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Yetkiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Roller</label>
              <div className="flex gap-2 mt-2">
                {roles.map((role) => (
                  <Badge
                    key={role}
                    variant={role === 'ROLE_ADMIN' ? 'default' : 'secondary'}
                    className={role === 'ROLE_ADMIN' ? 'bg-red-100 text-red-800' : ''}
                  >
                    {role === 'ROLE_ADMIN' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      'Avukat'
                    )}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Yetki Seviyesi</label>
              <p className="text-slate-900 font-medium">
                {isAdmin ? 'Tam Yetki' : 'Standart Yetki'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardHeader>
          <CardTitle>Hesap İşlemleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900">Profil Bilgilerini Yenile</h3>
              <p className="text-sm text-slate-600">En güncel bilgilerinizi alın</p>
            </div>
            <button
              onClick={handleRefreshProfile}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Yenileniyor...' : 'Yenile'}
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-medium text-red-900">Hesaptan Çıkış</h3>
              <p className="text-sm text-red-600">Güvenli bir şekilde çıkış yapın</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
