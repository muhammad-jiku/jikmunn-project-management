/*
  Warnings:

  - You are about to drop the column `email` on the `tbladmin` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `tbladmin` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `tbldeveloper` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `tbldeveloper` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `tblmanager` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `tblmanager` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `tblsuperadmin` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `tblsuperadmin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `tbluser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `tbluser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,email,role,developerId,managerId,adminId,superAdminId]` on the table `tbluser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `tbluser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `tbluser` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tbladmin_email_key";

-- DropIndex
DROP INDEX "tbladmin_username_key";

-- DropIndex
DROP INDEX "tbldeveloper_email_key";

-- DropIndex
DROP INDEX "tbldeveloper_username_key";

-- DropIndex
DROP INDEX "tblmanager_email_key";

-- DropIndex
DROP INDEX "tblmanager_username_key";

-- DropIndex
DROP INDEX "tblsuperadmin_email_key";

-- DropIndex
DROP INDEX "tblsuperadmin_username_key";

-- DropIndex
DROP INDEX "tbluser_role_developerId_managerId_adminId_superAdminId_key";

-- AlterTable
ALTER TABLE "tbladmin" DROP COLUMN "email",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "tbldeveloper" DROP COLUMN "email",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "tblmanager" DROP COLUMN "email",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "tblsuperadmin" DROP COLUMN "email",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "tbluser" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_username_key" ON "tbluser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_email_key" ON "tbluser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbluser_username_email_role_developerId_managerId_adminId_s_key" ON "tbluser"("username", "email", "role", "developerId", "managerId", "adminId", "superAdminId");
