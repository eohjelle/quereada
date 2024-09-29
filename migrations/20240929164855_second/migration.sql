/*
  Warnings:

  - You are about to drop the `FeedBlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopicGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FeedBlockToSource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FeedBlockToTopicGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FeedToFeedBlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TopicToTopicGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_checked_relevance_of_items_to_topic_group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_items_relevant_to_topic_group` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Feed` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Feed` table. All the data in the column will be lost.
  - Added the required column `index` to the `Feed` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FeedBlock_header_key";

-- DropIndex
DROP INDEX "Topic_topic_key";

-- DropIndex
DROP INDEX "TopicGroup_title_key";

-- DropIndex
DROP INDEX "_FeedBlockToSource_B_index";

-- DropIndex
DROP INDEX "_FeedBlockToSource_AB_unique";

-- DropIndex
DROP INDEX "_FeedBlockToTopicGroup_B_index";

-- DropIndex
DROP INDEX "_FeedBlockToTopicGroup_AB_unique";

-- DropIndex
DROP INDEX "_FeedToFeedBlock_B_index";

-- DropIndex
DROP INDEX "_FeedToFeedBlock_AB_unique";

-- DropIndex
DROP INDEX "_TopicToTopicGroup_B_index";

-- DropIndex
DROP INDEX "_TopicToTopicGroup_AB_unique";

-- DropIndex
DROP INDEX "_checked_relevance_of_items_to_topic_group_B_index";

-- DropIndex
DROP INDEX "_checked_relevance_of_items_to_topic_group_AB_unique";

-- DropIndex
DROP INDEX "_items_relevant_to_topic_group_B_index";

-- DropIndex
DROP INDEX "_items_relevant_to_topic_group_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FeedBlock";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Topic";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TopicGroup";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_FeedBlockToSource";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_FeedBlockToTopicGroup";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_FeedToFeedBlock";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TopicToTopicGroup";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_checked_relevance_of_items_to_topic_group";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_items_relevant_to_topic_group";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Filter" (
    "title" TEXT NOT NULL PRIMARY KEY,
    "implementation" TEXT NOT NULL,
    "args" TEXT
);

-- CreateTable
CREATE TABLE "Block" (
    "title" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OrderedBlocksInFeed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "block_title" TEXT NOT NULL,
    "feed_title" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    CONSTRAINT "OrderedBlocksInFeed_block_title_fkey" FOREIGN KEY ("block_title") REFERENCES "Block" ("title") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderedBlocksInFeed_feed_title_fkey" FOREIGN KEY ("feed_title") REFERENCES "Feed" ("title") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_item_checked_filter" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_item_checked_filter_A_fkey" FOREIGN KEY ("A") REFERENCES "Filter" ("title") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_item_checked_filter_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_item_passed_filter" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_item_passed_filter_A_fkey" FOREIGN KEY ("A") REFERENCES "Filter" ("title") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_item_passed_filter_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BlockToItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BlockToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Block" ("title") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlockToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_FeedToItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_FeedToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Feed" ("title") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FeedToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feed" (
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Feed" ("title") SELECT "title" FROM "Feed";
DROP TABLE "Feed";
ALTER TABLE "new_Feed" RENAME TO "Feed";
CREATE UNIQUE INDEX "Feed_title_key" ON "Feed"("title");
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
    "clicked" INTEGER NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX "Filter_title_key" ON "Filter"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Block_title_key" ON "Block"("title");

-- CreateIndex
CREATE UNIQUE INDEX "OrderedBlocksInFeed_feed_title_block_title_index_key" ON "OrderedBlocksInFeed"("feed_title", "block_title", "index");

-- CreateIndex
CREATE UNIQUE INDEX "_item_checked_filter_AB_unique" ON "_item_checked_filter"("A", "B");

-- CreateIndex
CREATE INDEX "_item_checked_filter_B_index" ON "_item_checked_filter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_item_passed_filter_AB_unique" ON "_item_passed_filter"("A", "B");

-- CreateIndex
CREATE INDEX "_item_passed_filter_B_index" ON "_item_passed_filter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlockToItem_AB_unique" ON "_BlockToItem"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockToItem_B_index" ON "_BlockToItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FeedToItem_AB_unique" ON "_FeedToItem"("A", "B");

-- CreateIndex
CREATE INDEX "_FeedToItem_B_index" ON "_FeedToItem"("B");
