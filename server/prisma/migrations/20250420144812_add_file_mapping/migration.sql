-- CreateTable
CREATE TABLE "FileMapping" (
    "id" SERIAL NOT NULL,
    "original" TEXT NOT NULL,
    "mappedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filename" TEXT NOT NULL,

    CONSTRAINT "FileMapping_pkey" PRIMARY KEY ("id")
);
