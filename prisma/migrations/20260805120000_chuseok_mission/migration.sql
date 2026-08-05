-- CreateTable
CREATE TABLE "MissionStep" (
    "id" SERIAL NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answerDisplay" TEXT NOT NULL,
    "locationHint" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionProgress" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "scanDateKst" TEXT NOT NULL,
    "orderedMode" BOOLEAN NOT NULL DEFAULT true,
    "quizzesPassed" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT NOT NULL DEFAULT 'quiz',
    "awaitingScanCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionScan" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scanDateKst" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequenceIndex" INTEGER NOT NULL,

    CONSTRAINT "MissionScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionClaim" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "claimDateKst" TEXT NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "rewardMode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissionClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MissionStep_stepOrder_key" ON "MissionStep"("stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MissionProgress_deviceId_scanDateKst_key" ON "MissionProgress"("deviceId", "scanDateKst");

-- CreateIndex
CREATE INDEX "MissionProgress_deviceId_idx" ON "MissionProgress"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionScan_deviceId_code_scanDateKst_key" ON "MissionScan"("deviceId", "code", "scanDateKst");

-- CreateIndex
CREATE INDEX "MissionScan_deviceId_scanDateKst_idx" ON "MissionScan"("deviceId", "scanDateKst");

-- CreateIndex
CREATE UNIQUE INDEX "MissionClaim_deviceId_claimDateKst_key" ON "MissionClaim"("deviceId", "claimDateKst");

-- CreateIndex
CREATE INDEX "MissionClaim_deviceId_idx" ON "MissionClaim"("deviceId");
