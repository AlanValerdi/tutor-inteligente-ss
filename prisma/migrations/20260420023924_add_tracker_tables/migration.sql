-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('Video', 'Audio', 'Diapositiva', 'Quiz', 'JuegoInteractivo', 'ImagenInteractiva', 'Simulacion', 'DiapositivaAdicional');

-- CreateTable
CREATE TABLE "InteractionSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL DEFAULT 1,
    "totalTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "idleTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tabSwitches" INTEGER NOT NULL DEFAULT 0,
    "missedClicks" INTEGER NOT NULL DEFAULT 0,
    "scrollReversals" INTEGER NOT NULL DEFAULT 0,
    "consecutiveClicks" INTEGER NOT NULL DEFAULT 0,
    "anxietyLevel" "AnxietyLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InteractionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceInteraction" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "timeOnResource" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "percentageWatched" DOUBLE PRECISION,
    "timeWatched" DOUBLE PRECISION,
    "timesPaused" INTEGER,
    "timesReplayed" INTEGER,
    "totalSlides" INTEGER,
    "slidesViewed" INTEGER,
    "percentageViewed" DOUBLE PRECISION,
    "timesReviewed" INTEGER,
    "zoomUsed" BOOLEAN,
    "timePerQuestion" JSONB,
    "correctAnswers" INTEGER,
    "incorrectAnswers" INTEGER,
    "attemptsPerQuestion" JSONB,
    "gameCompleted" BOOLEAN,
    "timesPlayed" INTEGER,
    "helpUsed" BOOLEAN,
    "correctResponses" INTEGER,
    "incorrectResponses" INTEGER,
    "completionPercent" DOUBLE PRECISION,
    "zonesMarked" INTEGER,
    "visualAidsUsed" BOOLEAN,
    "attemptsImage" INTEGER,
    "correctIdentifications" INTEGER,
    "dataSelected" JSONB,
    "simulationChanges" INTEGER,
    "attempts" INTEGER,
    "toolsUsed" JSONB,
    "solutionPrecision" DOUBLE PRECISION,
    "modifiedCaseResolved" BOOLEAN,
    "visualSupportUsed" BOOLEAN,
    "reflectionTime" DOUBLE PRECISION,
    "errorsIdentified" INTEGER,
    "reflectionLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InteractionSession_userId_idx" ON "InteractionSession"("userId");

-- CreateIndex
CREATE INDEX "InteractionSession_topicId_idx" ON "InteractionSession"("topicId");

-- CreateIndex
CREATE INDEX "InteractionSession_courseId_idx" ON "InteractionSession"("courseId");

-- CreateIndex
CREATE INDEX "ResourceInteraction_sessionId_idx" ON "ResourceInteraction"("sessionId");

-- CreateIndex
CREATE INDEX "ResourceInteraction_resourceType_idx" ON "ResourceInteraction"("resourceType");

-- AddForeignKey
ALTER TABLE "InteractionSession" ADD CONSTRAINT "InteractionSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionSession" ADD CONSTRAINT "InteractionSession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionSession" ADD CONSTRAINT "InteractionSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceInteraction" ADD CONSTRAINT "ResourceInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InteractionSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
