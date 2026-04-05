import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2 } from 'lucide-react';
import { CaseFile } from '@/api/types';
import { DeleteButton } from './ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/api/axios';
import { CASES } from '@/api/endpoints';
import dayjs from 'dayjs';

interface CaseTableProps {
  cases: CaseFile[];
  onCaseDeleted?: (caseId: number) => void;
  showDeleteButton?: boolean;
  onViewCase?: (caseId: number) => void;
  statusLabels?: Record<string, string>;
}

export const CaseTable = ({ 
  cases, 
  onCaseDeleted, 
  showDeleteButton = false,
  onViewCase,
  statusLabels
}: CaseTableProps) => {
  const { toast } = useToast();

  const handleDelete = async (caseId: number) => {
    try {
      await apiClient.delete(CASES.DELETE(caseId));
      toast({
        title: "Başarılı",
        description: "Dava silindi.",
      });
      if (onCaseDeleted) {
        onCaseDeleted(caseId);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Hata",
        description: "Dava silinemedi.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const label = statusLabels?.[status] || status;
    
    switch (status) {
      case 'OPEN':
        return <Badge variant="default" className="bg-green-100 text-green-800">{label}</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">{label}</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">{label}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  if (cases.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Henüz dava bulunmuyor.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Dava Açıklaması</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Doküman Sayısı</TableHead>
            <TableHead>Oluşturulma Tarihi</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseItem) => (
            <TableRow key={caseItem.id}>
              <TableCell className="font-medium">{caseItem.id}</TableCell>
              <TableCell className="max-w-xs truncate">{caseItem.description}</TableCell>
              <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
              <TableCell>{caseItem.documents?.length || 0}</TableCell>
              <TableCell>
                {dayjs(caseItem.createdAt).format('DD.MM.YYYY')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onViewCase && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewCase(caseItem.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  {showDeleteButton && (
                    <DeleteButton
                      onDelete={() => handleDelete(caseItem.id)}
                      title="Davayı Sil"
                      description="Bu davayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
                    />
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
