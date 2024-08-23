-- CreateTable
CREATE TABLE "Source" (
    "name" TEXT NOT NULL PRIMARY KEY,
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
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "interest" BOOLEAN NOT NULL DEFAULT false,
    "avoid" BOOLEAN NOT NULL DEFAULT false,
    "itemId" INTEGER,
    CONSTRAINT "Topic_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "summary" TEXT,
    "image_link" TEXT,
    "image_caption" TEXT,
    "image_credit" TEXT,
    "relevant_to_interest_topic" BOOLEAN NOT NULL DEFAULT false,
    "relevant_to_avoid_topic" BOOLEAN NOT NULL DEFAULT false,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "read_later" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Item_source_name_fkey" FOREIGN KEY ("source_name") REFERENCES "Source" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_lang_id_fkey" FOREIGN KEY ("lang_id") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AuthorToItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AuthorToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Author" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AuthorToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_source_name_channel_name_key" ON "Channel"("source_name", "channel_name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_id_key" ON "Language"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_link_key" ON "Item"("link");

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorToItem_AB_unique" ON "_AuthorToItem"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorToItem_B_index" ON "_AuthorToItem"("B");
