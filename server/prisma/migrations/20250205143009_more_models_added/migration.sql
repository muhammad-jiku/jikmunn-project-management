/*
  Warnings:

  - The values [REGISTRANT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userId` on the `tblproject` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `tblprojectteam` table. All the data in the column will be lost.
  - The `status` column on the `tbltask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `userId` on the `tblteam` table. All the data in the column will be lost.
  - You are about to drop the column `registrantId` on the `tbluser` table. All the data in the column will be lost.
  - You are about to drop the `tblregistrant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId,teamId]` on the table `tblprojectteam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[developerId]` on the table `tbluser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[role,developerId,managerId,adminId,superAdminId]` on the table `tbluser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectOwnerId` to the `tblproject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `tbltaskassignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamOwnerId` to the `tblteam` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TO_DO', 'WORK_IN_PROGRESS', 'COMPLETED');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('DEVELOPER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN');
ALTER TABLE "tbluser" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "tblproject" DROP CONSTRAINT "tblproject_userId_fkey";

-- DropForeignKey
ALTER TABLE "tblprojectteam" DROP CONSTRAINT "tblprojectteam_userId_fkey";

-- DropForeignKey
ALTER TABLE "tblregistrant" DROP CONSTRAINT "tblregistrant_teamId_fkey";

-- DropForeignKey
ALTER TABLE "tblteam" DROP CONSTRAINT "tblteam_userId_fkey";

-- DropForeignKey
ALTER TABLE "tbluser" DROP CONSTRAINT "tbluser_registrantId_fkey";

-- DropIndex
DROP INDEX "tbluser_registrantId_key";

-- DropIndex
DROP INDEX "tbluser_registrantId_managerId_adminId_superAdminId_key";

-- AlterTable
ALTER TABLE "tblproject" DROP COLUMN "userId",
ADD COLUMN     "projectOwnerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tblprojectteam" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "tbltask" DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus";

-- AlterTable
ALTER TABLE "tbltaskassignment" ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "status" "TaskStatus" NOT NULL;

-- AlterTable
ALTER TABLE "tblteam" DROP COLUMN "userId",
ADD COLUMN     "teamOwnerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tbluser" DROP COLUMN "registrantId",
ADD COLUMN     "developerId" TEXT;

-- DropTable
DROP TABLE "tblregistrant";

-- CreateTable
CREATE TABLE "tbldeveloper" (
    "id" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "profileImage" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbldeveloper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblteammember" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblteammember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbldeveloper_developerId_key" ON "tbldeveloper"("developerId");

-- CreateIndex
CREATE UNIQUE INDEX "tbldeveloper_username_key" ON "tbldeveloper"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tbldeveloper_email_key" ON "tbldeveloper"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbldeveloper_contact_key" ON "tbldeveloper"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "tblprojectteam_projectId_teamId_key" ON "tblprojectteam"("projectId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_developerId_key" ON "tbluser"("developerId");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_role_developerId_managerId_adminId_superAdminId_key" ON "tbluser"("role", "developerId", "managerId", "adminId", "superAdminId");

-- AddForeignKey
ALTER TABLE "tbluser" ADD CONSTRAINT "tbluser_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "tbldeveloper"("developerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblteam" ADD CONSTRAINT "tblteam_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblteammember" ADD CONSTRAINT "tblteammember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "tblteam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblteammember" ADD CONSTRAINT "tblteammember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblproject" ADD CONSTRAINT "tblproject_projectOwnerId_fkey" FOREIGN KEY ("projectOwnerId") REFERENCES "tbluser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
