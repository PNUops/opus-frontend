import { QueryKey, useSuspenseQuery, UseSuspenseQueryOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const useImageObjectUrl = (image: Blob | null | undefined) => {
  const [imageURL, setImageURL] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setImageURL(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setImageURL(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  return imageURL;
};

export const useImageBlob = <TQueryFnData, TError, TQueryKey extends QueryKey = QueryKey>(
  queryOptions: UseSuspenseQueryOptions<TQueryFnData, TError, Blob | null, TQueryKey>,
) => {
  const query = useSuspenseQuery(queryOptions);
  const imageURL = useImageObjectUrl(query.isError ? null : query.data);

  return { ...query, imageURL };
};
