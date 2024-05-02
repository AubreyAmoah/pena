/*
  Warnings:

  - Added the required column `sellingPrice` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "sellingPrice" DECIMAL(65,30) NOT NULL;
