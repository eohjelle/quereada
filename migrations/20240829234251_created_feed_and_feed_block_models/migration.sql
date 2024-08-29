-- CreateTable
CREATE TABLE "FeedBlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Feed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FeedToFeedBlock" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_FeedToFeedBlock_A_fkey" FOREIGN KEY ("A") REFERENCES "Feed" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FeedToFeedBlock_B_fkey" FOREIGN KEY ("B") REFERENCES "FeedBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_FeedToFeedBlock_AB_unique" ON "_FeedToFeedBlock"("A", "B");

-- CreateIndex
CREATE INDEX "_FeedToFeedBlock_B_index" ON "_FeedToFeedBlock"("B");
