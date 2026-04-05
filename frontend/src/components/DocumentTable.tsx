import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { Document } from '@/api/types';
import { DeleteButton } from './ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/api/axios';
import { DOCS } from '@/api/endpoints';
import dayjs from 'dayjs';

interface DocumentTableProps {
  documents: Document[];
  onDocumentDeleted?: (documentId: number) => void;
  showDeleteButton?: boolean;
  onUseForChat?: (doc: Document) => void; // ✅ CHAT İÇİN EKLENDİ
}

export const DocumentTable = ({
  documents,
  onDocumentDeleted,
  showDeleteButton = false,
  onUseForChat
}: DocumentTableProps) => {
  const { toast } = useToast();

  const handleDownload = async (documentId: number, filename: string) => {
    try {
      const response = await apiClient.get(DOCS.DOWNLOAD(documentId), {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Başarılı',
        description: 'Dosya indirildi.',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Hata',
        description: 'Dosya indirilemedi.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (documentId: number) => {
    try {
      await apiClient.delete(DOCS.DELETE(documentId));
      toast({
        title: 'Başarılı',
        description: 'Doküman silindi.',
      });
      onDocumentDeleted?.(documentId);
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Hata',
        description: 'Doküman silinemedi.',
        variant: 'destructive',
      });
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'LEGAL_BOOK':
        return <Badge variant="secondary">Hukuk Kitabı</Badge>;
      case 'CASE_FILE':
        return <Badge variant="outline">Dava Dosyası</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Henüz doküman bulunmuyor.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Dosya Adı</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Yüklenme Tarihi</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="font-medium">{document.id}</TableCell>
              <TableCell>{document.originalFilename}</TableCell>
              <TableCell>{getDocumentTypeBadge(document.documentType)}</TableCell>
              <TableCell>
                {dayjs(document.uploadedAt).format('DD.MM.YYYY HH:mm')}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {/* Download */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(document.id, document.originalFilename)
                    }
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  {/* Delete */}
                  {showDeleteButton && (
                    <DeleteButton
                      onDelete={() => handleDelete(document.id)}
                      title="Dokümanı Sil"
                      description="Bu dokümanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
                    />
                  )}

                  {/* ✅ CHAT İÇİN KULLAN */}
                  {onUseForChat && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUseForChat(document)}
                    >
                      Sohbette Kullan
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
