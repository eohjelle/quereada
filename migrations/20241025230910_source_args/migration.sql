/*
  Warnings:

  - You are about to drop the `Channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `source_class` on the `Source` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Source` table. All the data in the column will be lost.
  - Added the required column `implementation` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Channel_source_name_channel_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Channel";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Source" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "implementation" TEXT NOT NULL,
    "args" TEXT,
    "date_added" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Source" ("date_added", "name") SELECT "date_added", "name" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
