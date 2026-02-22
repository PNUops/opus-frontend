import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const useImageBlob = <TQueryFnData, TError, TQueryKey extends QueryKey = QueryKey>(
  queryOptions: UseQueryOptions<TQueryFnData, TError, Blob, TQueryKey>,
) => {
  const [imageURL, setImageURL] = useState<string | null>(null);

  const query = useQuery(queryOptions);

  useEffect(() => {
    if (query.data) {
      const newUrl = URL.createObjectURL(query.data);
      setImageURL(newUrl);

      return () => {
        URL.revokeObjectURL(newUrl);
      };
    }
  }, [query.data]);

  useEffect(() => {
    if (query.isError) setImageURL(null);
  }, [query.isError]);

  return { ...query, imageURL };
};
