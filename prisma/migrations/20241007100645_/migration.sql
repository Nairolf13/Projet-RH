/*
  Warnings:

  - A unique constraint covering the columns `[computerId]` on the table `Employe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Employe_computerId_key` ON `Employe`(`computerId`);
