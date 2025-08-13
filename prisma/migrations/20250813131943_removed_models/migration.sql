/*
  Warnings:

  - You are about to drop the `ModelUsed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ModelUsedToWorkflow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ModelUsedToWorkflow" DROP CONSTRAINT "_ModelUsedToWorkflow_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ModelUsedToWorkflow" DROP CONSTRAINT "_ModelUsedToWorkflow_B_fkey";

-- DropTable
DROP TABLE "public"."ModelUsed";

-- DropTable
DROP TABLE "public"."_ModelUsedToWorkflow";
