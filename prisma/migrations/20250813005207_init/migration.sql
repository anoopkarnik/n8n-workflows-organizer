-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeCount" INTEGER NOT NULL,
    "workflowJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NodeType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NodeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModelUsed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelUsed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CredentialUsed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredentialUsed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_NodeTypeToWorkflow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NodeTypeToWorkflow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ModelUsedToWorkflow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ModelUsedToWorkflow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CredentialUsedToWorkflow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CredentialUsedToWorkflow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_NodeTypeToWorkflow_B_index" ON "public"."_NodeTypeToWorkflow"("B");

-- CreateIndex
CREATE INDEX "_ModelUsedToWorkflow_B_index" ON "public"."_ModelUsedToWorkflow"("B");

-- CreateIndex
CREATE INDEX "_CredentialUsedToWorkflow_B_index" ON "public"."_CredentialUsedToWorkflow"("B");

-- AddForeignKey
ALTER TABLE "public"."_NodeTypeToWorkflow" ADD CONSTRAINT "_NodeTypeToWorkflow_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."NodeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NodeTypeToWorkflow" ADD CONSTRAINT "_NodeTypeToWorkflow_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ModelUsedToWorkflow" ADD CONSTRAINT "_ModelUsedToWorkflow_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ModelUsed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ModelUsedToWorkflow" ADD CONSTRAINT "_ModelUsedToWorkflow_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CredentialUsedToWorkflow" ADD CONSTRAINT "_CredentialUsedToWorkflow_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."CredentialUsed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CredentialUsedToWorkflow" ADD CONSTRAINT "_CredentialUsedToWorkflow_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
