-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Source" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "source_type" TEXT NOT NULL,
    "url" TEXT,
    "date_added" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Source" ("date_added", "name", "source_type", "url") SELECT "date_added", "name", "source_type", "url" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
