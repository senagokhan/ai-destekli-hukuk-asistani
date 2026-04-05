import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CaseTable } from '@/components/CaseTable';
import { Plus, Search } from 'lucide-react';
import { CaseFile } from '@/api/types';
import apiClient from '@/api/axios';
import { CASES } from '@/api/endpoints';
import { useAuthStore } from '@/auth/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// 🧭 Zod şeması
const createCaseSchema = z.object({
  caseTitle: z.string().min(1, 'Dava başlığı gerekli'),
  description: z.string().min(1, 'Açıklama gerekli'),
  status: z.enum(['OPEN', 'CLOSED', 'IN_PROGRESS', 'PENDING']),
});

// 🧩 Durum çevirileri
const statusLabels: Record<string, string> = {
  OPEN: 'Açık',
  IN_PROGRESS: 'Devam Ediyor',
  CLOSED: 'Kapalı',
  PENDING: 'Beklemede',
};

type CreateCaseForm = z.infer<typeof createCaseSchema>;

export const Cases = () => {
  const navigate = useNavigate();
  const { roles } = useAuthStore();
  const { toast } = useToast();
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isAdmin = roles.includes('ROLE_ADMIN');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCaseForm>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: { status: 'OPEN' },
  });

  // 🧠 Davaları getir
  useEffect(() => {
    fetchCases();
  }, []);

  // 🔍 Filtreleme
  useEffect(() => {
    filterCases();
  }, [cases, searchTerm]);

  const fetchCases = async () => {
    try {
      const response = await apiClient.get(CASES.BASE);
      setCases(response.data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = cases;
    if (searchTerm) {
      filtered = filtered.filter(
        (caseItem) =>
          caseItem.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caseItem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCases(filtered);
  };

  const handleCreateCase = async (data: CreateCaseForm) => {
    try {
      const response = await apiClient.post(CASES.BASE, data);
      setCases((prev) => [response.data, ...prev]);
      setShowCreateForm(false);
      reset();
      toast({
        title: 'Başarılı',
        description: 'Dava başarıyla oluşturuldu.',
      });
    } catch (error) {
      console.error('Failed to create case:', error);
      toast({
        title: 'Hata',
        description: 'Dava oluşturulamadı.',
      });
    }
  };

  const handleCaseDeleted = (caseId: number) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
  };

  const handleViewCase = (caseId: number) => {
    navigate(`/cases/${caseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Davalar</h1>
          <p className="text-slate-600 mt-2">
            Dava dosyalarınızı yönetin ve takip edin.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Dava Ekle
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Dava ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Case Form */}
      {showCreateForm && (
        <Card className="bg-white rounded-2xl shadow-md border-slate-200">
          <CardHeader>
            <CardTitle>Yeni Dava Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleCreateCase)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Dava Başlığı
                </label>
                <Input {...register('caseTitle')} placeholder="Dava başlığını girin" />
                {errors.caseTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.caseTitle.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Açıklama
                </label>
                <textarea
                  {...register('description')}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Dava açıklamasını girin"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Durum
                </label>
                <select
                  {...register('status')}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  İptal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Dava Oluştur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Cases Table */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardHeader>
          <CardTitle>Davalar ({filteredCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseTable
            cases={filteredCases}
            onCaseDeleted={handleCaseDeleted}
            showDeleteButton={isAdmin}
            onViewCase={handleViewCase}
            // 🧩 statusLabels'i CaseTable'a da geçir
            statusLabels={statusLabels}
          />
        </CardContent>
      </Card>
    </div>
  );
};
