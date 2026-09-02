// Client-side template storage. Pure functions — no React, no server.
// Templates are stored in localStorage so they persist across sessions
// without needing a database table.

import type { NewsletterContent } from "./newsletterTemplates";

const STORAGE_KEY = "nl_saved_templates";

export type SavedTemplate = {
  id: string;
  name: string;
  createdAt: string;
  content: NewsletterContent;
  subject: string;
};

function readAll(): SavedTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(templates: SavedTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getTemplates(): SavedTemplate[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveTemplate(
  name: string,
  subject: string,
  content: NewsletterContent
): SavedTemplate {
  const templates = readAll();
  const template: SavedTemplate = {
    id: crypto.randomUUID(),
    name: name.trim() || `Template ${templates.length + 1}`,
    createdAt: new Date().toISOString(),
    subject,
    content: { ...content },
  };
  templates.push(template);
  writeAll(templates);
  return template;
}

export function updateTemplate(
  id: string,
  name: string,
  subject: string,
  content: NewsletterContent
): SavedTemplate | null {
  const templates = readAll();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  templates[idx] = { ...templates[idx], name: name.trim(), subject, content: { ...content } };
  writeAll(templates);
  return templates[idx];
}

export function deleteTemplate(id: string): boolean {
  const templates = readAll();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;
  writeAll(filtered);
  return true;
}

export function getTemplate(id: string): SavedTemplate | null {
  return readAll().find((t) => t.id === id) ?? null;
}

export function exportTemplates(): string {
  return JSON.stringify(readAll(), null, 2);
}

export function importTemplates(json: string): number {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Invalid format");
  const existing = readAll();
  const existingIds = new Set(existing.map((t) => t.id));
  const incoming = parsed.filter((t: SavedTemplate) => t.id && t.name && t.content);
  const added = incoming.filter((t: SavedTemplate) => !existingIds.has(t.id));
  writeAll([...existing, ...added]);
  return added.length;
}
