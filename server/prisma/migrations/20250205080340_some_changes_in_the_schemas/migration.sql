/*
  Warnings:

  - You are about to drop the column `teamId` on the `tbluser` table. All the data in the column will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTeam" DROP CONSTRAINT "ProjectTeam_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTeam" DROP CONSTRAINT "ProjectTeam_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_authorUserId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "tbluser" DROP CONSTRAINT "tbluser_teamId_fkey";

-- AlterTable
ALTER TABLE "tblregistrant" ADD COLUMN     "teamId" INTEGER;

-- AlterTable
ALTER TABLE "tbluser" DROP COLUMN "teamId";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectTeam";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "TaskAssignment";

-- DropTable
DROP TABLE "Team";

-- CreateTable
CREATE TABLE "tblteam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblteam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblproject" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblproject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblprojectteam" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblprojectteam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbltask" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "priority" TEXT,
    "tags" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "points" INTEGER,
    "projectId" INTEGER NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbltask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbltaskassignment" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbltaskassignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblattachment" (
    "id" SERIAL NOT NULL,
    "fileURL" TEXT NOT NULL,
    "fileName" TEXT,
    "taskId" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblattachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblcomment" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblcomment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tblregistrant" ADD CONSTRAINT "tblregistrant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "tblteam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblteam" ADD CONSTRAINT "tblteam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblproject" ADD CONSTRAINT "tblproject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblprojectteam" ADD CONSTRAINT "tblprojectteam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "tblteam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblprojectteam" ADD CONSTRAINT "tblprojectteam_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "tblproject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblprojectteam" ADD CONSTRAINT "tblprojectteam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbltask" ADD CONSTRAINT "tbltask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "tblproject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbltask" ADD CONSTRAINT "tbltask_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbltask" ADD CONSTRAINT "tbltask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "tbluser"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbltaskassignment" ADD CONSTRAINT "tbltaskassignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbltaskassignment" ADD CONSTRAINT "tbltaskassignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tbltask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblattachment" ADD CONSTRAINT "tblattachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tbltask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblattachment" ADD CONSTRAINT "tblattachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcomment" ADD CONSTRAINT "tblcomment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tbltask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcomment" ADD CONSTRAINT "tblcomment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
