-- Rendimentos deixam de ser recorrentes: ficam presos ao mes em que foram registados.
UPDATE "BudgetItem"
SET "month" = to_char("createdAt", 'YYYY-MM')
WHERE "kind" = 'income'
  AND ("month" IS NULL OR "month" = '' OR "month" = 'recurring');

-- Itens estruturais do orcamento continuam recorrentes.
UPDATE "BudgetItem"
SET "month" = 'recurring'
WHERE "kind" <> 'income'
  AND ("month" IS NULL OR "month" = '');
