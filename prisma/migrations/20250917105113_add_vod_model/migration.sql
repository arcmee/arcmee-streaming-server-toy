-- CreateTable
CREATE TABLE "public"."Vod" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "streamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Vod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vod_streamId_key" ON "public"."Vod"("streamId");

-- AddForeignKey
ALTER TABLE "public"."Vod" ADD CONSTRAINT "Vod_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "public"."Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vod" ADD CONSTRAINT "Vod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
