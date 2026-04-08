import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UploadResult {
  path: string;
  url: string;
}

export function useFileUpload(bucket: 'editais' | 'documentos' = 'documentos') {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, folder?: string): Promise<UploadResult | null> => {
    if (!user) {
      toast({ title: 'Erro', description: 'Faça login para enviar arquivos.', variant: 'destructive' });
      return null;
    }

    setUploading(true);
    setProgress(0);

    const ext = file.name.split('.').pop();
    const timestamp = Date.now();
    const path = folder 
      ? `${folder}/${timestamp}_${file.name}`
      : `${user.id}/${timestamp}.${ext}`;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
        return null;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      toast({ title: 'Upload concluído', description: file.name });

      return { path: data.path, url: urlData.publicUrl };
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao remover arquivo.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  return { upload, remove, uploading, progress };
}
