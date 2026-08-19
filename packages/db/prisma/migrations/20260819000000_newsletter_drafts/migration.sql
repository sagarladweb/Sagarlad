-- AlterTable
ALTER TABLE "NewsletterCampaign" ADD COLUMN     "contentJson" JSONB,
ADD COLUMN     "draft" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "NewsletterCampaign_draft_idx" ON "NewsletterCampaign"("draft");