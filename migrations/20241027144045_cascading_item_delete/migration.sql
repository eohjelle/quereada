-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_type" TEXT NOT NULL DEFAULT 'Link',
    "source_name" TEXT NOT NULL,
    "lang_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT NOT NULL,
    "date_published" DATETIME,
    "date_added" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "likes" INTEGER,
    "comments_link" TEXT,
    "comments_summary" TEXT,
    "content" TEXT,
    "number_of_words" INTEGER,
    "summarizable" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "image_link" TEXT,
    "image_caption" TEXT,
    "image_credit" TEXT,
    "read_later" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "seen" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Item_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Item_lang_id_fkey" FOREIGN KEY ("lang_id") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("clicks", "comments_link", "comments_summary", "content", "date_added", "date_published", "description", "id", "image_caption", "image_credit", "image_link", "item_type", "lang_id", "likes", "link", "number_of_words", "read_later", "saved", "seen", "source_name", "summarizable", "summary", "title") SELECT "clicks", "comments_link", "comments_summary", "content", "date_added", "date_published", "description", "id", "image_caption", "image_credit", "image_link", "item_type", "lang_id", "likes", "link", "number_of_words", "read_later", "saved", "seen", "source_name", "summarizable", "summary", "title" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_link_key" ON "Item"("link");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
