/*
  Warnings:

  - Added the required column `source_type` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channel_name" TEXT NOT NULL DEFAULT 'default',
    "source_name" TEXT NOT NULL,
    CONSTRAINT "Channel_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("channel_name", "id", "source_name") SELECT "channel_name", "id", "source_name" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_source_name_channel_name_key" ON "Channel"("source_name", "channel_name");
CREATE TABLE "new_Source" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "source_type" TEXT NOT NULL DEFAULT "default",
    "url" TEXT,
    "date_added" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Source" ("date_added", "name", "url") SELECT "date_added", "name", "url" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
