import React from "react";
import {
  CalendarDays,
  Check,
  ClipboardList,
  Contact,
  Euro,
  Home,
  MapPin,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import type { FamilyData } from "../lib/data";

const people = ["Sérgio", "Adriana", "Casa"];
const categories = [
  "Casa",
  "Supermercado",
  "Transporte",
  "Saude",
  "Lazer",
  "Filhos",
  "Animais",
  "Outros",
];
const eventTypes = ["Consulta", "Trabalho", "Familia", "Escola", "Casa", "Lazer", "Outro"];
const priorities = ["Baixa", "Media", "Alta"];

const budgetKinds = [
  { value: "income", label: "Rendimento" },
  { value: "fixed_expense", label: "Despesa fixa" },
  { value: "saving_goal", label: "Poupanca/meta" },
];

type Section =
  | "dashboard"
  | "budget"
  | "expenses"
  | "agenda"
  | "tasks"
  | "groceries"
  | "contacts";

type Field = {
  name: string;
  label: string;
  type?: string;
  step?: string;
  placeholder?: string;
  value?: string;
  options?: string[];
  optional?: boolean;
};

export type FamilyActions = {
  addExpense: (formData: FormData) => Promise<void>;
  deleteExpense: (formData: FormData) => Promise<void>;
  addEvent: (formData: FormData) => Promise<void>;
  deleteEvent: (formData: FormData) => Promise<void>;
  addTask: (formData: FormData) => Promise<void>;
  toggleTask: (formData: FormData) => Promise<void>;
  deleteTask: (formData: FormData) => Promise<void>;
  addGrocery: (formData: FormData) => Promise<void>;
  toggleGrocery: (formData: FormData) => Promise<void>;
  deleteGrocery: (formData: FormData) => Promise<void>;
  addContact: (formData: FormData) => Promise<void>;
  deleteContact: (formData: FormData) => Promise<void>;
  addBudgetItem: (formData: FormData) => Promise<void>;
  deleteBudgetItem: (formData: FormData) => Promise<void>;
  setBudgetItemAdjustment: (formData: FormData) => Promise<void>;
};

const today = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export function FamilyDashboard({
  actions,
  data,
  month,
  query,
  section,
}: {
  actions: FamilyActions;
  data: FamilyData;
  month: string;
  query: string;
  section: Section;
}) {
  const filteredExpenses = data.expenses.filter((expense) =>
    [expense.person, expense.place, expense.category, expense.note]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Home size={22} />
          </div>
          <div>
            <strong>Casa em Dia</strong>
            <span>Gestao familiar</span>
          </div>
        </div>

        <nav aria-label="Modulos">
          <NavButton active={section === "dashboard"} icon={<Home />} label="Resumo" section="dashboard" />
          <NavButton active={section === "budget"} icon={<Wallet />} label="Orcamento" section="budget" />
          <NavButton active={section === "expenses"} icon={<Euro />} label="Despesas" section="expenses" />
          <NavButton active={section === "agenda"} icon={<CalendarDays />} label="Agenda" section="agenda" />
          <NavButton active={section === "tasks"} icon={<ClipboardList />} label="Tarefas" section="tasks" />
          <NavButton active={section === "groceries"} icon={<ShoppingCart />} label="Compras" section="groceries" />
          <NavButton active={section === "contacts"} icon={<Contact />} label="Contactos" section="contacts" />
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Painel comum</p>
            <h1>{titleFor(section)}</h1>
          </div>

          <div className="family-pill">
            <Users size={18} /> Sérgio e Adriana
          </div>
        </header>

        {!data.databaseReady && (
          <div className="status-banner">
            A base de dados ainda nao esta acessivel. Estou a mostrar dados de exemplo.
          </div>
        )}

        {section === "dashboard" && <Dashboard data={data} month={month} />}
        {section === "budget" && <Budget actions={actions} data={data} month={month} />}
        {section === "expenses" && (
          <Expenses
            actions={actions}
            expenses={filteredExpenses}
            query={query}
            databaseReady={data.databaseReady}
          />
        )}
        {section === "agenda" && <Agenda actions={actions} data={data} />}
        {section === "tasks" && <Tasks actions={actions} data={data} />}
        {section === "groceries" && <Groceries actions={actions} data={data} />}
        {section === "contacts" && <Contacts actions={actions} data={data} />}
      </main>
    </div>
  );
}

function titleFor(section: Section) {
  return {
    dashboard: "Resumo da casa",
    budget: "Orcamento familiar",
    expenses: "Despesas",
    agenda: "Agenda comum",
    tasks: "Tarefas",
    groceries: "Lista de compras",
    contacts: "Contactos uteis",
  }[section];
}

export function normalizeSection(value: string | undefined): Section {
  const sections: Section[] = [
    "dashboard",
    "budget",
    "expenses",
    "agenda",
    "tasks",
    "groceries",
    "contacts",
  ];

  return sections.includes(value as Section) ? (value as Section) : "dashboard";
}

function buildBudget(data: FamilyData, month: string) {
  const activeBudget = data.budgetItems.filter((item) => item.active);
  const incomes = activeBudget.filter((item) => item.kind === "income");
  const fixedExpenses = activeBudget.filter((item) => item.kind === "fixed_expense");
  const savingGoals = activeBudget.filter((item) => item.kind === "saving_goal");

  const extraExpenses = data.expenses.filter((expense) =>
    expense.date.startsWith(month),
  );

  const incomeTotal = sumBudgetItems(incomes, month);
  const fixedTotal = sumBudgetItems(fixedExpenses, month);
  const goalsTotal = sumBudgetItems(savingGoals, month);
  const extrasTotal = sum(extraExpenses);

  const committedTotal = fixedTotal + goalsTotal + extrasTotal;
  const freeTotal = incomeTotal - committedTotal;
  const effortRate = incomeTotal > 0 ? (fixedTotal / incomeTotal) * 100 : 0;
  const savingsRate = incomeTotal > 0 ? (goalsTotal / incomeTotal) * 100 : 0;

  return {
    incomes,
    fixedExpenses,
    savingGoals,
    extraExpenses,
    incomeTotal,
    fixedTotal,
    goalsTotal,
    extrasTotal,
    committedTotal,
    freeTotal,
    effortRate,
    savingsRate,
  };
}

function sum(items: { amount: number }[]) {
  return items.reduce((total, item) => total + item.amount, 0);
}

function sumBudgetItems(items: FamilyData["budgetItems"], month: string) {
  return items.reduce(
    (total, item) => total + effectiveBudgetAmount(item, month),
    0,
  );
}

function effectiveBudgetAmount(item: FamilyData["budgetItems"][number], month: string) {
  return (
    item.monthlyAdjustments.find((adjustment) => adjustment.month === month)
      ?.amount ?? item.amount
  );
}

function NavButton({
  active,
  icon,
  label,
  section,
}: {
  active: boolean;
  icon: React.ReactElement;
  label: string;
  section: Section;
}) {
  return (
    <a
      className={active ? "nav-button active" : "nav-button"}
      href={section === "dashboard" ? "/" : `/?section=${section}`}
      title={label}
    >
      {React.cloneElement(icon, { size: 19 } as React.SVGProps<SVGSVGElement>)}
      <span>{label}</span>
    </a>
  );
}

function Dashboard({ data, month }: { data: FamilyData; month: string }) {
  const budget = buildBudget(data, month);
  const upcoming = data.events.filter((event) => event.date >= today()).slice(0, 3);

  return (
    <section className="stack">
      <div className="metric-grid">
        <Metric label="Rendimento mensal" value={money(budget.incomeTotal)} icon={<Wallet />} />
        <Metric label="Fixas + poupanca" value={money(budget.fixedTotal + budget.goalsTotal)} icon={<Euro />} />
        <Metric label="Extras do mes" value={money(budget.extrasTotal)} icon={<ShoppingCart />} />
        <Metric label="Margem livre" value={money(budget.freeTotal)} icon={<Home />} />
      </div>

      <div className="two-column">
        <Panel title="Proximos compromissos">
          <div className="compact-list">
            {upcoming.length === 0 && <p className="empty">Sem compromissos proximos.</p>}
            {upcoming.map((event) => (
              <div className="list-item" key={event.id}>
                <div>
                  <strong>{event.title}</strong>
                  <span>
                    {event.date} as {event.time} · {event.owner}
                  </span>
                </div>
                <MapPin size={17} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Saude do orcamento">
          <div className="budget-alerts">
            <BudgetAlert
              good={budget.freeTotal >= 0}
              text={budget.freeTotal >= 0 ? "O mes esta dentro do previsto." : "O mes esta acima do previsto."}
            />
            <BudgetAlert
              good={budget.effortRate <= 35}
              text={`Taxa de esforco fixa: ${budget.effortRate.toFixed(0)}%.`}
            />
            <BudgetAlert
              good={budget.savingsRate >= 10}
              text={`Poupanca planeada: ${budget.savingsRate.toFixed(0)}% do rendimento.`}
            />
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Budget({
  actions,
  data,
  month,
}: {
  actions: FamilyActions;
  data: FamilyData;
  month: string;
}) {
  const budget = buildBudget(data, month);
  const emergencyTarget = (budget.fixedTotal + budget.extrasTotal) * 3;

  return (
    <section className="stack">
      <div className="budget-toolbar">
        <form className="search month-form" method="GET">
          <input type="hidden" name="section" value="budget" />
          <span>Mes</span>
          <input type="month" name="month" defaultValue={month} />
          <button className="compact-button" type="submit">
            Atualizar
          </button>
        </form>
      </div>

      <div className="metric-grid">
        <Metric label="Rendimentos" value={money(budget.incomeTotal)} icon={<Wallet />} />
        <Metric label="Despesas fixas" value={money(budget.fixedTotal)} icon={<Euro />} />
        <Metric label="Despesas extras" value={money(budget.extrasTotal)} icon={<ShoppingCart />} />
        <Metric label="Livre apos tudo" value={money(budget.freeTotal)} icon={<Home />} />
      </div>

      <section className="workspace">
        <Panel title="Adicionar ao orcamento">
          <form className="form-grid" action={actions.addBudgetItem}>
            <fieldset disabled={!data.databaseReady}>
              <label>
                <span>Tipo</span>
                <select name="kind" required>
                  {budgetKinds.map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Nome</span>
                <input name="name" placeholder="Ex: salario, renda, seguro, poupanca" required />
              </label>

              <label>
                <span>Responsavel</span>
                <select name="owner" required>
                  {["Ambos", ...people].map((person) => (
                    <option key={person}>{person}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Categoria</span>
                <input name="category" placeholder="Ex: trabalho, casa, credito, poupanca" required />
              </label>

              <label>
                <span>Valor mensal</span>
                <input name="amount" type="number" step="0.01" placeholder="0.00" required />
              </label>

              <label>
                <span>Nota</span>
                <input name="note" placeholder="Opcional" />
              </label>

              <button className="primary-button" type="submit">
                <Plus size={18} /> Adicionar
              </button>
            </fieldset>
          </form>
        </Panel>

        <Panel title="Leitura do mes">
          <div className="budget-alerts">
            <BudgetAlert good={budget.freeTotal >= 0} text={`Margem livre: ${money(budget.freeTotal)}.`} />
            <BudgetAlert good={budget.effortRate <= 35} text={`Fixas representam ${budget.effortRate.toFixed(0)}% dos rendimentos.`} />
            <BudgetAlert good={budget.savingsRate >= 10} text={`Meta de poupanca: ${money(budget.goalsTotal)} (${budget.savingsRate.toFixed(0)}%).`} />
            <BudgetAlert good={true} text={`Fundo de emergencia sugerido: ${money(emergencyTarget)} para 3 meses.`} />
          </div>
        </Panel>
      </section>

      <div className="two-column">
        <BudgetList
          title="Rendimentos"
          items={budget.incomes}
          month={month}
          deleteAction={actions.deleteBudgetItem}
          adjustAction={actions.setBudgetItemAdjustment}
          databaseReady={data.databaseReady}
        />

        <BudgetList
          title="Despesas fixas"
          items={budget.fixedExpenses}
          month={month}
          deleteAction={actions.deleteBudgetItem}
          adjustAction={actions.setBudgetItemAdjustment}
          databaseReady={data.databaseReady}
        />
      </div>

      <div className="two-column">
        <BudgetList
          title="Poupanca e metas"
          items={budget.savingGoals}
          month={month}
          deleteAction={actions.deleteBudgetItem}
          adjustAction={actions.setBudgetItemAdjustment}
          databaseReady={data.databaseReady}
        />

        <Panel title="Extras vindos de Despesas">
          <DataList
            databaseReady={data.databaseReady}
            items={budget.extraExpenses}
            deleteAction={actions.deleteExpense}
            render={(expense) => (
              <div>
                <strong>{expense.place}</strong>
                <span>
                  {expense.date} · {expense.person} · {expense.category}
                </span>
                {expense.note && <small>{expense.note}</small>}
              </div>
            )}
          />
        </Panel>
      </div>
    </section>
  );
}

function BudgetList({
  title,
  items,
  month,
  deleteAction,
  adjustAction,
  databaseReady,
}: {
  title: string;
  items: FamilyData["budgetItems"];
  month: string;
  deleteAction: (formData: FormData) => Promise<void>;
  adjustAction: (formData: FormData) => Promise<void>;
  databaseReady: boolean;
}) {
  return (
    <Panel title={title}>
      {!items.length && <p className="empty">Sem registos.</p>}

      <div className="data-list">
        {items.map((item) => {
          const adjusted = item.monthlyAdjustments.find(
            (adjustment) => adjustment.month === month,
          );
          const value = adjusted?.amount ?? item.amount;

          return (
            <article className="record budget-record" key={item.id}>
              <div className="record-content">
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.owner} · {item.category} · previsto {money(item.amount)}
                  </span>
                  {adjusted && (
                    <small>
                      Valor ajustado para {month}: {money(adjusted.amount)}
                    </small>
                  )}
                  {item.note && <small>{item.note}</small>}
                </div>

                <b>{money(value)}</b>
              </div>

              <form className="adjust-form" action={adjustAction}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="month" value={month} />
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={value}
                  aria-label={`Valor real de ${item.name}`}
                />
                <input
                  name="note"
                  defaultValue={adjusted?.note ?? ""}
                  placeholder="Nota"
                  aria-label={`Nota de ${item.name}`}
                />
                <button className="primary-button compact-button" disabled={!databaseReady} type="submit">
                  Ajustar
                </button>
              </form>

              <ActionIcon action={deleteAction} id={item.id} disabled={!databaseReady} title="Apagar">
                <Trash2 size={17} />
              </ActionIcon>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

function BudgetAlert({ good, text }: { good: boolean; text: string }) {
  return <div className={good ? "budget-alert good" : "budget-alert warn"}>{text}</div>;
}

function Expenses({
  actions,
  expenses,
  query,
  databaseReady,
}: {
  actions: FamilyActions;
  expenses: FamilyData["expenses"];
  query: string;
  databaseReady: boolean;
}) {
  return (
    <section className="workspace">
      <FormPanel
        title="Nova despesa extra"
        action={actions.addExpense}
        databaseReady={databaseReady}
        fields={[
          { name: "date", label: "Data", type: "date", value: today() },
          { name: "person", label: "Conta", type: "select", options: people },
          { name: "place", label: "Onde", placeholder: "Ex: supermercado, farmacia" },
          { name: "category", label: "Categoria", type: "select", options: categories },
          { name: "amount", label: "Valor", type: "number", step: "0.01", placeholder: "0.00" },
          { name: "note", label: "Nota", placeholder: "Opcional", optional: true },
        ]}
        submitLabel="Adicionar"
      />

      <Panel title="Historico">
        <form className="search" method="GET">
          <input type="hidden" name="section" value="expenses" />
          <Search size={18} />
          <input name="q" defaultValue={query} placeholder="Procurar por pessoa, local ou categoria" />
        </form>

        <DataList
          databaseReady={databaseReady}
          items={expenses}
          deleteAction={actions.deleteExpense}
          render={(expense) => (
            <>
              <div>
                <strong>{expense.place}</strong>
                <span>
                  {expense.date} · {expense.person} · {expense.category}
                </span>
                {expense.note && <small>{expense.note}</small>}
              </div>
              <b>{money(expense.amount)}</b>
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function Agenda({ actions, data }: { actions: FamilyActions; data: FamilyData }) {
  return (
    <section className="workspace">
      <FormPanel
        title="Novo compromisso"
        action={actions.addEvent}
        databaseReady={data.databaseReady}
        fields={[
          { name: "date", label: "Data", type: "date", value: today() },
          { name: "time", label: "Hora", type: "time", value: "09:00" },
          { name: "title", label: "Titulo", placeholder: "Ex: consulta, jantar, reuniao" },
          { name: "type", label: "Tipo", type: "select", options: eventTypes },
          { name: "owner", label: "Para quem", type: "select", options: ["Ambos", ...people] },
          { name: "place", label: "Local", placeholder: "Opcional", optional: true },
          { name: "notes", label: "Notas", placeholder: "Opcional", optional: true },
        ]}
        submitLabel="Marcar"
      />

      <Panel title="Agenda">
        <DataList
          databaseReady={data.databaseReady}
          items={data.events}
          deleteAction={actions.deleteEvent}
          render={(event) => (
            <div>
              <strong>{event.title}</strong>
              <span>
                {event.date} · {event.time} · {event.owner} · {event.type}
              </span>
              {event.place && <small>{event.place}</small>}
            </div>
          )}
        />
      </Panel>
    </section>
  );
}

function Tasks({ actions, data }: { actions: FamilyActions; data: FamilyData }) {
  return (
    <section className="workspace">
      <FormPanel
        title="Nova tarefa"
        action={actions.addTask}
        databaseReady={data.databaseReady}
        fields={[
          { name: "title", label: "Tarefa", placeholder: "Ex: pagar luz" },
          { name: "owner", label: "Responsavel", type: "select", options: ["Ambos", ...people] },
          { name: "due", label: "Prazo", type: "date", value: today() },
          { name: "priority", label: "Prioridade", type: "select", options: priorities },
        ]}
        submitLabel="Criar"
      />

      <Panel title="A fazer">
        <DataList
          databaseReady={data.databaseReady}
          items={data.tasks}
          deleteAction={actions.deleteTask}
          render={(task) => (
            <>
              <ActionIcon action={actions.toggleTask} id={task.id} disabled={!data.databaseReady} title="Concluir">
                <span className={task.done ? "check done" : "check"}>
                  <Check size={15} />
                </span>
              </ActionIcon>

              <div className={task.done ? "muted done-text" : "muted"}>
                <strong>{task.title}</strong>
                <span>
                  {task.owner} · {task.due} · {task.priority}
                </span>
              </div>
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function Groceries({ actions, data }: { actions: FamilyActions; data: FamilyData }) {
  return (
    <section className="workspace">
      <FormPanel
        title="Adicionar compra"
        action={actions.addGrocery}
        databaseReady={data.databaseReady}
        fields={[
          { name: "item", label: "Item", placeholder: "Ex: arroz" },
          { name: "quantity", label: "Quantidade", placeholder: "Ex: 2 kg", optional: true },
        ]}
        submitLabel="Adicionar"
      />

      <Panel title="Lista">
        <DataList
          databaseReady={data.databaseReady}
          items={data.groceries}
          deleteAction={actions.deleteGrocery}
          render={(item) => (
            <>
              <ActionIcon action={actions.toggleGrocery} id={item.id} disabled={!data.databaseReady} title="Comprado">
                <span className={item.done ? "check done" : "check"}>
                  <Check size={15} />
                </span>
              </ActionIcon>

              <div className={item.done ? "muted done-text" : "muted"}>
                <strong>{item.item}</strong>
                <span>{item.quantity}</span>
              </div>
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function Contacts({ actions, data }: { actions: FamilyActions; data: FamilyData }) {
  return (
    <section className="workspace">
      <FormPanel
        title="Novo contacto"
        action={actions.addContact}
        databaseReady={data.databaseReady}
        fields={[
          { name: "name", label: "Nome", placeholder: "Ex: pediatra, canalizador" },
          { name: "role", label: "Area", placeholder: "Ex: saude, casa" },
          { name: "phone", label: "Telefone", placeholder: "Opcional", optional: true },
          { name: "notes", label: "Notas", placeholder: "Opcional", optional: true },
        ]}
        submitLabel="Adicionar"
      />

      <Panel title="Contactos uteis">
        <DataList
          databaseReady={data.databaseReady}
          items={data.contacts}
          deleteAction={actions.deleteContact}
          render={(contact) => (
            <div>
              <strong>{contact.name}</strong>
              <span>
                {contact.role} · {contact.phone || "sem telefone"}
              </span>
              {contact.notes && <small>{contact.notes}</small>}
            </div>
          )}
        />
      </Panel>
    </section>
  );
}

function FormPanel({
  title,
  fields,
  submitLabel,
  action,
  databaseReady,
}: {
  title: string;
  fields: Field[];
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
  databaseReady: boolean;
}) {
  return (
    <Panel title={title}>
      <form className="form-grid" action={action}>
        <fieldset disabled={!databaseReady}>
          {fields.map((field) => (
            <label key={field.name}>
              <span>{field.label}</span>

              {field.type === "select" ? (
                <select name={field.name} defaultValue={field.value || field.options?.[0]} required={!field.optional}>
                  {field.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  required={!field.optional}
                  type={field.type || "text"}
                  step={field.step}
                  defaultValue={field.value}
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}

          <button className="primary-button" type="submit">
            <Plus size={18} /> {submitLabel}
          </button>
        </fieldset>
      </form>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactElement;
}) {
  return (
    <div className="metric">
      {React.cloneElement(icon, { size: 22 } as React.SVGProps<SVGSVGElement>)}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataList<T extends { id: string }>({
  items,
  render,
  deleteAction,
  databaseReady,
}: {
  items: T[];
  render: (item: T) => React.ReactNode;
  deleteAction: (formData: FormData) => Promise<void>;
  databaseReady: boolean;
}) {
  if (!items.length) return <p className="empty">Sem registos.</p>;

  return (
    <div className="data-list">
      {items.map((item) => (
        <article className="record" key={item.id}>
          <div className="record-content">{render(item)}</div>

          <ActionIcon action={deleteAction} id={item.id} disabled={!databaseReady} title="Apagar">
            <Trash2 size={17} />
          </ActionIcon>
        </article>
      ))}
    </div>
  );
}

function ActionIcon({
  action,
  id,
  disabled,
  title,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="icon-button" disabled={disabled} title={title} type="submit">
        {children}
      </button>
    </form>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}