"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

// Shape of each row coming from your API
export type WorkflowRow = {
  id: string;
  workflowName: string;
  workflowJson: JsonValue;
  workflowDescription: string;
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
import { JsonValue } from "@prisma/client/runtime/library";


export const globalArraySearch: FilterFn<any> = (row, _columnId, filterValue) => {
  const q = String(filterValue ?? "").toLowerCase().trim();
  if (!q) return true;

  const nodeTypes = ((row.original.nodeTypes ?? []) as string[])
    .join(" ")
    .toLowerCase();
  const creds = ((row.original.credentialsUsed ?? []) as string[])
    .join(" ")
    .toLowerCase();

  return (
    nodeTypes.includes(q) ||
    creds.includes(q)
  );
};

function handleDownload(jsonData: any) {
  try {
    // Convert to a pretty-printed JSON string
    const jsonParsed = JSON.parse(jsonData);
    const jsonString = JSON.stringify(jsonParsed, null, 2);

    // Create a Blob from the string
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a temporary object URL
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = "workflow.json"; // filename for download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading JSON:", err);
  }
}



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
      <div className="font-medium text-md">{row.original.workflowName}</div>
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
  },
  {
    accessorKey: "credentialsUsed",
    header: "Credentials",
    cell: ({ row }) => renderBadges(row.original.credentialsUsed),
    enableSorting: false,
  },
  {
    accessorKey: "downloadWorkflow",
    header: "Download",
    cell: ({ row }) => (
      <Button className="cursor-pointer"
        variant="outline"
        onClick={() => handleDownload(row.original.workflowJson)}
      >
        Download
      </Button>
    ),
  },
    {
    accessorKey: "workflowDescription",
    header: "Description",
    cell: ({ row }) => <div className="font-light text-xs text-wrap">{row.original.workflowDescription}</div>,
    enableSorting: false,
  },
];
