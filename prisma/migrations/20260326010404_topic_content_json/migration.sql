/*
  Warnings:

  - Changed the type of `content` on the `Topic` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Topic"
ALTER COLUMN "content" TYPE JSONB
USING jsonb_build_object(
  'version', '1.0',
  'blocks', jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'type', 'text',
      'content', content,
      'profiles', jsonb_build_array('Visual', 'Auditivo', 'Kinestesico')
    )
  )
);
