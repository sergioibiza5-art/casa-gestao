import { FamilyDashboard, normalizeSection } from "./components/family-dashboard";
import {
  addBudgetItem,
  addContact,
  addEvent,
  addExpense,
  addGrocery,
  addTask,
  deleteBudgetItem,
  deleteContact,
  deleteEvent,
  deleteExpense,
  deleteGrocery,
  deleteTask,
  toggleGrocery,
  toggleTask,
} from "./actions";
import { getFamilyData } from "./lib/data";

export const dynamic = "force-dynamic";

const defaultMonth = () => new Date().toISOString().slice(0, 7);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; q?: string; section?: string }>;
}) {
  const params = await searchParams;
  const data = await getFamilyData();

  return (
    <FamilyDashboard
      actions={{
        addExpense,
        deleteExpense,
        addEvent,
        deleteEvent,
        addTask,
        toggleTask,
        deleteTask,
        addGrocery,
        toggleGrocery,
        deleteGrocery,
        addContact,
        deleteContact,
        addBudgetItem,
        deleteBudgetItem,
      }}
      data={data}
      month={params.month ?? defaultMonth()}
      query={params.q ?? ""}
      section={normalizeSection(params.section)}
    />
  );
}
