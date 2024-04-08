/*
  Warnings:

  - Added the required column `sid` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "sid" TEXT NOT NULL;
