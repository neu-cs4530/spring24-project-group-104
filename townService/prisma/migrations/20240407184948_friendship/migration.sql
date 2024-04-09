/*
  Warnings:

  - A unique constraint covering the columns `[userID1,userID2]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sid` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Made the column `displayName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- -- AlterTable
-- ALTER TABLE "ChatMessage" ADD COLUMN     "sid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "displayName" SET NOT NULL;

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "userID1" TEXT NOT NULL,
    "userID2" TEXT NOT NULL,
    "accept" BOOLEAN NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_userID1_userID2_key" ON "FriendRequest"("userID1", "userID2");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userID1_userID2_key" ON "Friendship"("userID1", "userID2");

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_userID1_fkey" FOREIGN KEY ("userID1") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_userID2_fkey" FOREIGN KEY ("userID2") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
