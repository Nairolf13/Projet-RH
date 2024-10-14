-- DropForeignKey
ALTER TABLE `Employe` DROP FOREIGN KEY `Employe_computerId_fkey`;

-- AlterTable
ALTER TABLE `Employe` MODIFY `computerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Employe` ADD CONSTRAINT `Employe_computerId_fkey` FOREIGN KEY (`computerId`) REFERENCES `Computer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
