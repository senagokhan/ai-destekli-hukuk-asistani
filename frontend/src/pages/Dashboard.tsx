import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { UploadDialog } from '@/components/UploadDialog';
import { FileText, Scale, Clock, Upload } from 'lucide-react';
import { useAuthStore } from '@/auth/useAuthStore';
import apiClient from '@/api/axios';
import { DOCS, CASES } from '@/api/endpoints';
import { Document, CaseFile } from '@/api/types';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsResponse, casesResponse] = await Promise.all([
          apiClient.get(DOCS.BASE),
          apiClient.get(CASES.BASE),
        ]);
        
        setDocuments(docsResponse.data);
        setCases(casesResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUploadSuccess = (document: Document) => {
    setDocuments(prev => [document, ...prev]);
  };

  const totalDocuments = documents.length;
  const activeCases = cases.filter(c => c.status === 'OPEN').length;
  const recentDocuments = documents.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Hoş geldiniz, {user?.username}!
        </h1>
        <p className="text-slate-600 mt-2">
          Hukuk Asistanı'nıza hoş geldiniz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Belge"
          value={totalDocuments}
          icon={FileText}
          description="Yüklenen PDF dosyaları"
        />
        <StatCard
          title="Aktif Dava"
          value={activeCases}
          icon={Scale}
          description="Devam eden davalar"
        />
        <StatCard
          title="Son Yüklenen"
          value={recentDocuments.length}
          icon={Clock}
          description="Son eklenen belgeler"
        />
      </div>

      {/* Quick Actions */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Hızlı PDF Yükle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDialog onUploadSuccess={handleUploadSuccess} />
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDocuments.length > 0 ? (
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{doc.originalFilename}</p>
                    <p className="text-xs text-slate-500">
                      {doc.documentType === 'LEGAL_BOOK' ? 'Hukuk Kitabı' : 'Dava Dosyası'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Henüz aktivite bulunmuyor.</p>
              <p className="text-sm">PDF yükleyerek başlayın!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
