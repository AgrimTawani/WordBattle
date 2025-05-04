-- CreateTable
CREATE TABLE "Rush" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "highscore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Rush_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rush_userId_key" ON "Rush"("userId");

-- AddForeignKey
ALTER TABLE "Rush" ADD CONSTRAINT "Rush_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
