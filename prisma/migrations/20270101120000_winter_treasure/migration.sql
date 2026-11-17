-- 2027 New Year winter QR time-attack treasure hunt
CREATE TABLE "WinterProgress" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "scanDateKst" TEXT NOT NULL,
    "timeLimitMin" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'idle',
    "finishReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WinterProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WinterProgress_deviceId_scanDateKst_key" ON "WinterProgress"("deviceId", "scanDateKst");
CREATE INDEX "WinterProgress_deviceId_idx" ON "WinterProgress"("deviceId");

CREATE TABLE "WinterScan" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scanDateKst" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequenceIndex" INTEGER NOT NULL,

    CONSTRAINT "WinterScan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WinterScan_deviceId_code_scanDateKst_key" ON "WinterScan"("deviceId", "code", "scanDateKst");
CREATE INDEX "WinterScan_deviceId_scanDateKst_idx" ON "WinterScan"("deviceId", "scanDateKst");

CREATE TABLE "WinterClaim" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "claimDateKst" TEXT NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "timeLimitMin" INTEGER NOT NULL,
    "finishReason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WinterClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WinterClaim_deviceId_claimDateKst_key" ON "WinterClaim"("deviceId", "claimDateKst");
CREATE INDEX "WinterClaim_deviceId_idx" ON "WinterClaim"("deviceId");
