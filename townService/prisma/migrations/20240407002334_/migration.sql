/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userID1,userID2]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email";

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
