-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channel_name" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    CONSTRAINT "Channel_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("channel_name", "id", "source_name") SELECT "channel_name", "id", "source_name" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_source_name_channel_name_key" ON "Channel"("source_name", "channel_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
