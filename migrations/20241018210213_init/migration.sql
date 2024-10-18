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
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Filter" (
    "title" TEXT NOT NULL PRIMARY KEY,
    "implementation" TEXT NOT NULL,
    "args" TEXT
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
    "read_later" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "seen" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Item_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_lang_id_fkey" FOREIGN KEY ("lang_id") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Block" (
    "title" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "stop_loading_if_not_items_for" INTEGER
);

-- CreateTable
CREATE TABLE "Feed" (
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL PRIMARY KEY
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
CREATE TABLE "_AuthorToItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AuthorToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Author" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AuthorToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_source_name_channel_name_key" ON "Channel"("source_name", "channel_name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_id_key" ON "Language"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Filter_title_key" ON "Filter"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_link_key" ON "Item"("link");

-- CreateIndex
CREATE UNIQUE INDEX "Block_title_key" ON "Block"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Feed_title_key" ON "Feed"("title");

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
CREATE UNIQUE INDEX "_AuthorToItem_AB_unique" ON "_AuthorToItem"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorToItem_B_index" ON "_AuthorToItem"("B");

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
