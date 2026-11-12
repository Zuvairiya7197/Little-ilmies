-- CreateTable
CREATE TABLE "email_daily_counts" (
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "email_daily_counts_pkey" PRIMARY KEY ("day")
);
