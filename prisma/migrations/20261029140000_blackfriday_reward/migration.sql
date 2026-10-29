-- Ordered play, partial claim, once-per-day staff confirmation
ALTER TABLE "BlackfridayProgress" ADD COLUMN "orderedMode" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "BlackfridayClaim" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "claimDateKst" TEXT NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "rewardMode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlackfridayClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlackfridayClaim_deviceId_claimDateKst_key" ON "BlackfridayClaim"("deviceId", "claimDateKst");
CREATE INDEX "BlackfridayClaim_deviceId_idx" ON "BlackfridayClaim"("deviceId");
