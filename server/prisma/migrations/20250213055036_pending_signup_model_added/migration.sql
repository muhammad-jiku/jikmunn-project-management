-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'UNDER_REVIEW';

-- CreateTable
CREATE TABLE "tblpending_signup" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "password" TEXT NOT NULL,
    "profileData" JSONB NOT NULL,
    "emailVerificationToken" TEXT NOT NULL,
    "emailVerificationExpires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblpending_signup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tblpending_signup_email_key" ON "tblpending_signup"("email");
