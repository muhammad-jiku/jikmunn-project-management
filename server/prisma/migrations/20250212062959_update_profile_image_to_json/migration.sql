/*
  Warnings:

  - The `profileImage` column on the `tbladmin` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileImage` column on the `tbldeveloper` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileImage` column on the `tblmanager` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileImage` column on the `tblsuperadmin` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tbladmin" DROP COLUMN "profileImage",
ADD COLUMN     "profileImage" JSONB;

-- AlterTable
ALTER TABLE "tbldeveloper" DROP COLUMN "profileImage",
ADD COLUMN     "profileImage" JSONB;

-- AlterTable
ALTER TABLE "tblmanager" DROP COLUMN "profileImage",
ADD COLUMN     "profileImage" JSONB;

-- AlterTable
ALTER TABLE "tblsuperadmin" DROP COLUMN "profileImage",
ADD COLUMN     "profileImage" JSONB;
