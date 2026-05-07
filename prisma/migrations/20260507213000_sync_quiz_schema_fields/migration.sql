-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN IF NOT EXISTS "isDiagnostic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "timeSpent" INTEGER;
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "correctAnswers" INTEGER;
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "incorrectAnswers" INTEGER;

-- Drop old tracker columns from QuizAttempt since they were moved to InteractionSession
ALTER TABLE "QuizAttempt" DROP COLUMN IF EXISTS "tabSwitches";
ALTER TABLE "QuizAttempt" DROP COLUMN IF EXISTS "consecutiveClicks";
ALTER TABLE "QuizAttempt" DROP COLUMN IF EXISTS "missedClicks";
ALTER TABLE "QuizAttempt" DROP COLUMN IF EXISTS "idleTimeSeconds";
ALTER TABLE "QuizAttempt" DROP COLUMN IF EXISTS "scrollReversals";
