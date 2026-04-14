-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "requireAllTopics" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "topicId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Quiz_topicId_idx" ON "Quiz"("topicId");

-- CreateIndex
CREATE INDEX "Quiz_courseId_idx" ON "Quiz"("courseId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
