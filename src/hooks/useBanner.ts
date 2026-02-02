import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBannerUrl, postBanner, deleteBanner } from 'apis/banner';

export default function useBanner(contestId?: number) {
  const qc = useQueryClient();

  const {
    data: blobUrl,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['banner', contestId],
    queryFn: () => getBannerUrl(contestId!),
    enabled: !!contestId,
  });

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => postBanner(contestId!, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banner', contestId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBanner(contestId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banner', contestId] }),
  });

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return uploadMutation.mutateAsync(fd);
  };

  const removeBanner = async () => deleteMutation.mutateAsync();

  return {
    currentBanner: blobUrl ?? null,
    isLoading,
    refetch,

    uploadFile,
    isUploading: uploadMutation.isPending,

    removeBanner,
    isDeleting: deleteMutation.isPending,
  };
}
