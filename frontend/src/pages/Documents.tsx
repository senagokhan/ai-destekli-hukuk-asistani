import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DocumentTable } from '@/components/DocumentTable';
import { UploadDialog } from '@/components/UploadDialog';
import { Search } from 'lucide-react';
import { Document } from '@/api/types';
import apiClient from '@/api/axios';
import { DOCS } from '@/api/endpoints';
import { useAuthStore } from '@/auth/useAuthStore';
import { useSelectedDocument } from '@/context/SelectedDocumentContext';

export const Documents = () => {
  const { roles } = useAuthStore();
  const { setDocumentId } = useSelectedDocument();
  const navigate = useNavigate(); 

  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] =
    useState<'ALL' | 'LEGAL_BOOK' | 'CASE_FILE'>('ALL');

  const isAdmin = roles.includes('ROLE_ADMIN');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, typeFilter]);

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.get(DOCS.BASE);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleDocumentDeleted = (documentId: number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleUploadSuccess = (document: Document) => {
    setDocuments(prev => [document, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Belgeler</h1>
        <p className="text-slate-600 mt-2">
          PDF belgelerinizi yönetin ve sohbet için seçin.
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Belge ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={typeFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('ALL')}
              >
                Tümü
              </Button>
              <Button
                size="sm"
                variant={typeFilter === 'LEGAL_BOOK' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('LEGAL_BOOK')}
              >
                Hukuk Kitabı
              </Button>
              <Button
                size="sm"
                variant={typeFilter === 'CASE_FILE' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('CASE_FILE')}
              >
                Dava Dosyası
              </Button>
            </div>

            <UploadDialog onUploadSuccess={handleUploadSuccess} />
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="bg-white rounded-2xl shadow-md border-slate-200">
        <CardHeader>
          <CardTitle>Belgeler ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentTable
            documents={filteredDocuments}
            onDocumentDeleted={handleDocumentDeleted}
            showDeleteButton={isAdmin}
            onUseForChat={(doc: Document) => {
              setDocumentId(doc.id);
              navigate('/chat'); 
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
