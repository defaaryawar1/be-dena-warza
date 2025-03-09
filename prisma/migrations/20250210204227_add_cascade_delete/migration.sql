-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_memoryId_fkey";

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
