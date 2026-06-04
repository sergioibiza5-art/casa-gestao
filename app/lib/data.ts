import { prisma } from "./prisma";

export type ExpenseView = {
  id: string;
  date: string;
  person: string;
  place: string;
  category: string;
  amount: number;
  note: string | null;
};

export type EventView = {
  id: string;
  date: string;
  time: string;
  title: string;
  type: string;
  owner: string;
  place: string | null;
  notes: string | null;
};

export type TaskView = {
  id: string;
  title: string;
  owner: string;
  due: string;
  priority: string;
  done: boolean;
};

export type GroceryView = {
  id: string;
  item: string;
  quantity: string | null;
  done: boolean;
};

export type DocumentView = {
  id: string;
  name: string;
  location: string;
  renew: string | null;
  owner: string;
};

export type ContactView = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  notes: string | null;
};

export type FamilyData = {
  expenses: ExpenseView[];
  events: EventView[];
  tasks: TaskView[];
  groceries: GroceryView[];
  documents: DocumentView[];
  contacts: ContactView[];
  databaseReady: boolean;
};

const today = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const fallbackData: FamilyData = {
  databaseReady: false,
  expenses: [
    {
      id: "demo-expense-1",
      date: today(-2),
      person: "Sérgio",
      place: "Continente",
      category: "Supermercado",
      amount: 63.42,
      note: "Compras da semana",
    },
    {
      id: "demo-expense-2",
      date: today(-1),
      person: "Adriana",
      place: "Farmacia",
      category: "Saude",
      amount: 18.9,
      note: "Medicamentos",
    },
  ],
  events: [
    {
      id: "demo-event-1",
      date: today(1),
      time: "18:30",
      title: "Consulta",
      type: "Consulta",
      owner: "Ambos",
      place: "Centro de Saude",
      notes: null,
    },
  ],
  tasks: [
    { id: "demo-task-1", title: "Pagar agua", owner: "Sérgio", due: today(3), priority: "Alta", done: false },
    { id: "demo-task-2", title: "Marcar revisao do carro", owner: "Ambos", due: today(5), priority: "Media", done: false },
  ],
  groceries: [
    { id: "demo-grocery-1", item: "Leite", quantity: "2", done: false },
    { id: "demo-grocery-2", item: "Fruta", quantity: "1 saco", done: false },
  ],
  documents: [
    {
      id: "demo-document-1",
      name: "Seguro da casa",
      location: "Pasta documentos",
      renew: today(45),
      owner: "Ambos",
    },
  ],
  contacts: [
    {
      id: "demo-contact-1",
      name: "Medico de familia",
      role: "Saude",
      phone: null,
      notes: "Contacto principal",
    },
  ],
};

export async function getFamilyData(): Promise<FamilyData> {
  try {
    const [expenses, events, tasks, groceries, documents, contacts] = await Promise.all([
      prisma.expense.findMany({ orderBy: { date: "desc" } }),
      prisma.calendarEvent.findMany({ orderBy: [{ date: "asc" }, { time: "asc" }] }),
      prisma.familyTask.findMany({ orderBy: [{ done: "asc" }, { due: "asc" }] }),
      prisma.groceryItem.findMany({ orderBy: [{ done: "asc" }, { createdAt: "desc" }] }),
      prisma.familyDocument.findMany({ orderBy: [{ renew: "asc" }, { name: "asc" }] }),
      prisma.usefulContact.findMany({ orderBy: { name: "asc" } }),
    ]);

    return {
      databaseReady: true,
      expenses: expenses.map((expense) => ({
        ...expense,
        date: formatDate(expense.date),
        amount: Number(expense.amount),
      })),
      events: events.map((event) => ({ ...event, date: formatDate(event.date) })),
      tasks: tasks.map((task) => ({ ...task, due: formatDate(task.due) })),
      groceries,
      documents: documents.map((document) => ({ ...document, renew: document.renew ? formatDate(document.renew) : null })),
      contacts,
    };
  } catch {
    return fallbackData;
  }
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
