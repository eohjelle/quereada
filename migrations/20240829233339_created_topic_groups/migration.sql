/*
  Warnings:

  - You are about to drop the column `relevant_to_avoid_topic` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `relevant_to_interest_topic` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `Topic` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TopicGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TopicToTopicGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_TopicToTopicGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TopicToTopicGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "TopicGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_checked_relevance_of_topic_group_to_items" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_checked_relevance_of_topic_group_to_items_A_fkey" FOREIGN KEY ("A") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_checked_relevance_of_topic_group_to_items_B_fkey" FOREIGN KEY ("B") REFERENCES "TopicGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_topic_group_is_relevant_to_items" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_topic_group_is_relevant_to_items_A_fkey" FOREIGN KEY ("A") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_topic_group_is_relevant_to_items_B_fkey" FOREIGN KEY ("B") REFERENCES "TopicGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "summary" TEXT,
    "image_link" TEXT,
    "image_caption" TEXT,
    "image_credit" TEXT,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "read_later" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "summarizable" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Item_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_lang_id_fkey" FOREIGN KEY ("lang_id") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("comments_link", "comments_summary", "content", "date_added", "date_published", "description", "id", "image_caption", "image_credit", "image_link", "item_type", "lang_id", "likes", "link", "number_of_words", "read_later", "saved", "seen", "source_name", "summary", "title") SELECT "comments_link", "comments_summary", "content", "date_added", "date_published", "description", "id", "image_caption", "image_credit", "image_link", "item_type", "lang_id", "likes", "link", "number_of_words", "read_later", "saved", "seen", "source_name", "summary", "title" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_link_key" ON "Item"("link");
CREATE TABLE "new_Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "interest" BOOLEAN NOT NULL DEFAULT false,
    "avoid" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Topic" ("avoid", "id", "interest", "name") SELECT "avoid", "id", "interest", "name" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TopicGroup_name_key" ON "TopicGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TopicToTopicGroup_AB_unique" ON "_TopicToTopicGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_TopicToTopicGroup_B_index" ON "_TopicToTopicGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_checked_relevance_of_topic_group_to_items_AB_unique" ON "_checked_relevance_of_topic_group_to_items"("A", "B");

-- CreateIndex
CREATE INDEX "_checked_relevance_of_topic_group_to_items_B_index" ON "_checked_relevance_of_topic_group_to_items"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_topic_group_is_relevant_to_items_AB_unique" ON "_topic_group_is_relevant_to_items"("A", "B");

-- CreateIndex
CREATE INDEX "_topic_group_is_relevant_to_items_B_index" ON "_topic_group_is_relevant_to_items"("B");
