-- Halloween QR quiz mission tables
CREATE TABLE "HalloweenStep" (
    "id" SERIAL NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answerDisplay" TEXT NOT NULL,
    "locationHint" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HalloweenStep_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HalloweenStep_stepOrder_key" ON "HalloweenStep"("stepOrder");

CREATE TABLE "HalloweenProgress" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "scanDateKst" TEXT NOT NULL,
    "orderedMode" BOOLEAN NOT NULL DEFAULT true,
    "quizzesPassed" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT NOT NULL DEFAULT 'quiz',
    "awaitingScanCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HalloweenProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HalloweenProgress_deviceId_scanDateKst_key" ON "HalloweenProgress"("deviceId", "scanDateKst");
CREATE INDEX "HalloweenProgress_deviceId_idx" ON "HalloweenProgress"("deviceId");

CREATE TABLE "HalloweenScan" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scanDateKst" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequenceIndex" INTEGER NOT NULL,

    CONSTRAINT "HalloweenScan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HalloweenScan_deviceId_code_scanDateKst_key" ON "HalloweenScan"("deviceId", "code", "scanDateKst");
CREATE INDEX "HalloweenScan_deviceId_scanDateKst_idx" ON "HalloweenScan"("deviceId", "scanDateKst");

CREATE TABLE "HalloweenClaim" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "claimDateKst" TEXT NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "rewardMode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HalloweenClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HalloweenClaim_deviceId_claimDateKst_key" ON "HalloweenClaim"("deviceId", "claimDateKst");
CREATE INDEX "HalloweenClaim_deviceId_idx" ON "HalloweenClaim"("deviceId");
