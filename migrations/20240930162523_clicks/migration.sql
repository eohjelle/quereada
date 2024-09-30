/*
  Warnings:

  - You are about to drop the column `close_if_not_items_for` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `clicked` on the `Item` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Click" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clicked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "item_id" INTEGER NOT NULL,
    "feed_title" TEXT NOT NULL,
    "block_title" TEXT NOT NULL,
    CONSTRAINT "Click_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Click_feed_title_fkey" FOREIGN KEY ("feed_title") REFERENCES "Feed" ("title") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Click_block_title_fkey" FOREIGN KEY ("block_title") REFERENCES "Block" ("title") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Block" (
    "title" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "stop_loading_if_not_items_for" INTEGER
);
INSERT INTO "new_Block" ("query", "title") SELECT "query", "title" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_title_key" ON "Block"("title");
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
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "read_later" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Item_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_lang_id_fkey" FOREIGN KEY ("lang_id") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("comments_link", "comments_summary", "content", "date_added", "date_published", "description", "id", "image_caption", "image_credit", "image_link", "item_type", "lang_id", "likes", "link", "number_of_words", "read_later", "saved", "seen", "source_name", "summarizable", "summary", "title") SELECT "comments_link", "comments_summary", "content", "date_added", "date_published", "description", "id", "image_caption", "image_credit", "image_link", "item_type", "lang_id", "likes", "link", "number_of_words", "read_later", "saved", "seen", "source_name", "summarizable", "summary", "title" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_link_key" ON "Item"("link");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
