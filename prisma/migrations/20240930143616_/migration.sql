/*
  Warnings:

  - A unique constraint covering the columns `[mac]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mac` to the `Computer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Computer` ADD COLUMN `mac` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Computer_mac_key` ON `Computer`(`mac`);
