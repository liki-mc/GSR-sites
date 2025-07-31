/*
  Warnings:

  - You are about to drop the column `fsr` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `fsr` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `fsr` on the `UserAdmin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fsrId,path_nl]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fsrId,path_en]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,fsrId]` on the table `UserAdmin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fsrId` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fsrId` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fsrId` to the `UserAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Page_fsr_path_en_key";

-- DropIndex
DROP INDEX "public"."Page_fsr_path_nl_key";

-- DropIndex
DROP INDEX "public"."UserAdmin_userId_fsr_key";

-- AlterTable
ALTER TABLE "public"."Media" DROP COLUMN "fsr",
ADD COLUMN     "fsrId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Page" DROP COLUMN "fsr",
ADD COLUMN     "fsrId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserAdmin" DROP COLUMN "fsr",
ADD COLUMN     "fsrId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."FSR";

-- CreateTable
CREATE TABLE "public"."FSR" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "logo" TEXT,
    "uforaUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "discordUrl" TEXT,
    "linkedinUrl" TEXT,
    "tiktokUrl" TEXT,
    "githubUrl" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "FSR_slug_key" ON "public"."FSR"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Page_fsrId_path_nl_key" ON "public"."Page"("fsrId", "path_nl");

-- CreateIndex
CREATE UNIQUE INDEX "Page_fsrId_path_en_key" ON "public"."Page"("fsrId", "path_en");

-- CreateIndex
CREATE UNIQUE INDEX "UserAdmin_userId_fsrId_key" ON "public"."UserAdmin"("userId", "fsrId");

-- AddForeignKey
ALTER TABLE "public"."UserAdmin" ADD CONSTRAINT "UserAdmin_fsrId_fkey" FOREIGN KEY ("fsrId") REFERENCES "public"."FSR"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Page" ADD CONSTRAINT "Page_fsrId_fkey" FOREIGN KEY ("fsrId") REFERENCES "public"."FSR"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_fsrId_fkey" FOREIGN KEY ("fsrId") REFERENCES "public"."FSR"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
