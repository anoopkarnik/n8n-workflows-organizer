"use client";

import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { JsonValue } from "@prisma/client/runtime/library";

// ------------ TYPES ------------
export type WorkflowRow = {
  id: string;
  workflowName: string;
  workflowJson: JsonValue;
  workflowDescription: string;
  nodeCount: number;
  nodeTypes: string[];
  credentialsUsed: string[];
};

// ------------ RENDER ------------
const renderBadges = (values?: string[]) => {
  if (!values?.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <Badge key={v} variant="secondary" className="font-normal">
          {v}
        </Badge>
      ))}
    </div>
  );
};

// ------------ FILTER FNs ------------
// OR mode: show row if it contains ANY selected value
export const arrayIncludesAny: FilterFn<any> = (row, columnId, filterValue) => {
  const selected = (filterValue as string[]) ?? [];
  if (selected.length === 0) return true;
  const cell = (row.getValue<string[]>(columnId) ?? []).map((s) => s.toLowerCase());
  return selected.some((s) => cell.includes(s.toLowerCase()));
};

// AND mode (optional): show row only if it contains ALL selected values
export const arrayIncludesAll: FilterFn<any> = (row, columnId, filterValue) => {
  const selected = (filterValue as string[]) ?? [];
  if (selected.length === 0) return true;
  const cell = (row.getValue<string[]>(columnId) ?? []).map((s) => s.toLowerCase());
  return selected.every((s) => cell.includes(s.toLowerCase()));
};

function handleDownload(jsonData: any) {
  try {
    const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading JSON:", err);
  }
}

export const columns: ColumnDef<WorkflowRow>[] = [
  {
    accessorKey: "workflowName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Workflow Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium text-md">{row.original.workflowName}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "nodeCount",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nodes <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => <span>{getValue<number>()}</span>,
    enableSorting: true,
    size: 80,
  },
  // 👇 these two get filtered by string[] values via setFilterValue([...])
  {
    accessorKey: "nodeTypes",
    header: "Node Types",
    cell: ({ row }) => renderBadges(row.original.nodeTypes),
    enableSorting: false,
    filterFn: arrayIncludesAny, // OR mode (switch to arrayIncludesAll if you prefer)
  },
  {
    accessorKey: "credentialsUsed",
    header: "Credentials",
    cell: ({ row }) => renderBadges(row.original.credentialsUsed),
    enableSorting: false,
    filterFn: arrayIncludesAny, // OR mode
  },
  {
    accessorKey: "downloadWorkflow",
    header: "Download",
    cell: ({ row }) => (
      <Button className="cursor-pointer" variant="outline" onClick={() => handleDownload(row.original.workflowJson)}>
        Download
      </Button>
    ),
  },
  {
    accessorKey: "workflowDescription",
    header: "Description",
    cell: ({ row }) => (
      <div className="font-light text-xs text-wrap">{row.original.workflowDescription}</div>
    ),
    enableSorting: false,
  },
];
