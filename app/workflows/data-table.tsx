"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";


import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  VisibilityState,
  useReactTable,
  Row
} from "@tanstack/react-table";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MultiSelect from "@/components/multiselect";


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =React.useState<VisibilityState>({})
const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState:{
      pagination:{
        pageSize: 3
      }
    }
  })


  // Build unique option lists from pre-filtered rows
  const preRows = table.getPreFilteredRowModel().flatRows as any[];
  const unique = (arr: string[]) => Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));

  const nodeTypeOptions = unique(
    preRows.flatMap((r) => (Array.isArray(r.original.nodeTypes) ? r.original.nodeTypes : []))
  );
  const credentialOptions = unique(
    preRows.flatMap((r) =>
      Array.isArray(r.original.credentialsUsed) ? r.original.credentialsUsed : []
    )
  );

  // Read current filter values (string[]) for each column
  const nodeTypeSelected = (table.getColumn("nodeTypes")?.getFilterValue() as string[]) ?? [];
  const credSelected = (table.getColumn("credentialsUsed")?.getFilterValue() as string[]) ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center flex-wrap gap-2 w-full">
          {/* Workflow Name search */}
            <Input
              placeholder="Search Workflow Name..."
              value={(table.getColumn("workflowName")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("workflowName")?.setFilterValue(event.target.value)
              }
              className="max-w-xs"
            />
          <MultiSelect
            title="Filter Node Types"
            options={nodeTypeOptions}
            values={nodeTypeSelected}
            onChange={(next) => table.getColumn("nodeTypes")?.setFilterValue(next)}
          />
          <MultiSelect
            title="Filter Credentials"
            options={credentialOptions}
            values={credSelected}
            onChange={(next) => table.getColumn("credentialsUsed")?.setFilterValue(next)}
          />
            <Input
              placeholder="Search Workflow Description..."
              value={(table.getColumn("workflowDescription")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("workflowDescription")?.setFilterValue(event.target.value)
              }
              className="max-w-xs"
            />

        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value:any) =>column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    <div className="rounded-md border max-h-svh overflow-x-auto overflow-y-auto">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
    <div className="flex items-center justify-between py-4">
  {/* Left: counts */}
      <div className="text-sm text-muted-foreground">
        {(() => {
          const total = table.getPreFilteredRowModel().rows.length;
          const filtered = table.getFilteredRowModel().rows.length;
          const { pageIndex, pageSize } = table.getState().pagination;
          const pageCount = table.getRowModel().rows.length; // rows on current page
          const start = filtered === 0 ? 0 : pageIndex * pageSize + 1;
          const end = pageIndex * pageSize + pageCount;

          if (filtered === total) {
            return (
              <>
                Showing <span className="font-medium">{start}</span>–
                <span className="font-medium">{end}</span> of{" "}
                <span className="font-medium">{total}</span> items
              </>
            );
          }
          return (
            <>
              Showing <span className="font-medium">{start}</span>–
              <span className="font-medium">{end}</span> of{" "}
              <span className="font-medium">{filtered}</span> filtered items
              {" "}(<span className="font-medium">{total}</span> total)
            </>
          );
        })()}
      </div>

      {/* Right: pager */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
    </>
  )
}