CREATE TABLE "BudgetItemAdjustment" (
    "id" TEXT NOT NULL,
    "budgetItemId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetItemAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BudgetItemAdjustment_budgetItemId_month_key" ON "BudgetItemAdjustment"("budgetItemId", "month");
CREATE INDEX "BudgetItemAdjustment_month_idx" ON "BudgetItemAdjustment"("month");

ALTER TABLE "BudgetItemAdjustment"
ADD CONSTRAINT "BudgetItemAdjustment_budgetItemId_fkey"
FOREIGN KEY ("budgetItemId") REFERENCES "BudgetItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "BudgetItem" ("id", "kind", "name", "owner", "category", "amount", "note", "active", "createdAt", "updatedAt")
VALUES
  ('fixed-house-payment', 'fixed_expense', 'Prestacao da casa', 'Ambos', 'Casa', 0, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fixed-car-payment', 'fixed_expense', 'Prestacao do carro', 'Ambos', 'Carro', 0, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fixed-water', 'fixed_expense', 'Agua', 'Ambos', 'Casa', 0, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fixed-electricity', 'fixed_expense', 'Luz', 'Ambos', 'Casa', 0, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fixed-gas', 'fixed_expense', 'Gas', 'Ambos', 'Casa', 0, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fixed-vodafone', 'fixed_expense', 'Vodafone', 'Ambos', 'Telecomunicacoes', 0, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fixed-school', 'fixed_expense', 'Escola do filho', 'Ambos', 'Filhos', 0, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fixed-food', 'fixed_expense', 'Alimentacao', 'Ambos', 'Supermercado', 0, 'Valor previsto mensal', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
