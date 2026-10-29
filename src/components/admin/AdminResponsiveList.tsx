import type { Key, ReactNode } from 'react';
import { useMediaQuery } from '@react-hookz/web';
import { cn } from '@utils/classname';

export interface AdminListColumn<T> {
  key: string;
  label: string;
  header?: ReactNode;
  render: (item: T) => ReactNode;
  className?: string;
}

interface AdminResponsiveListProps<T> {
  label: string;
  items: readonly T[];
  getKey: (item: T) => Key;
  columns: readonly AdminListColumn<T>[];
  primaryKey: string;
  actions?: (item: T) => ReactNode;
  emptyText: string;
  tableClassName?: string;
}

/** 같은 데이터와 액션을 넓은 화면의 표, 좁은 화면의 이름·값 목록으로 표현합니다. */
export const AdminResponsiveList = <T,>({
  label,
  items,
  getKey,
  columns,
  primaryKey,
  actions,
  emptyText,
  tableClassName,
}: AdminResponsiveListProps<T>) => {
  const isCompact = useMediaQuery('(max-width: 1023px)');
  const primary = columns.find((column) => column.key === primaryKey);

  if (isCompact) {
    if (items.length === 0) return <p className="py-10 text-center text-sm text-neutral-600">{emptyText}</p>;
    return (
      <ul aria-label={label} className="border-lightGray divide-lightGray divide-y border-y">
        {items.map((item) => (
          <li key={getKey(item)} className="flex min-w-0 flex-col gap-4 py-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 flex-1 text-base leading-6 font-medium break-words text-neutral-900">
                {primary?.render(item)}
              </h3>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions(item)}</div>}
            </div>
            <dl className="grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 text-sm leading-6">
              {columns
                .filter((column) => column.key !== primaryKey)
                .map((column) => (
                  <div key={column.key} className="contents">
                    <dt className="text-neutral-600">{column.label}</dt>
                    <dd className="min-w-0 break-words text-neutral-900">{column.render(item)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full min-w-[860px] border-collapse text-sm', tableClassName)}>
        <caption className="sr-only">{label}</caption>
        <thead className="bg-whiteGray">
          <tr className="border-lightGray border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn('px-4 py-3 text-left font-medium whitespace-nowrap', column.className)}
              >
                {column.header ?? column.label}
              </th>
            ))}
            {actions && (
              <th scope="col" className="px-4 py-3 font-medium">
                작업
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={columns.length + Number(!!actions)} className="py-12 text-center text-neutral-600">
                {emptyText}
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={getKey(item)} className="border-lightGray border-b last:border-b-0">
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-4 text-neutral-800', column.className)}>
                    {column.render(item)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">{actions(item)}</div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
