"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./lib/prisma";

const parseDate = (value: FormDataEntryValue | null) => {
  const textValue = String(value ?? "").trim();
  return textValue ? new Date(`${textValue}T00:00:00`) : new Date();
};

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

const optionalText = (formData: FormData, key: string) =>
  text(formData, key) || null;

const refresh = () => {
  revalidatePath("/");
};

/* =========================
   DESPESAS
========================= */

export async function addExpense(formData: FormData) {
  await prisma.expense.create({
    data: {
      date: parseDate(formData.get("date")),
      person: text(formData, "person"),
      place: text(formData, "place"),
      category: text(formData, "category"),
      amount: Number(text(formData, "amount") || 0),
      note: optionalText(formData, "note"),
    },
  });

  refresh();
}

export async function updateExpense(formData: FormData) {
  const id = text(formData, "id");

  await prisma.expense.update({
    where: { id },
    data: {
      date: parseDate(formData.get("date")),
      person: text(formData, "person"),
      place: text(formData, "place"),
      category: text(formData, "category"),
      amount: Number(text(formData, "amount") || 0),
      note: optionalText(formData, "note"),
    },
  });

  refresh();
}

export async function deleteExpense(formData: FormData) {
  await prisma.expense.delete({
    where: { id: text(formData, "id") },
  });

  refresh();
}

/* =========================
   AGENDA
========================= */

export async function addEvent(formData: FormData) {
  await prisma.calendarEvent.create({
    data: {
      date: parseDate(formData.get("date")),
      time: text(formData, "time"),
      title: text(formData, "title"),
      type: text(formData, "type"),
      owner: text(formData, "owner"),
      place: optionalText(formData, "place"),
      notes: optionalText(formData, "notes"),
    },
  });

  refresh();
}

export async function updateEvent(formData: FormData) {
  const id = text(formData, "id");

  await prisma.calendarEvent.update({
    where: { id },
    data: {
      date: parseDate(formData.get("date")),
      time: text(formData, "time"),
      title: text(formData, "title"),
      type: text(formData, "type"),
      owner: text(formData, "owner"),
      place: optionalText(formData, "place"),
      notes: optionalText(formData, "notes"),
    },
  });

  refresh();
}

export async function deleteEvent(formData: FormData) {
  await prisma.calendarEvent.delete({
    where: { id: text(formData, "id") },
  });

  refresh();
}

/* =========================
   TAREFAS
========================= */

export async function addTask(formData: FormData) {
  await prisma.familyTask.create({
    data: {
      title: text(formData, "title"),
      owner: text(formData, "owner"),
      due: parseDate(formData.get("due")),
      priority: text(formData, "priority"),
    },
  });

  refresh();
}

export async function updateTask(formData: FormData) {
  const id = text(formData, "id");

  await prisma.familyTask.update({
    where: { id },
    data: {
      title: text(formData, "title"),
      owner: text(formData, "owner"),
      due: parseDate(formData.get("due")),
      priority: text(formData, "priority"),
    },
  });

  refresh();
}

export async function toggleTask(formData: FormData) {
  const id = text(formData, "id");

  const task = await prisma.familyTask.findUnique({
    where: { id },
  });

  if (task) {
    await prisma.familyTask.update({
      where: { id },
      data: {
        done: !task.done,
      },
    });
  }

  refresh();
}

export async function deleteTask(formData: FormData) {
  await prisma.familyTask.delete({
    where: { id: text(formData, "id") },
  });

  refresh();
}

/* =========================
   COMPRAS
========================= */

export async function addGrocery(formData: FormData) {
  await prisma.groceryItem.create({
    data: {
      item: text(formData, "item"),
      quantity: optionalText(formData, "quantity"),
    },
  });

  refresh();
}

export async function updateGrocery(formData: FormData) {
  const id = text(formData, "id");

  await prisma.groceryItem.update({
    where: { id },
    data: {
      item: text(formData, "item"),
      quantity: optionalText(formData, "quantity"),
    },
  });

  refresh();
}

export async function toggleGrocery(formData: FormData) {
  const id = text(formData, "id");

  const item = await prisma.groceryItem.findUnique({
    where: { id },
  });

  if (item) {
    await prisma.groceryItem.update({
      where: { id },
      data: {
        done: !item.done,
      },
    });
  }

  refresh();
}

export async function deleteGrocery(formData: FormData) {
  await prisma.groceryItem.delete({
    where: { id: text(formData, "id") },
  });

  refresh();
}

/* =========================
   DOCUMENTOS
========================= */

export async function addDocument(formData: FormData) {
  await prisma.familyDocument.create({
    data: {
      name: text(formData, "name"),
      location: text(formData, "location"),
      renew: optionalText(formData, "renew")
        ? parseDate(formData.get("renew"))
        : null,
      owner: text(formData, "owner"),
    },
  });

  refresh();
}

export async function updateDocument(formData: FormData) {
  const id = text(formData, "id");

  await prisma.familyDocument.update({
    where: { id },
    data: {
      name: text(formData, "name"),
      location: text(formData, "location"),
      renew: optionalText(formData, "renew")
        ? parseDate(formData.get("renew"))
        : null,
      owner: text(formData, "owner"),
    },
  });

  refresh();
}

export async function deleteDocument(formData: FormData) {
  await prisma.familyDocument.delete({
    where: { id: text(formData, "id") },
  });

  refresh();
}

/* =========================
   CONTACTOS
========================= */

export async function addContact(formData: FormData) {
  await prisma.usefulContact.create({
    data: {
      name: text(formData, "name"),
      role: text(formData, "role"),
      phone: optionalText(formData, "phone"),
      notes: optionalText(formData, "notes"),
    },
  });

  refresh();
}

export async function updateContact(formData: FormData) {
  const id = text(formData, "id");

  await prisma.usefulContact.update({
    where: { id },
    data: {
      name: text(formData, "name"),
      role: text(formData, "role"),
      phone: optionalText(formData, "phone"),
      notes: optionalText(formData, "notes"),
    },
  });

  refresh();
}

export async function deleteContact(formData: FormData) {
  await prisma.usefulContact.delete({
    where: { id: text(formData, "id") },
  });

  refresh();
}