import { QueryKey, useSuspenseQuery, UseSuspenseQueryOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const useImageBlob = <TQueryFnData, TError, TQueryKey extends QueryKey = QueryKey>(
  queryOptions: UseSuspenseQueryOptions<TQueryFnData, TError, Blob | null, TQueryKey>,
) => {
  const [imageURL, setImageURL] = useState<string | null>(null);

  const query = useSuspenseQuery(queryOptions);

  useEffect(() => {
    if (query.data) {
      const newUrl = URL.createObjectURL(query.data);
      setImageURL(newUrl);

      return () => {
        URL.revokeObjectURL(newUrl);
      };
    }

    setImageURL(null);
  }, [query.data]);

  useEffect(() => {
    if (query.isError) setImageURL(null);
  }, [query.isError]);

  return { ...query, imageURL };
};
