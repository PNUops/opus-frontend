import {
  Pagination as PaginationWrapper,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pagesPerGroup?: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, pagesPerGroup = 5, onPageChange }: PaginationProps) => {
  const startPage = Math.floor((currentPage - 1) / pagesPerGroup) * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

  const hasPreviousGroup = startPage > 1;
  const hasNextGroup = endPage < totalPages;

  return (
    <PaginationWrapper>
      <PaginationContent>
        {hasPreviousGroup && (
          <>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={'cursor-pointer'}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {hasNextGroup && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={'cursor-pointer'}
              />
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </PaginationWrapper>
  );
};

export default Pagination;
