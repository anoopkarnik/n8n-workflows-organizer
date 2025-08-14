// app/(wherever)/page.tsx
export const revalidate = 10;
import { prisma } from "@/lib/prisma";
import { columns, WorkflowRow } from "./workflows/columns";
import { DataTable } from "./workflows/data-table";

async function getData(): Promise<WorkflowRow[]> {
  const rows = await prisma.workflow.findMany({
    select: {
      id: true,
      name: true,
      nodeCount: true,
      workflowJson: true, // Ensure this is selected for download
      description: true, // Include description
      nodeTypes: { select: { name: true } },
      credentialsUsed: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Map to your UI shape
  return rows.map((w) => ({
    id: w.id,
    workflowName: w.name,
    nodeCount: w.nodeCount,
    nodeTypes: w.nodeTypes.map((t) => t.name),
    credentialsUsed: w.credentialsUsed.map((c) => c.name),
    workflowJson: w.workflowJson,
    workflowDescription: w.description || "", // Default to empty string if no description

  }));
}

export default async function DemoPage() {
  // Ensure server runtime (Prisma doesn't run on Edge)
  // export const runtime = "nodejs"; // uncomment in Next 13/14 if needed

  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold text-center mb-10">N8N Workflows Organizer</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
