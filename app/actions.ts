"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./lib/prisma";

const parseDate = (value: FormDataEntryValue | null) => {
  const text = String(value ?? "");
  return text ? new Date(`${text}T00:00:00`) : new Date();
};

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const optionalText = (formData: FormData, key: string) => text(formData, key) || null;

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
  revalidatePath("/");
}

export async function deleteExpense(formData: FormData) {
  await prisma.expense.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/");
}

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
  revalidatePath("/");
}

export async function deleteEvent(formData: FormData) {
  await prisma.calendarEvent.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/");
}

export async function addTask(formData: FormData) {
  await prisma.familyTask.create({
    data: {
      title: text(formData, "title"),
      owner: text(formData, "owner"),
      due: parseDate(formData.get("due")),
      priority: text(formData, "priority"),
    },
  });
  revalidatePath("/");
}

export async function toggleTask(formData: FormData) {
  const id = text(formData, "id");
  const task = await prisma.familyTask.findUnique({ where: { id } });
  if (task) {
    await prisma.familyTask.update({ where: { id }, data: { done: !task.done } });
  }
  revalidatePath("/");
}

export async function deleteTask(formData: FormData) {
  await prisma.familyTask.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/");
}

export async function addGrocery(formData: FormData) {
  await prisma.groceryItem.create({
    data: {
      item: text(formData, "item"),
      quantity: optionalText(formData, "quantity"),
    },
  });
  revalidatePath("/");
}

export async function toggleGrocery(formData: FormData) {
  const id = text(formData, "id");
  const item = await prisma.groceryItem.findUnique({ where: { id } });
  if (item) {
    await prisma.groceryItem.update({ where: { id }, data: { done: !item.done } });
  }
  revalidatePath("/");
}

export async function deleteGrocery(formData: FormData) {
  await prisma.groceryItem.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/");
}

export async function addDocument(formData: FormData) {
  await prisma.familyDocument.create({
    data: {
      name: text(formData, "name"),
      location: text(formData, "location"),
      renew: optionalText(formData, "renew") ? parseDate(formData.get("renew")) : null,
      owner: text(formData, "owner"),
    },
  });
  revalidatePath("/");
}

export async function deleteDocument(formData: FormData) {
  await prisma.familyDocument.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/");
}

export async function addContact(formData: FormData) {
  await prisma.usefulContact.create({
    data: {
      name: text(formData, "name"),
      role: text(formData, "role"),
      phone: optionalText(formData, "phone"),
      notes: optionalText(formData, "notes"),
    },
  });
  revalidatePath("/");
}

export async function deleteContact(formData: FormData) {
  await prisma.usefulContact.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/");
}
