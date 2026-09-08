/* Silverline Systems reminder: no lead is ever lost to infrastructure. Writes go to
 * Supabase when configured and always land in the local JSON store as backup.
 * Reads prefer Supabase, then fall back to local files. */

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getSupabaseAdmin } from "./supabase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "..", "data");

const waitlistFile = path.resolve(process.env.WORKFLO_WAITLIST_FILE || path.join(dataDir, "waitlist.json"));
const contactFile = path.resolve(process.env.CORTEX_CONTACT_FILE || path.join(dataDir, "contact-requests.json"));
const demoFile = path.resolve(process.env.CORTEX_DEMO_FILE || path.join(dataDir, "demo-requests.json"));
const newsletterFile = path.resolve(process.env.CORTEX_NEWSLETTER_FILE || path.join(dataDir, "newsletter.json"));
const analyticsFile = path.resolve(process.env.CORTEX_ANALYTICS_FILE || path.join(dataDir, "analytics.json"));

/** Cap local analytics growth so the file can never grow without bound. */
const ANALYTICS_LOCAL_CAP = 5000;

export type WaitlistSignup = {
  id: string;
  name: string;
  email: string;
  company: string;
  submittedAt: string;
};

export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  company: string;
  product: string;
  message: string;
  submittedAt: string;
};

export type DemoRequest = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  companySize: string;
  product: string;
  message: string;
  preferredDate: string;
  submittedAt: string;
};

export type NewsletterSignup = {
  id: string;
  email: string;
  source: string;
  submittedAt: string;
};

export type AnalyticsRecord = {
  id: string;
  event: string;
  page: string;
  referrer: string;
  sessionId: string;
  properties: Record<string, string | number | boolean>;
  utm: { source: string; medium: string; campaign: string; term: string; content: string };
  occurredAt: string;
  receivedAt: string;
};

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function loadJson<T>(file: string): Promise<T[]> {
  try {
    const contents = await readFile(file, "utf8");
    const entries = JSON.parse(contents);
    return Array.isArray(entries) ? (entries as T[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveJson<T>(file: string, entries: T[]): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

async function trySupabaseInsert(table: string, row: Record<string, unknown>): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(table).insert(row);
    if (error) {
      console.error(`[store] Supabase insert into ${table} failed:`, error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[store] Supabase insert into ${table} threw:`, error);
    return false;
  }
}

async function trySupabaseList<T>(table: string, limit = 500): Promise<T[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error(`[store] Supabase select from ${table} failed:`, error.message);
      return null;
    }
    return (data as T[]) ?? [];
  } catch (error) {
    console.error(`[store] Supabase select from ${table} threw:`, error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Waitlist                                                            */
/* ------------------------------------------------------------------ */

export async function saveWaitlistSignup(signup: WaitlistSignup): Promise<void> {
  const entries = await loadJson<WaitlistSignup>(waitlistFile);
  entries.unshift(signup);
  await saveJson(waitlistFile, entries);
  await trySupabaseInsert("waitlist_entries", {
    name: signup.name,
    email: signup.email,
    company: signup.company,
    source: "website",
  });
}

export async function listWaitlistSignups(): Promise<WaitlistSignup[]> {
  const remote = await trySupabaseList<{
    id: string; name: string; email: string; company: string | null; created_at: string;
  }>("waitlist_entries");
  if (remote) {
    return remote.map((row) => ({
      id: String(row.id),
      name: row.name ?? "",
      email: row.email ?? "",
      company: row.company ?? "",
      submittedAt: row.created_at,
    }));
  }
  return loadJson<WaitlistSignup>(waitlistFile);
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export async function saveContactRequest(request: ContactRequest): Promise<void> {
  const entries = await loadJson<ContactRequest>(contactFile);
  entries.unshift(request);
  await saveJson(contactFile, entries);
  await trySupabaseInsert("contact_messages", {
    name: request.name,
    email: request.email,
    company: request.company,
    product: request.product,
    message: request.message,
  });
}

export async function listContactRequests(): Promise<ContactRequest[]> {
  const remote = await trySupabaseList<{
    id: string; name: string; email: string; company: string | null;
    product: string | null; message: string | null; created_at: string;
  }>("contact_messages");
  if (remote) {
    return remote.map((row) => ({
      id: String(row.id),
      name: row.name ?? "",
      email: row.email ?? "",
      company: row.company ?? "",
      product: row.product ?? "",
      message: row.message ?? "",
      submittedAt: row.created_at,
    }));
  }
  return loadJson<ContactRequest>(contactFile);
}

/* ------------------------------------------------------------------ */
/* Demo                                                                */
/* ------------------------------------------------------------------ */

export async function saveDemoRequest(request: DemoRequest): Promise<void> {
  const entries = await loadJson<DemoRequest>(demoFile);
  entries.unshift(request);
  await saveJson(demoFile, entries);
  await trySupabaseInsert("demo_requests", {
    name: request.name,
    email: request.email,
    company: request.company,
    role: request.role,
    company_size: request.companySize,
    product: request.product,
    message: request.message,
    preferred_date: request.preferredDate,
  });
  // Mirror a unified lead record for funnel attribution.
  await trySupabaseInsert("leads", {
    name: request.name,
    email: request.email,
    company: request.company,
    role: request.role,
    source: "demo",
  });
}

export async function listDemoRequests(): Promise<DemoRequest[]> {
  const remote = await trySupabaseList<{
    id: string; name: string; email: string; company: string | null; role: string | null;
    company_size: string | null; product: string | null; message: string | null;
    preferred_date: string | null; created_at: string;
  }>("demo_requests");
  if (remote) {
    return remote.map((row) => ({
      id: String(row.id),
      name: row.name ?? "",
      email: row.email ?? "",
      company: row.company ?? "",
      role: row.role ?? "",
      companySize: row.company_size ?? "",
      product: row.product ?? "",
      message: row.message ?? "",
      preferredDate: row.preferred_date ?? "",
      submittedAt: row.created_at,
    }));
  }
  return loadJson<DemoRequest>(demoFile);
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

export async function saveNewsletterSignup(signup: NewsletterSignup): Promise<void> {
  const entries = await loadJson<NewsletterSignup>(newsletterFile);
  if (!entries.some((entry) => entry.email.toLowerCase() === signup.email.toLowerCase())) {
    entries.unshift(signup);
    await saveJson(newsletterFile, entries);
  }
  await trySupabaseInsert("newsletter_subscribers", {
    email: signup.email,
    source: signup.source,
  });
}

export async function listNewsletterSignups(): Promise<NewsletterSignup[]> {
  const remote = await trySupabaseList<{ id: string; email: string; source: string | null; created_at: string }>(
    "newsletter_subscribers",
  );
  if (remote) {
    return remote.map((row) => ({
      id: String(row.id),
      email: row.email ?? "",
      source: row.source ?? "website",
      submittedAt: row.created_at,
    }));
  }
  return loadJson<NewsletterSignup>(newsletterFile);
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export async function saveAnalyticsEvent(record: AnalyticsRecord): Promise<void> {
  const entries = await loadJson<AnalyticsRecord>(analyticsFile);
  entries.unshift(record);
  await saveJson(analyticsFile, entries.slice(0, ANALYTICS_LOCAL_CAP));
  await trySupabaseInsert("analytics_events", {
    event: record.event,
    page: record.page,
    referrer: record.referrer,
    session_id: record.sessionId,
    properties: record.properties,
    utm_source: record.utm.source,
    utm_medium: record.utm.medium,
    utm_campaign: record.utm.campaign,
  });
}

export async function listAnalyticsEvents(limit = 500): Promise<AnalyticsRecord[]> {
  const remote = await trySupabaseList<{
    id: number; event: string; page: string | null; referrer: string | null;
    session_id: string | null; properties: Record<string, string | number | boolean> | null;
    utm_source: string | null; utm_medium: string | null; utm_campaign: string | null;
    created_at: string;
  }>("analytics_events", limit);
  if (remote) {
    return remote.map((row) => ({
      id: String(row.id),
      event: row.event,
      page: row.page ?? "",
      referrer: row.referrer ?? "",
      sessionId: row.session_id ?? "",
      properties: row.properties ?? {},
      utm: {
        source: row.utm_source ?? "",
        medium: row.utm_medium ?? "",
        campaign: row.utm_campaign ?? "",
        term: "",
        content: "",
      },
      occurredAt: row.created_at,
      receivedAt: row.created_at,
    }));
  }
  const local = await loadJson<AnalyticsRecord>(analyticsFile);
  return local.slice(0, limit);
}
