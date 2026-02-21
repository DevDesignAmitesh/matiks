-- CreateEnum
CREATE TYPE "userStatus" AS ENUM ('IDOL', 'PLAYING', 'SEARCHING');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "userStatus" NOT NULL DEFAULT 'IDOL';
