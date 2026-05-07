-- Migration: sync_tracker_schema
-- Moves quiz metrics from ResourceInteraction to InteractionSession,
-- adds new behavioral metrics to InteractionSession,
-- and removes the unused 'Quiz' value from ResourceType enum.

-- ── 1. Add new columns to InteractionSession ──────────────────────────────
ALTER TABLE "InteractionSession" ADD COLUMN "copyAttempts"      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "InteractionSession" ADD COLUMN "rightClickCount"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "InteractionSession" ADD COLUMN "windowBlurs"       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "InteractionSession" ADD COLUMN "timePerQuestion"   JSONB;
ALTER TABLE "InteractionSession" ADD COLUMN "attemptsPerQuestion" JSONB;
ALTER TABLE "InteractionSession" ADD COLUMN "backNavigations"   INTEGER;
ALTER TABLE "InteractionSession" ADD COLUMN "timeToFirstAnswer" JSONB;

-- ── 2. Remove quiz-related columns from ResourceInteraction ───────────────
ALTER TABLE "ResourceInteraction" DROP COLUMN "timePerQuestion";
ALTER TABLE "ResourceInteraction" DROP COLUMN "correctAnswers";
ALTER TABLE "ResourceInteraction" DROP COLUMN "incorrectAnswers";
ALTER TABLE "ResourceInteraction" DROP COLUMN "attemptsPerQuestion";

-- ── 3. Remove 'Quiz' value from ResourceType enum ─────────────────────────
-- PostgreSQL does not support DROP VALUE on enums directly; requires recreating the type.
ALTER TYPE "ResourceType" RENAME TO "ResourceType_old";
CREATE TYPE "ResourceType" AS ENUM ('Video', 'Audio', 'Diapositiva', 'JuegoInteractivo', 'ImagenInteractiva', 'Simulacion', 'DiapositivaAdicional');
ALTER TABLE "ResourceInteraction"
  ALTER COLUMN "resourceType" TYPE "ResourceType"
  USING "resourceType"::text::"ResourceType";
DROP TYPE "ResourceType_old";
