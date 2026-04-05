import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentTable } from '@/components/DocumentTable';
import { UploadDialog } from '@/components/UploadDialog';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Document } from '@/api/types';
import apiClient from '@/api/axios';
import { DOCS } from '@/api/endpoints';
import dayjs from 'dayjs';

export const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await apiClient.get(DOCS.DETAIL(parseInt(id!)));
      setDocument(response.data);
    } catch (error) {
      console.error('Failed to fetch document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const response = await apiClient.get(DOCS.DOWNLOAD(document.id), {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Doküman bulunamadı.</p>
        <Button onClick={() => navigate('/documents')} className="mt-4">
          Belgeler'e Dön
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
          onClick={() => navigate('/documents')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{document.originalFilename}</h1>
          <p className="text-slate-600 mt-2">Doküman Detayları</p>
        </div>
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl shadow-md border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Doküman Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">ID</label>
                  <p className="text-slate-900 font-medium">{document.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Dosya Adı</label>
                  <p className="text-slate-900 font-medium">{document.originalFilename}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Tür</label>
                  <p className="text-slate-900 font-medium">
                    {document.documentType === 'LEGAL_BOOK' ? 'Hukuk Kitabı' : 'Dava Dosyası'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Yüklenme Tarihi</label>
                  <p className="text-slate-900 font-medium">
                    {dayjs(document.uploadedAt).format('DD.MM.YYYY HH:mm')}
                  </p>
                </div>
                {document.category && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Kategori</label>
                    <p className="text-slate-900 font-medium">{document.category}</p>
                  </div>
                )}
                {document.caseId && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Dava ID</label>
                    <p className="text-slate-900 font-medium">{document.caseId}</p>
                  </div>
                )}
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
              <Button
                onClick={handleDownload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                İndir
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
