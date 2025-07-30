-- CreateEnum
CREATE TYPE "public"."FSR" AS ENUM ('GSR', 'FRIS', 'STUART');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."UserAdmin" (
    "userId" TEXT NOT NULL,
    "fsr" "public"."FSR" NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Page" (
    "id" SERIAL NOT NULL,
    "title_nl" TEXT NOT NULL,
    "path_nl" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "path_en" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAdmin_userId_fsr_key" ON "public"."UserAdmin"("userId", "fsr");

-- CreateIndex
CREATE UNIQUE INDEX "Page_path_nl_key" ON "public"."Page"("path_nl");

-- CreateIndex
CREATE UNIQUE INDEX "Page_path_en_key" ON "public"."Page"("path_en");

-- AddForeignKey
ALTER TABLE "public"."UserAdmin" ADD CONSTRAINT "UserAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
