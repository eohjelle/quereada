/*
  Warnings:

  - You are about to drop the `Click` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BlockToItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FeedToItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `seen` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `Boolean` to `Int`.

*/
-- DropIndex
DROP INDEX "_BlockToItem_B_index";

-- DropIndex
DROP INDEX "_BlockToItem_AB_unique";

-- DropIndex
DROP INDEX "_FeedToItem_B_index";

-- DropIndex
DROP INDEX "_FeedToItem_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Click";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_BlockToItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_FeedToItem";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_item_seen_in_blocks" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_item_seen_in_blocks_A_fkey" FOREIGN KEY ("A") REFERENCES "Block" ("title") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_item_seen_in_blocks_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_item_clicked_in_blocks" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_item_clicked_in_blocks_A_fkey" FOREIGN KEY ("A") REFERENCES "Block" ("title") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_item_clicked_in_blocks_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_item_seen_in_feeds" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_item_seen_in_feeds_A_fkey" FOREIGN KEY ("A") REFERENCES "Feed" ("title") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_item_seen_in_feeds_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_item_clicked_in_feeds" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_item_clicked_in_feeds_A_fkey" FOREIGN KEY ("A") REFERENCES "Feed" ("title") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_item_clicked_in_feeds_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    CONSTRAINT "Item_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_lang_id_fkey" FOREIGN KEY ("lang_id") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("comments_link", "comments_summary", "content", "date_added", "date_published", "description", "id", "image_caption", "image_credit", "image_link", "item_type", "lang_id", "likes", "link", "number_of_words", "read_later", "saved", "seen", "source_name", "summarizable", "summary", "title") SELECT "comments_link", "comments_summary", "content", "date_added", "date_published", "description", "id", "image_caption", "image_credit", "image_link", "item_type", "lang_id", "likes", "link", "number_of_words", "read_later", "saved", "seen", "source_name", "summarizable", "summary", "title" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_link_key" ON "Item"("link");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_item_seen_in_blocks_AB_unique" ON "_item_seen_in_blocks"("A", "B");

-- CreateIndex
CREATE INDEX "_item_seen_in_blocks_B_index" ON "_item_seen_in_blocks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_item_clicked_in_blocks_AB_unique" ON "_item_clicked_in_blocks"("A", "B");

-- CreateIndex
CREATE INDEX "_item_clicked_in_blocks_B_index" ON "_item_clicked_in_blocks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_item_seen_in_feeds_AB_unique" ON "_item_seen_in_feeds"("A", "B");

-- CreateIndex
CREATE INDEX "_item_seen_in_feeds_B_index" ON "_item_seen_in_feeds"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_item_clicked_in_feeds_AB_unique" ON "_item_clicked_in_feeds"("A", "B");

-- CreateIndex
CREATE INDEX "_item_clicked_in_feeds_B_index" ON "_item_clicked_in_feeds"("B");
