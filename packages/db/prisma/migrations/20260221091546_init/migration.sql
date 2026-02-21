/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Question` table. All the data in the column will be lost.
  - Changed the type of `operation` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "questionOperations" AS ENUM ('ADD', 'SUB', 'MUL', 'DIV');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "difficulty",
DROP COLUMN "operation",
ADD COLUMN     "operation" "questionOperations" NOT NULL;
