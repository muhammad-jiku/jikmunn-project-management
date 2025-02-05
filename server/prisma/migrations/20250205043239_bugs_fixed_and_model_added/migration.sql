/*
  Warnings:

  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `teamName` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REGISTRANT', 'MANAGER', 'ADMIN', 'SUPER_ADMIN');

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_authorUserId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";

-- AlterTable
ALTER TABLE "Attachment" ALTER COLUMN "uploadedById" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "authorUserId" SET DATA TYPE TEXT,
ALTER COLUMN "assignedUserId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TaskAssignment" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "teamName",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "productOwnerUserId" SET DATA TYPE TEXT,
ALTER COLUMN "projectManagerUserId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "tblregistrant" (
    "id" TEXT NOT NULL,
    "registrantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "profileImage" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblregistrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblmanager" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "profileImage" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblmanager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbladmin" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "profileImage" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbladmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblsuperadmin" (
    "id" TEXT NOT NULL,
    "superAdminId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "profileImage" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblsuperadmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbluser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "password" TEXT NOT NULL,
    "needsPasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "passwordChangedAt" TIMESTAMP(3),
    "registrantId" TEXT,
    "managerId" TEXT,
    "adminId" TEXT,
    "superAdminId" TEXT,
    "teamId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbluser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tblregistrant_registrantId_key" ON "tblregistrant"("registrantId");

-- CreateIndex
CREATE UNIQUE INDEX "tblregistrant_username_key" ON "tblregistrant"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tblregistrant_email_key" ON "tblregistrant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tblregistrant_contact_key" ON "tblregistrant"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "tblmanager_managerId_key" ON "tblmanager"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "tblmanager_username_key" ON "tblmanager"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tblmanager_email_key" ON "tblmanager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tblmanager_contact_key" ON "tblmanager"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "tbladmin_adminId_key" ON "tbladmin"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "tbladmin_username_key" ON "tbladmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tbladmin_email_key" ON "tbladmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbladmin_contact_key" ON "tbladmin"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "tblsuperadmin_superAdminId_key" ON "tblsuperadmin"("superAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "tblsuperadmin_username_key" ON "tblsuperadmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tblsuperadmin_email_key" ON "tblsuperadmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tblsuperadmin_contact_key" ON "tblsuperadmin"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_userId_key" ON "tbluser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_registrantId_key" ON "tbluser"("registrantId");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_managerId_key" ON "tbluser"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_adminId_key" ON "tbluser"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_superAdminId_key" ON "tbluser"("superAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_registrantId_managerId_adminId_superAdminId_key" ON "tbluser"("registrantId", "managerId", "adminId", "superAdminId");

-- AddForeignKey
ALTER TABLE "tbluser" ADD CONSTRAINT "tbluser_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "tblregistrant"("registrantId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbluser" ADD CONSTRAINT "tbluser_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "tblmanager"("managerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbluser" ADD CONSTRAINT "tbluser_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "tbladmin"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbluser" ADD CONSTRAINT "tbluser_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "tblsuperadmin"("superAdminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbluser" ADD CONSTRAINT "tbluser_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "tbluser"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
