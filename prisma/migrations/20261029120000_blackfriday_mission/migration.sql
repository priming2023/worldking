-- Black Friday QR quiz mission tables
CREATE TABLE "BlackfridayStep" (
    "id" SERIAL NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answerDisplay" TEXT NOT NULL,
    "locationHint" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlackfridayStep_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlackfridayStep_stepOrder_key" ON "BlackfridayStep"("stepOrder");

CREATE TABLE "BlackfridayProgress" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "scanDateKst" TEXT NOT NULL,
    "quizzesPassed" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT NOT NULL DEFAULT 'quiz',
    "awaitingScanCode" TEXT,
    "quizWrongCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlackfridayProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlackfridayProgress_deviceId_scanDateKst_key" ON "BlackfridayProgress"("deviceId", "scanDateKst");
CREATE INDEX "BlackfridayProgress_deviceId_idx" ON "BlackfridayProgress"("deviceId");

CREATE TABLE "BlackfridayScan" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scanDateKst" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequenceIndex" INTEGER NOT NULL,

    CONSTRAINT "BlackfridayScan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlackfridayScan_deviceId_code_scanDateKst_key" ON "BlackfridayScan"("deviceId", "code", "scanDateKst");
CREATE INDEX "BlackfridayScan_deviceId_scanDateKst_idx" ON "BlackfridayScan"("deviceId", "scanDateKst");
