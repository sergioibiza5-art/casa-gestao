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

export type ContactView = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  notes: string | null;
};

export type BudgetItemView = {
  id: string;
  kind: string;
  name: string;
  owner: string;
  category: string;
  amount: number;
  note: string | null;
  active: boolean;
  monthlyAdjustments: {
    amount: number;
    month: string;
    note: string | null;
  }[];
};

export type FamilyData = {
  expenses: ExpenseView[];
  events: EventView[];
  tasks: TaskView[];
  groceries: GroceryView[];
  contacts: ContactView[];
  budgetItems: BudgetItemView[];
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
  contacts: [
    { id: "demo-contact-1", name: "Medico de familia", role: "Saude", phone: null, notes: "Contacto principal" },
  ],
  budgetItems: [
    { id: "demo-budget-1", kind: "income", name: "Salario", owner: "Sérgio", category: "Trabalho", amount: 1200, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-2", kind: "income", name: "Salario", owner: "Adriana", category: "Trabalho", amount: 1100, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-3", kind: "fixed_expense", name: "Prestacao da casa", owner: "Ambos", category: "Casa", amount: 650, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-4", kind: "fixed_expense", name: "Prestacao do carro", owner: "Ambos", category: "Carro", amount: 220, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-5", kind: "fixed_expense", name: "Agua", owner: "Ambos", category: "Casa", amount: 35, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-6", kind: "fixed_expense", name: "Luz", owner: "Ambos", category: "Casa", amount: 70, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-7", kind: "fixed_expense", name: "Gas", owner: "Ambos", category: "Casa", amount: 45, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-8", kind: "fixed_expense", name: "Vodafone", owner: "Ambos", category: "Telecomunicacoes", amount: 55, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-9", kind: "fixed_expense", name: "Escola do filho", owner: "Ambos", category: "Filhos", amount: 120, note: null, active: true, monthlyAdjustments: [] },
    { id: "demo-budget-10", kind: "fixed_expense", name: "Alimentacao", owner: "Ambos", category: "Supermercado", amount: 400, note: "Valor previsto mensal", active: true, monthlyAdjustments: [] },
    { id: "demo-budget-11", kind: "saving_goal", name: "Poupanca familiar", owner: "Ambos", category: "Poupanca", amount: 200, note: "Meta mensal", active: true, monthlyAdjustments: [] },
  ],
};

export async function getFamilyData(): Promise<FamilyData> {
  try {
    const [expenses, events, tasks, groceries, contacts, budgetItems] = await Promise.all([
      prisma.expense.findMany({ orderBy: { date: "desc" } }),
      prisma.calendarEvent.findMany({ orderBy: [{ date: "asc" }, { time: "asc" }] }),
      prisma.familyTask.findMany({ orderBy: [{ done: "asc" }, { due: "asc" }] }),
      prisma.groceryItem.findMany({ orderBy: [{ done: "asc" }, { createdAt: "desc" }] }),
      prisma.usefulContact.findMany({ orderBy: { name: "asc" } }),
      prisma.budgetItem.findMany({
        include: { monthlyAdjustments: true },
        orderBy: [{ kind: "asc" }, { name: "asc" }],
      }),
    ]);

    return {
      databaseReady: true,
      expenses: expenses.map((expense) => ({
        id: expense.id,
        date: formatDate(expense.date),
        person: expense.person,
        place: expense.place,
        category: expense.category,
        amount: Number(expense.amount),
        note: expense.note,
      })),
      events: events.map((event) => ({
        id: event.id,
        date: formatDate(event.date),
        time: event.time,
        title: event.title,
        type: event.type,
        owner: event.owner,
        place: event.place,
        notes: event.notes,
      })),
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        owner: task.owner,
        due: formatDate(task.due),
        priority: task.priority,
        done: task.done,
      })),
      groceries: groceries.map((grocery) => ({
        id: grocery.id,
        item: grocery.item,
        quantity: grocery.quantity,
        done: grocery.done,
      })),
      contacts: contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        phone: contact.phone,
        notes: contact.notes,
      })),
      budgetItems: budgetItems.map((item) => ({
        id: item.id,
        kind: item.kind,
        name: item.name,
        owner: item.owner,
        category: item.category,
        amount: Number(item.amount),
        note: item.note,
        active: item.active,
        monthlyAdjustments: item.monthlyAdjustments.map((adjustment) => ({
          amount: Number(adjustment.amount),
          month: adjustment.month,
          note: adjustment.note,
        })),
      })),
    };
  } catch {
    return fallbackData;
  }
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
