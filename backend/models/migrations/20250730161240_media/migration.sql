-- CreateTable
CREATE TABLE "public"."Media" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fsr" "public"."FSR" NOT NULL,
    "deletedAt" Timestamp(3),

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

--  AlterSequence
ALTER SEQUENCE "Media_id_seq" RESTART WITH 1234321;

-- CreateIndex
CREATE UNIQUE INDEX "Media_path_key" ON "public"."Media"("path");