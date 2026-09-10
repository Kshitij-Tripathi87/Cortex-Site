/* Issue #4/#30: durable Supabase persistence. Production has no stale local fallback. */

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "./supabase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "..", "data");
const waitlistFile = path.resolve(process.env.WORKFLO_WAITLIST_FILE || path.join(dataDir, "waitlist.json"));
const contactFile = path.resolve(process.env.CORTEX_CONTACT_FILE || path.join(dataDir, "contact-requests.json"));
const demoFile = path.resolve(process.env.CORTEX_DEMO_FILE || path.join(dataDir, "demo-requests.json"));
const newsletterFile = path.resolve(process.env.CORTEX_NEWSLETTER_FILE || path.join(dataDir, "newsletter.json"));
const analyticsFile = path.resolve(process.env.CORTEX_ANALYTICS_FILE || path.join(dataDir, "analytics.json"));
const ANALYTICS_LOCAL_CAP = 5000;

export type WaitlistSignup = { id: string; name: string; email: string; company: string; submittedAt: string };
export type ContactRequest = { id: string; name: string; email: string; company: string; product: string; message: string; submittedAt: string };
export type DemoRequest = { id: string; name: string; email: string; company: string; role: string; companySize: string; product: string; message: string; preferredDate: string; submittedAt: string };
export type NewsletterSignup = { id: string; email: string; source: string; submittedAt: string };
export type AnalyticsRecord = { id: string; event: string; page: string; referrer: string; sessionId: string; properties: Record<string, string | number | boolean>; utm: { source: string; medium: string; campaign: string; term: string; content: string }; occurredAt: string; receivedAt: string };
export type StoreResult = { success: boolean; store: "supabase" | "local"; error?: string };

export function newId(prefix: string): string { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
export function submissionHash(email: string, ...contentParts: string[]): string { return createHash("sha256").update([email, ...contentParts].join("|").toLowerCase()).digest("hex").slice(0, 16); }

async function loadJson<T>(file: string): Promise<T[]> {
  try { const entries = JSON.parse(await readFile(file, "utf8")); return Array.isArray(entries) ? (entries as T[]) : []; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}
async function saveJson<T>(file: string, entries: T[]): Promise<void> { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, `${JSON.stringify(entries, null, 2)}\n`, "utf8"); }

async function supabaseInsert(table: string, row: Record<string, unknown>): Promise<StoreResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { success: false, store: "supabase", error: "Supabase not configured" };
  try {
    const { error } = await supabase.from(table).insert(row);
    if (error) { console.error(`[store] Supabase insert into ${table} failed:`, error.message); return { success: false, store: "supabase", error: error.message }; }
    return { success: true, store: "supabase" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[store] Supabase insert into ${table} threw:`, message);
    return { success: false, store: "supabase", error: message };
  }
}

async function supabaseUpdateNotificationStatus(table: string, email: string, hash: string, status: "sent" | "failed"): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    const { error } = await supabase.from(table).update({ notification_status: status }).eq("email", email).eq("submission_hash", hash);
    if (error) throw error;
  } catch (error) { console.error(`[store] Supabase notification status update for ${table} failed:`, error); }
}

async function supabaseCheckDuplicate(table: string, email: string, hash: string, windowMinutes = 5): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { data, error } = await supabase.from(table).select("id").eq("email", email).eq("submission_hash", hash).gte("created_at", cutoff).limit(1);
  if (error) {
    console.error(`[store] Supabase duplicate check for ${table} failed:`, error.message);
    throw new Error("authoritative_store_unavailable");
  }
  return Boolean(data && data.length > 0);
}

async function localCheckDuplicate<T extends { email: string; submittedAt: string }>(file: string, email: string, windowMinutes = 5): Promise<boolean> {
  const entries = await loadJson<T>(file); const cutoff = Date.now() - windowMinutes * 60 * 1000;
  return entries.some((entry) => entry.email.toLowerCase() === email.toLowerCase() && new Date(entry.submittedAt).getTime() > cutoff);
}

async function trySupabaseList<T>(table: string, limit = 500): Promise<T[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) {
    console.error(`[store] Supabase select from ${table} failed:`, error.message);
    throw new Error("authoritative_store_unavailable");
  }
  return (data as T[]) ?? [];
}

export async function saveWaitlistSignup(signup: WaitlistSignup, hash?: string): Promise<StoreResult> {
  const supabase = getSupabaseAdmin();
  if (supabase) return supabaseInsert("waitlist_entries", { name: signup.name, email: signup.email, company: signup.company, source: "website", submission_hash: hash ?? null });
  const entries = await loadJson<WaitlistSignup>(waitlistFile);
  if (!entries.some((entry) => entry.email.toLowerCase() === signup.email.toLowerCase())) { entries.unshift(signup); await saveJson(waitlistFile, entries); }
  return { success: true, store: "local" };
}
export async function isDuplicateWaitlist(email: string, hash: string): Promise<boolean> { return getSupabaseAdmin() ? supabaseCheckDuplicate("waitlist_entries", email, hash) : localCheckDuplicate<WaitlistSignup>(waitlistFile, email); }
export async function markWaitlistNotification(email: string, hash: string, status: "sent" | "failed"): Promise<void> { await supabaseUpdateNotificationStatus("waitlist_entries", email, hash, status); }
export async function listWaitlistSignups(): Promise<WaitlistSignup[]> {
  const remote = await trySupabaseList<{ id: string; name: string; email: string; company: string | null; created_at: string }>("waitlist_entries");
  if (remote !== null) return remote.map((row) => ({ id: String(row.id), name: row.name ?? "", email: row.email ?? "", company: row.company ?? "", submittedAt: row.created_at }));
  return loadJson<WaitlistSignup>(waitlistFile);
}

export async function saveContactRequest(request: ContactRequest, hash?: string): Promise<StoreResult> {
  const supabase = getSupabaseAdmin();
  if (supabase) return supabaseInsert("contact_messages", { name: request.name, email: request.email, company: request.company, product: request.product, message: request.message, submission_hash: hash ?? null });
  const entries = await loadJson<ContactRequest>(contactFile); entries.unshift(request); await saveJson(contactFile, entries); return { success: true, store: "local" };
}
export async function isDuplicateContact(email: string, hash: string): Promise<boolean> { return getSupabaseAdmin() ? supabaseCheckDuplicate("contact_messages", email, hash) : localCheckDuplicate<ContactRequest>(contactFile, email); }
export async function markContactNotification(email: string, hash: string, status: "sent" | "failed"): Promise<void> { await supabaseUpdateNotificationStatus("contact_messages", email, hash, status); }
export async function listContactRequests(): Promise<ContactRequest[]> {
  const remote = await trySupabaseList<{ id: string; name: string; email: string; company: string | null; product: string | null; message: string | null; created_at: string }>("contact_messages");
  if (remote !== null) return remote.map((row) => ({ id: String(row.id), name: row.name ?? "", email: row.email ?? "", company: row.company ?? "", product: row.product ?? "", message: row.message ?? "", submittedAt: row.created_at }));
  return loadJson<ContactRequest>(contactFile);
}

export async function saveDemoRequest(request: DemoRequest, hash?: string): Promise<StoreResult> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const result = await supabaseInsert("demo_requests", { name: request.name, email: request.email, company: request.company, role: request.role, company_size: request.companySize, product: request.product, message: request.message, preferred_date: request.preferredDate, submission_hash: hash ?? null });
    if (result.success) await supabaseInsert("leads", { name: request.name, email: request.email, company: request.company, role: request.role, source: "demo" });
    return result;
  }
  const entries = await loadJson<DemoRequest>(demoFile); entries.unshift(request); await saveJson(demoFile, entries); return { success: true, store: "local" };
}
export async function isDuplicateDemo(email: string, hash: string): Promise<boolean> { return getSupabaseAdmin() ? supabaseCheckDuplicate("demo_requests", email, hash) : localCheckDuplicate<DemoRequest>(demoFile, email); }
export async function markDemoNotification(email: string, hash: string, status: "sent" | "failed"): Promise<void> { await supabaseUpdateNotificationStatus("demo_requests", email, hash, status); }
export async function listDemoRequests(): Promise<DemoRequest[]> {
  const remote = await trySupabaseList<{ id: string; name: string; email: string; company: string | null; role: string | null; company_size: string | null; product: string | null; message: string | null; preferred_date: string | null; created_at: string }>("demo_requests");
  if (remote !== null) return remote.map((row) => ({ id: String(row.id), name: row.name ?? "", email: row.email ?? "", company: row.company ?? "", role: row.role ?? "", companySize: row.company_size ?? "", product: row.product ?? "", message: row.message ?? "", preferredDate: row.preferred_date ?? "", submittedAt: row.created_at }));
  return loadJson<DemoRequest>(demoFile);
}

export async function saveNewsletterSignup(signup: NewsletterSignup): Promise<StoreResult> {
  const supabase = getSupabaseAdmin();
  if (supabase) return supabaseInsert("newsletter_subscribers", { email: signup.email, source: signup.source });
  const entries = await loadJson<NewsletterSignup>(newsletterFile); if (!entries.some((entry) => entry.email.toLowerCase() === signup.email.toLowerCase())) { entries.unshift(signup); await saveJson(newsletterFile, entries); } return { success: true, store: "local" };
}
export async function listNewsletterSignups(): Promise<NewsletterSignup[]> {
  const remote = await trySupabaseList<{ id: string; email: string; source: string | null; created_at: string }>("newsletter_subscribers");
  if (remote !== null) return remote.map((row) => ({ id: String(row.id), email: row.email ?? "", source: row.source ?? "website", submittedAt: row.created_at }));
  return loadJson<NewsletterSignup>(newsletterFile);
}

export async function saveAnalyticsEvent(event: AnalyticsRecord): Promise<StoreResult> {
  return recordAnalyticsEvent(event);
}

export async function recordAnalyticsEvent(event: AnalyticsRecord): Promise<StoreResult> {
  const supabase = getSupabaseAdmin();
  if (supabase) return supabaseInsert("analytics_events", { event: event.event, page: event.page, referrer: event.referrer, session_id: event.sessionId, properties: event.properties, utm_source: event.utm.source, utm_medium: event.utm.medium, utm_campaign: event.utm.campaign, utm_term: event.utm.term, utm_content: event.utm.content, occurred_at: event.occurredAt });
  const entries = await loadJson<AnalyticsRecord>(analyticsFile); entries.unshift(event); if (entries.length > ANALYTICS_LOCAL_CAP) entries.length = ANALYTICS_LOCAL_CAP; await saveJson(analyticsFile, entries); return { success: true, store: "local" };
}
export async function listAnalyticsEvents(limit = 500): Promise<AnalyticsRecord[]> {
  const remote = await trySupabaseList<{ id: string; event: string; page: string | null; referrer: string | null; session_id: string | null; properties: Record<string, string | number | boolean> | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_term: string | null; utm_content: string | null; occurred_at: string; created_at: string }>("analytics_events", limit);
  if (remote !== null) return remote.map((row) => ({ id: String(row.id), event: row.event, page: row.page ?? "", referrer: row.referrer ?? "", sessionId: row.session_id ?? "", properties: row.properties ?? {}, utm: { source: row.utm_source ?? "", medium: row.utm_medium ?? "", campaign: row.utm_campaign ?? "", term: row.utm_term ?? "", content: row.utm_content ?? "" }, occurredAt: row.occurred_at, receivedAt: row.created_at }));
  const localEntries = await loadJson<AnalyticsRecord>(analyticsFile);
  return localEntries.slice(0, limit);
}
