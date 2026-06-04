-- Drop unused documents table and add recurring budget items.
DROP TABLE IF EXISTS "FamilyDocument";

CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BudgetItem_kind_idx" ON "BudgetItem"("kind");
CREATE INDEX "BudgetItem_active_idx" ON "BudgetItem"("active");
