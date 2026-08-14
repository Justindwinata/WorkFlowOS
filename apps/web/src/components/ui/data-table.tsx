'use client';

import React, { ReactNode } from 'react';

interface DataTableProps<T> {
  columns: { key: string; label: string; sortable?: boolean }[];
  data: T[];
  actions?: (row: T) => ReactNode;
  rowKey: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  rowKey,
}: DataTableProps<T>) {
  const renderValue = (row: T, key: string) => {
    const value = row[key];
    if (value && typeof value === 'object' && 'name' in value) {
      return (value as any).name;
    }
    if (value && typeof value === 'object' && 'username' in value) {
      return (value as any).username;
    }
    return String(value ?? '-');
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="h-10 px-4 text-left align-middle font-medium">
                {col.label}
              </th>
            ))}
            {actions && <th className="h-10 px-4 text-center align-middle">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                Tidak ada data
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={String(row[rowKey])} className="border-t">
                {columns.map((col) => (
                  <td key={col.key} className="p-2 align-middle">
                    {renderValue(row, col.key)}
                  </td>
                ))}
                {actions && (
                  <td className="p-2 align-middle text-center">{actions(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
