-- CreateTable
CREATE TABLE "Source" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "source_class" TEXT NOT NULL,
    "url" TEXT,
    "date_added" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channel_name" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    CONSTRAINT "Channel_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Topic" (
    "topic" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "TopicGroup" (
    "title" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Author" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Item" (
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

-- CreateTable
CREATE TABLE "FeedBlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "header" TEXT NOT NULL,
    "prisma_query" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Feed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TopicToTopicGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TopicToTopicGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Topic" ("topic") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TopicToTopicGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "TopicGroup" ("title") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AuthorToItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AuthorToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Author" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AuthorToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_checked_relevance_of_items_to_topic_group" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_checked_relevance_of_items_to_topic_group_A_fkey" FOREIGN KEY ("A") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_checked_relevance_of_items_to_topic_group_B_fkey" FOREIGN KEY ("B") REFERENCES "TopicGroup" ("title") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_items_relevant_to_topic_group" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_items_relevant_to_topic_group_A_fkey" FOREIGN KEY ("A") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_items_relevant_to_topic_group_B_fkey" FOREIGN KEY ("B") REFERENCES "TopicGroup" ("title") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_FeedBlockToSource" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FeedBlockToSource_A_fkey" FOREIGN KEY ("A") REFERENCES "FeedBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FeedBlockToSource_B_fkey" FOREIGN KEY ("B") REFERENCES "Source" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_FeedBlockToTopicGroup" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FeedBlockToTopicGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "FeedBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FeedBlockToTopicGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "TopicGroup" ("title") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_FeedToFeedBlock" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_FeedToFeedBlock_A_fkey" FOREIGN KEY ("A") REFERENCES "Feed" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FeedToFeedBlock_B_fkey" FOREIGN KEY ("B") REFERENCES "FeedBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_source_name_channel_name_key" ON "Channel"("source_name", "channel_name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_id_key" ON "Language"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_topic_key" ON "Topic"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "TopicGroup_title_key" ON "TopicGroup"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_link_key" ON "Item"("link");

-- CreateIndex
CREATE UNIQUE INDEX "FeedBlock_header_key" ON "FeedBlock"("header");

-- CreateIndex
CREATE UNIQUE INDEX "Feed_title_key" ON "Feed"("title");

-- CreateIndex
CREATE UNIQUE INDEX "_TopicToTopicGroup_AB_unique" ON "_TopicToTopicGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_TopicToTopicGroup_B_index" ON "_TopicToTopicGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorToItem_AB_unique" ON "_AuthorToItem"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorToItem_B_index" ON "_AuthorToItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_checked_relevance_of_items_to_topic_group_AB_unique" ON "_checked_relevance_of_items_to_topic_group"("A", "B");

-- CreateIndex
CREATE INDEX "_checked_relevance_of_items_to_topic_group_B_index" ON "_checked_relevance_of_items_to_topic_group"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_items_relevant_to_topic_group_AB_unique" ON "_items_relevant_to_topic_group"("A", "B");

-- CreateIndex
CREATE INDEX "_items_relevant_to_topic_group_B_index" ON "_items_relevant_to_topic_group"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FeedBlockToSource_AB_unique" ON "_FeedBlockToSource"("A", "B");

-- CreateIndex
CREATE INDEX "_FeedBlockToSource_B_index" ON "_FeedBlockToSource"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FeedBlockToTopicGroup_AB_unique" ON "_FeedBlockToTopicGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_FeedBlockToTopicGroup_B_index" ON "_FeedBlockToTopicGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FeedToFeedBlock_AB_unique" ON "_FeedToFeedBlock"("A", "B");

-- CreateIndex
CREATE INDEX "_FeedToFeedBlock_B_index" ON "_FeedToFeedBlock"("B");
