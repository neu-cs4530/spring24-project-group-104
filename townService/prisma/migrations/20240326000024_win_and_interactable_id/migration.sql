/*
  Warnings:

  - You are about to drop the column `score` on the `GameRecord` table. All the data in the column will be lost.
  - Added the required column `interactableId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `win` to the `GameRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "interactableId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameRecord" DROP COLUMN "score",
ADD COLUMN     "win" BOOLEAN NOT NULL;
