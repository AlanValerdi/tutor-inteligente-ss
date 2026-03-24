-- CreateEnum
CREATE TYPE "StudyProfile" AS ENUM ('Visual', 'Auditivo', 'Kinestesico');

-- CreateEnum
CREATE TYPE "AnxietyLevel" AS ENUM ('Bajo', 'Medio', 'Alto');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "anxietyLevel" "AnxietyLevel" NOT NULL DEFAULT 'Bajo',
ADD COLUMN     "auditivoScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "averageScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completedTopics" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "consecutiveClicks" JSONB,
ADD COLUMN     "idleTime" JSONB,
ADD COLUMN     "kinestesicoScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastAccessedAt" TIMESTAMP(3),
ADD COLUMN     "missedClicks" JSONB,
ADD COLUMN     "scrollReversals" JSONB,
ADD COLUMN     "studyProfile" "StudyProfile",
ADD COLUMN     "tabSwitches" JSONB,
ADD COLUMN     "timePerQuestion" JSONB,
ADD COLUMN     "visualScore" INTEGER NOT NULL DEFAULT 0;
