import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentTable } from '@/components/DocumentTable';
import { UploadDialog } from '@/components/UploadDialog';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import { CaseFile, Document, AddDocumentToCaseRequest } from '@/api/types';
import apiClient from '@/api/axios';
import { CASES } from '@/api/endpoints';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/auth/useAuthStore';
import dayjs from 'dayjs';

export const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roles } = useAuthStore();
  const [caseItem, setCaseItem] = useState<CaseFile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentId, setDocumentId] = useState('');
  const [addingDocument, setAddingDocument] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCaseDetail();
    }
  }, [id]);

  const fetchCaseDetail = async () => {
    try {
      const response = await apiClient.get(CASES.DETAIL(parseInt(id!)));
      setCaseItem(response.data);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Failed to fetch case detail:', error);
    } finally {
      setLoading(false);
    }
  };

  // Durumları Türkçeye çevir
  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      OPEN: 'Açık',
      IN_PROGRESS: 'Devam Ediyor',
      CLOSED: 'Kapalı',
      PENDING: 'Beklemede',
    };
    return map[status] || status;
  };

  const handleAddDocument = async () => {
    if (!documentId || !caseItem) return;

    setAddingDocument(true);
    try {
      const request: AddDocumentToCaseRequest = { id: parseInt(documentId) };
      const response = await apiClient.post(CASES.ADD_DOC(caseItem.id), request);
      setCaseItem(response.data);
      setDocuments(response.data.documents || []);
      setDocumentId('');

      toast({
        title: 'Başarılı',
        description: 'Doküman davaya eklendi.',
      });
    } catch (error) {
      console.error('Failed to add document:', error);
      toast({
        title: 'Hata',
        description: 'Doküman eklenemedi.',
      });
    } finally {
      setAddingDocument(false);
    }
  };

  const handleUploadSuccess = (document: Document) => {
    setDocuments((prev) => [document, ...prev]);
  };

  // 🧩 Dava durumunu güncelle
  const handleStatusChange = async (newStatus: string) => {
    if (!caseItem) return;
    setUpdatingStatus(true);
    try {
      // Backend String status bekliyor
      await apiClient.patch(`/cases/${caseItem.id}/status`, { status: newStatus });
      console.log(newStatus);

      setCaseItem({ ...caseItem, status: newStatus });
      toast({
        title: 'Başarılı',
        description: 'Durum başarıyla güncellendi.',
      });
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
      toast({
        title: 'Hata',
        description: 'Durum güncellenemedi.',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Açık
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            Devam Ediyor
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            Kapalı
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            Beklemede
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Dava bulunamadı.</p>
        <Button onClick={() => navigate('/cases')} className="mt-4">
          Davalar'a Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{caseItem.caseTitle}</h1>
          <p className="text-slate-600 mt-2">Dava Detayları</p>
        </div>
      </div>

      {/* Case Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl shadow-md border-slate-200">
            <CardHeader>
              <CardTitle>Dava Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Durum */}
                <div>
                  <label className="text-sm font-medium text-slate-600">Durum</label>
                  {roles.includes('ROLE_ADMIN') || roles.includes('ROLE_LAWYER') ? (
                    <select
                      value={caseItem.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className="mt-1 border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="PENDING">Beklemede</option>
                      <option value="OPEN">Açık</option>
                      <option value="IN_PROGRESS">Devam Ediyor</option>
                      <option value="CLOSED">Kapalı</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      {getStatusBadge(translateStatus(caseItem.status))}
                    </div>
                  )}
                </div>

                {/* Oluşturulma Tarihi */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Oluşturulma Tarihi
                  </label>
                  <p className="text-slate-900 font-medium">
                    {dayjs(caseItem.createdAt).format('DD.MM.YYYY HH:mm')}
                  </p>
                </div>

                {/* Doküman Sayısı */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Doküman Sayısı
                  </label>
                  <p className="text-slate-900 font-medium">{documents.length}</p>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="text-sm font-medium text-slate-600">Açıklama</label>
                <p className="text-slate-900 mt-1">{caseItem.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div>
          <Card className="bg-white rounded-2xl shadow-md border-slate-200">
            <CardHeader>
              <CardTitle>İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <UploadDialog onUploadSuccess={handleUploadSuccess} caseId={caseItem.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Document */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Davaya Belge Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Doküman numarasını girin"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAddDocument}
              disabled={!documentId || addingDocument}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {addingDocument ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Dava Dokümanları ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentTable documents={documents} />
        </CardContent>
      </Card>
    </div>
  );
};
