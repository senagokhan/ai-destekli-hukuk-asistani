import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/api/axios';
import { DOCS } from '@/api/endpoints';
import { Document } from '@/api/types';

interface UploadDialogProps {
  onUploadSuccess?: (document: Document) => void;
  caseId?: number;
}

export const UploadDialog = ({ onUploadSuccess, caseId }: UploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'LEGAL_BOOK' | 'CASE_FILE'>('LEGAL_BOOK');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Hata",
          description: "Sadece PDF dosyaları yükleyebilirsiniz.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Hata",
        description: "Lütfen bir dosya seçin.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);
      
      if (category) {
        formData.append('category', category);
      }
      
      if (caseId) {
        formData.append('caseId', caseId.toString());
      }

      const response = await apiClient.post(DOCS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      toast({
        title: "Başarılı",
        description: "Dosya başarıyla yüklendi.",
      });

      setFile(null);
      setCategory('');
      setOpen(false);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Hata",
        description: "Dosya yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          PDF Yükle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PDF Dosyası Yükle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dosya Seç</label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                {file.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Doküman Türü</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as 'LEGAL_BOOK' | 'CASE_FILE')}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="LEGAL_BOOK">Hukuk Kitabı</option>
              <option value="CASE_FILE">Dava Dosyası</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Kategori (Opsiyonel)</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Kategori girin..."
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Yükleniyor...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
