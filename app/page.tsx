import { FamilyDashboard, normalizeSection } from "./components/family-dashboard";
import {
  addContact,
  addDocument,
  addEvent,
  addExpense,
  addGrocery,
  addTask,
  deleteContact,
  deleteDocument,
  deleteEvent,
  deleteExpense,
  deleteGrocery,
  deleteTask,
  toggleGrocery,
  toggleTask,
} from "./actions";
import { getFamilyData } from "./lib/data";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; section?: string }>;
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
        addDocument,
        deleteDocument,
        addContact,
        deleteContact,
      }}
      data={data}
      query={params.q ?? ""}
      section={normalizeSection(params.section)}
    />
  );
}
