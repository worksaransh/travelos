"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Search, Download, Trash2, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  key: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableAction<T> {
  label: string;
  onClick: (row: T) => void;
  className?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  actions?: TableAction<T>[];
  onAdd?: () => void;
  addButtonLabel?: string;
  onBulkDelete?: (selectedRows: T[]) => void;
  exportFileName?: string;
  itemsPerPage?: number;
}

export default function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search records...",
  actions,
  onAdd,
  addButtonLabel = "Create New",
  onBulkDelete,
  exportFileName = "database_records",
  itemsPerPage = 10
}: AdminTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 1. Filtering by search query
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchKey) return data;
    const query = searchQuery.toLowerCase().trim();
    return data.filter((row) => {
      const val = row[searchKey];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(query);
    });
  }, [data, searchQuery, searchKey]);

  // 2. Sorting columns
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const order = sortOrder === "asc" ? 1 : -1;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * order;
      }
      return String(valA).localeCompare(String(valB)) * order;
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Pagination calculation
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = paginatedData.map(row => row.id).filter(id => id);
      setSelectedIds(new Set(ids));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDeleteAction = () => {
    if (!onBulkDelete) return;
    const selectedRows = data.filter(row => selectedIds.has(row.id));
    onBulkDelete(selectedRows);
    setSelectedIds(new Set());
  };

  // CSV Export Utility
  const handleExport = () => {
    if (data.length === 0) return;

    const headers = columns.map(c => c.header).join(",");
    const rows = data.map(row => 
      columns.map(c => {
        const val = row[c.key];
        // Clean values of commas or line breaks
        const formattedVal = String(val !== undefined && val !== null ? val : "")
          .replace(/"/g, '""')
          .replace(/,/g, ' ');
        return `"${formattedVal}"`;
      }).join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFileName}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Table Actions Header */}
      <div className="p-4 bg-sand/15 border-b border-border/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        {searchKey && (
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-dusk-teal/60" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-border/60 rounded-lg text-xs bg-white focus:outline-none focus:border-marigold"
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        {/* Global Toolbar buttons */}
        <div className="flex gap-2 w-full sm:w-auto ml-auto justify-end">
          {selectedIds.size > 0 && onBulkDelete && (
            <button
              onClick={handleBulkDeleteAction}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-clay-rose/10 hover:bg-clay-rose/20 text-clay-rose rounded-lg text-xs font-semibold border border-clay-rose/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-border/60 hover:bg-sand/30 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-dusk-teal" />
            <span>Export CSV</span>
          </button>

          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-marigold hover:bg-marigold/90 text-white rounded-lg text-xs font-semibold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{addButtonLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table Scroll Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-sand/30 border-b border-border/30">
              {onBulkDelete && (
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(row => selectedIds.has(row.id))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-marigold"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                  className={`p-4 text-xs font-bold text-ink-indigo uppercase tracking-wider ${
                    col.sortable !== false ? "cursor-pointer hover:bg-sand/40 select-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-dusk-teal/60">
                        {sortKey === col.key ? (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="p-4 text-xs font-bold text-ink-indigo uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/20 text-xs">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-sand/10 transition">
                  {onBulkDelete && (
                    <td className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        className="accent-marigold"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="p-4 text-deep-charcoal leading-relaxed">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {actions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            onClick={() => act.onClick(row)}
                            className={`font-semibold hover:underline ${act.className || "text-marigold"}`}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onBulkDelete ? 1 : 0) + (actions ? 1 : 0)} className="p-8 text-center text-dusk-teal/60 italic bg-sand/5">
                  No records matching your search queries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border/40 bg-sand/15 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-dusk-teal">
        <div>
          Showing <span className="font-semibold">{Math.min(sortedData.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
          <span className="font-semibold">{Math.min(sortedData.length, currentPage * itemsPerPage)}</span> of{" "}
          <span className="font-semibold">{sortedData.length}</span> records
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 border border-border/60 hover:bg-sand/30 rounded disabled:opacity-50 disabled:hover:bg-transparent transition"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-border/60 hover:bg-sand/30 rounded disabled:opacity-50 disabled:hover:bg-transparent transition flex items-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-3 py-1 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-border/60 hover:bg-sand/30 rounded disabled:opacity-50 disabled:hover:bg-transparent transition flex items-center"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-border/60 hover:bg-sand/30 rounded disabled:opacity-50 disabled:hover:bg-transparent transition"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
