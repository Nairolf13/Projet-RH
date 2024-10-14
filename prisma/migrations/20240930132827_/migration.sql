/*
  Warnings:

  - A unique constraint covering the columns `[mail]` on the table `Entreprise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mail` to the `Entreprise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Entreprise` ADD COLUMN `mail` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Entreprise_mail_key` ON `Entreprise`(`mail`);
