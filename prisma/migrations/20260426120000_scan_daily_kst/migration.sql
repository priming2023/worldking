-- 보물 스캔을 KST 일 단위로 구분 (매일 같은 QR을 다시 찾을 수 있음)

ALTER TABLE "Scan" ADD COLUMN "scanDateKst" TEXT;

UPDATE "Scan"
SET "scanDateKst" = to_char(timezone('Asia/Seoul', "scannedAt"), 'YYYY-MM-DD');

ALTER TABLE "Scan" ALTER COLUMN "scanDateKst" SET NOT NULL;

DROP INDEX "Scan_deviceId_code_key";

CREATE UNIQUE INDEX "Scan_deviceId_code_scanDateKst_key" ON "Scan"("deviceId", "code", "scanDateKst");

CREATE INDEX "Scan_deviceId_scanDateKst_idx" ON "Scan"("deviceId", "scanDateKst");
