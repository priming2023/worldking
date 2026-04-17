-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasureQr" (
    "code" TEXT NOT NULL,

    CONSTRAINT "TreasureQr_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "claimDateKst" TEXT NOT NULL,
    "countAtClaim" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_deviceId_idx" ON "Scan"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Scan_deviceId_code_key" ON "Scan"("deviceId", "code");

-- CreateIndex
CREATE INDEX "Claim_deviceId_idx" ON "Claim"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_deviceId_claimDateKst_key" ON "Claim"("deviceId", "claimDateKst");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
