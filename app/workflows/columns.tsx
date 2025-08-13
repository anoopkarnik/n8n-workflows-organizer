"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

// Shape of each row coming from your API
export type WorkflowRow = {
  id: string;
  workflowName: string;
  nodeCount: number;
  nodeTypes: string[];        // e.g. ["n8n-nodes-base.set", ...]      // e.g. ["gpt-4o", ...]
  credentialsUsed: string[];  // e.g. ["OpenAi account", ...]
};

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

import { FilterFn } from "@tanstack/react-table";

// Custom array includes filter
const arrayIncludes: FilterFn<any> = (row, columnId, filterValue) => {
  const cellValue = row.getValue<string[]>(columnId) || [];
  if (!filterValue) return true; // no filter applied
  return cellValue.some((v) =>
    v.toLowerCase().includes((filterValue as string).toLowerCase())
  );
};


export const columns: ColumnDef<WorkflowRow>[] = [
  {
    accessorKey: "workflowName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Workflow Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.original.workflowName}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "nodeCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nodes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => <span>{getValue<number>()}</span>,
    enableSorting: true,
    size: 80,
  },
  {
    accessorKey: "nodeTypes",
    header: "Node Types",
    cell: ({ row }) => renderBadges(row.original.nodeTypes),
    enableSorting: false,
    filterFn: arrayIncludes
  },
  {
    accessorKey: "credentialsUsed",
    header: "Credentials",
    cell: ({ row }) => renderBadges(row.original.credentialsUsed),
    enableSorting: false,
    filterFn: arrayIncludes
  },
];
