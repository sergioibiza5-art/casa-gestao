import React from "react";
import {
  CalendarDays,
  Check,
  ClipboardList,
  Contact,
  Edit3,
  Euro,
  FileText,
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

const people = ["Sérgio", "Adriana"];
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
const eventTypes = [
  "Consulta",
  "Trabalho",
  "Familia",
  "Escola",
  "Casa",
  "Lazer",
  "Outro",
];
const priorities = ["Baixa", "Media", "Alta"];

type Section =
  | "dashboard"
  | "expenses"
  | "agenda"
  | "tasks"
  | "groceries"
  | "docs"
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

type DashboardStats = {
  total: number;
  byPerson: { person: string; value: number }[];
  upcoming: FamilyData["events"];
  pendingTasks: number;
  shoppingOpen: number;
};

export type FamilyActions = {
  addExpense: (formData: FormData) => Promise<void>;
  updateExpense: (formData: FormData) => Promise<void>;
  deleteExpense: (formData: FormData) => Promise<void>;

  addEvent: (formData: FormData) => Promise<void>;
  updateEvent: (formData: FormData) => Promise<void>;
  deleteEvent: (formData: FormData) => Promise<void>;

  addTask: (formData: FormData) => Promise<void>;
  updateTask: (formData: FormData) => Promise<void>;
  toggleTask: (formData: FormData) => Promise<void>;
  deleteTask: (formData: FormData) => Promise<void>;

  addGrocery: (formData: FormData) => Promise<void>;
  updateGrocery: (formData: FormData) => Promise<void>;
  toggleGrocery: (formData: FormData) => Promise<void>;
  deleteGrocery: (formData: FormData) => Promise<void>;

  addDocument: (formData: FormData) => Promise<void>;
  updateDocument: (formData: FormData) => Promise<void>;
  deleteDocument: (formData: FormData) => Promise<void>;

  addContact: (formData: FormData) => Promise<void>;
  updateContact: (formData: FormData) => Promise<void>;
  deleteContact: (formData: FormData) => Promise<void>;
};

const today = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export function FamilyDashboard({
  actions,
  data,
  query,
  section,
}: {
  actions: FamilyActions;
  data: FamilyData;
  query: string;
  section: Section;
}) {
  const stats = buildStats(data);

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
          <NavButton active={section === "dashboard"} icon={<Wallet />} label="Resumo" section="dashboard" />
          <NavButton active={section === "expenses"} icon={<Euro />} label="Despesas" section="expenses" />
          <NavButton active={section === "agenda"} icon={<CalendarDays />} label="Agenda" section="agenda" />
          <NavButton active={section === "tasks"} icon={<ClipboardList />} label="Tarefas" section="tasks" />
          <NavButton active={section === "groceries"} icon={<ShoppingCart />} label="Compras" section="groceries" />
          <NavButton active={section === "docs"} icon={<FileText />} label="Documentos" section="docs" />
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
            <Users size={18} /> Sérgio + Adriana
          </div>
        </header>

        {!data.databaseReady && (
          <div className="status-banner">
            A base de dados ainda nao esta acessivel. Estou a mostrar dados de exemplo.
          </div>
        )}

        {section === "dashboard" && <Dashboard stats={stats} />}
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
        {section === "docs" && <Documents actions={actions} data={data} />}
        {section === "contacts" && <Contacts actions={actions} data={data} />}
      </main>
    </div>
  );
}

function titleFor(section: Section) {
  return {
    dashboard: "Resumo da casa",
    expenses: "Despesas",
    agenda: "Agenda comum",
    tasks: "Tarefas",
    groceries: "Lista de compras",
    docs: "Documentos",
    contacts: "Contactos uteis",
  }[section];
}

export function normalizeSection(value: string | undefined): Section {
  const sections: Section[] = [
    "dashboard",
    "expenses",
    "agenda",
    "tasks",
    "groceries",
    "docs",
    "contacts",
  ];

  return sections.includes(value as Section) ? (value as Section) : "dashboard";
}

function buildStats(data: FamilyData): DashboardStats {
  const total = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const byPerson = people.map((person) => ({
    person,
    value: data.expenses
      .filter((expense) => expense.person === person)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }));

  const upcoming = data.events
    .filter((event) => event.date >= today())
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 3);

  const pendingTasks = data.tasks.filter((task) => !task.done).length;
  const shoppingOpen = data.groceries.filter((item) => !item.done).length;

  return { total, byPerson, upcoming, pendingTasks, shoppingOpen };
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

function Dashboard({ stats }: { stats: DashboardStats }) {
  const maxPerson = Math.max(...stats.byPerson.map((item) => item.value), 1);

  return (
    <section className="stack">
      <div className="metric-grid">
        <Metric label="Gasto total" value={money(stats.total)} icon={<Euro />} />
        <Metric label="Eventos proximos" value={stats.upcoming.length} icon={<CalendarDays />} />
        <Metric label="Tarefas abertas" value={stats.pendingTasks} icon={<ClipboardList />} />
        <Metric label="Compras por tratar" value={stats.shoppingOpen} icon={<ShoppingCart />} />
      </div>

      <div className="two-column">
        <Panel title="Gastos por pessoa">
          <div className="bars">
            {stats.byPerson.map((item) => (
              <div className="bar-row" key={item.person}>
                <span>{item.person}</span>
                <div className="bar-track">
                  <div style={{ width: `${(item.value / maxPerson) * 100}%` }} />
                </div>
                <strong>{money(item.value)}</strong>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Proximos compromissos">
          <div className="compact-list">
            {stats.upcoming.length === 0 && <p className="empty">Sem compromissos proximos.</p>}
            {stats.upcoming.map((event) => (
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
      </div>

      <Panel title="O que uma familia costuma gerir em conjunto">
        <div className="suggestion-grid">
          {[
            "Orcamento mensal",
            "Contas recorrentes",
            "Ferias",
            "Saude",
            "Escola",
            "Manutencao da casa",
            "Garantias",
            "Emergencias",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Panel>
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
        title="Nova despesa"
        action={actions.addExpense}
        databaseReady={databaseReady}
        fields={[
          { name: "date", label: "Data", type: "date", value: today() },
          { name: "person", label: "Quem gastou", type: "select", options: people },
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
          editHref={(expense) => `/?section=expenses&editExpense=${expense.id}`}
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
        <div className="data-list">
          {data.events.length === 0 && <p className="empty">Sem registos.</p>}

          {data.events.map((event) => (
            <article className="record edit-record" key={event.id}>
              <details className="edit-details">
                <summary className="record-summary">
                  <div className="record-content">
                    <div>
                      <strong>{event.title}</strong>
                      <span>
                        {event.date} · {event.time} · {event.owner} · {event.type}
                      </span>
                      {event.place && <small>{event.place}</small>}
                    </div>
                  </div>

                  <span className="icon-button edit-button" title="Editar">
                    <Edit3 size={17} />
                  </span>
                </summary>

                <form className="inline-edit-form" action={actions.updateEvent}>
                  <input type="hidden" name="id" value={event.id} />

                  <label>
                    <span>Data</span>
                    <input name="date" type="date" defaultValue={event.date} required />
                  </label>

                  <label>
                    <span>Hora</span>
                    <input name="time" type="time" defaultValue={event.time} required />
                  </label>

                  <label>
                    <span>Titulo</span>
                    <input name="title" defaultValue={event.title} required />
                  </label>

                  <label>
                    <span>Tipo</span>
                    <select name="type" defaultValue={event.type} required>
                      {eventTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Para quem</span>
                    <select name="owner" defaultValue={event.owner} required>
                      {["Ambos", ...people].map((person) => (
                        <option key={person}>{person}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Local</span>
                    <input name="place" defaultValue={event.place ?? ""} placeholder="Opcional" />
                  </label>

                  <label>
                    <span>Notas</span>
                    <input name="notes" defaultValue={event.notes ?? ""} placeholder="Opcional" />
                  </label>

                  <button className="primary-button" disabled={!data.databaseReady} type="submit">
                    Guardar alterações
                  </button>
                </form>
              </details>

              <ActionIcon
                action={actions.deleteEvent}
                id={event.id}
                disabled={!data.databaseReady}
                title="Apagar"
              >
                <Trash2 size={17} />
              </ActionIcon>
            </article>
          ))}
        </div>
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

function Documents({ actions, data }: { actions: FamilyActions; data: FamilyData }) {
  return (
    <section className="workspace">
      <FormPanel
        title="Novo documento"
        action={actions.addDocument}
        databaseReady={data.databaseReady}
        fields={[
          { name: "name", label: "Documento", placeholder: "Ex: seguro, garantia" },
          { name: "location", label: "Onde esta", placeholder: "Ex: pasta, drive, gaveta" },
          { name: "renew", label: "Renovacao", type: "date", value: today(30), optional: true },
          { name: "owner", label: "Responsavel", type: "select", options: ["Ambos", ...people] },
        ]}
        submitLabel="Guardar"
      />

      <Panel title="Arquivo familiar">
        <DataList
          databaseReady={data.databaseReady}
          items={data.documents}
          deleteAction={actions.deleteDocument}
          render={(document) => (
            <div>
              <strong>{document.name}</strong>
              <span>
                {document.location} · {document.renew ? `renova em ${document.renew}` : "sem renovacao"} ·{" "}
                {document.owner}
              </span>
            </div>
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

function DataList<T extends { id: string }>({
  items,
  render,
  deleteAction,
  editHref,
  databaseReady,
}: {
  items: T[];
  render: (item: T) => React.ReactNode;
  deleteAction: (formData: FormData) => Promise<void>;
  editHref?: (item: T) => string;
  databaseReady: boolean;
}) {
  if (!items.length) {
    return <p className="empty">Sem registos.</p>;
  }

  return (
    <div className="data-list">
      {items.map((item) => (
        <article className="record" key={item.id}>
          <div className="record-content">{render(item)}</div>

          {editHref && (
            <a className="icon-button" href={editHref(item)} title="Editar">
              <Edit3 size={17} />
            </a>
          )}

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