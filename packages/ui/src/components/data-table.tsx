'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: string;
  actions?: (row: T) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  actions,
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const renderValue = (row: T, key: string) => {
    const column = columns.find((c) => c.key === key);
    if (column?.render) {
      return column.render(row);
    }
    const value = row[key];
    if (value && typeof value === 'object' && 'name' in value) {
      return String((value as any).name);
    }
    if (value && typeof value === 'object' && 'username' in value) {
      return String((value as any).username);
    }
    return String(value ?? '-');
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'h-10 px-4 text-left align-middle font-medium',
                  col.width && `w-[${col.width}]`,
                )}
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="h-10 px-4 text-center align-middle">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={String(row[rowKey])}
              className={cn(
                'border-t transition-colors',
                onRowClick && 'cursor-pointer hover:bg-muted/50',
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'p-4 align-middle',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.width && `w-[${col.width}]`,
                  )}
                >
                  {renderValue(row, col.key)}
                </td>
              ))}
              {actions && (
                <td className="p-4 align-middle text-center">
                  {actions(row as T)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}