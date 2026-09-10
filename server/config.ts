/** Production environment contract for the Cortex marketing server. */

export interface Config {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  supabase: { url: string | null; serviceRoleKey: string | null; configured: boolean };
  resend: { apiKey: string | null; emailMode: "mock" | "resend"; configured: boolean };
  email: {
    contactTo: string | null;
    contactFrom: string | null;
    waitlistTo: string | null;
    waitlistFrom: string | null;
  };
  admin: { token: string | null; configured: boolean };
  ollama: { baseUrl: string; model: string; configured: boolean };
  files: { waitlist: string; contact: string; demo: string; newsletter: string; analytics: string };
}

function required(name: string, errors: string[]): string {
  const value = (process.env[name] ?? "").trim();
  if (!value) errors.push(name);
  return value;
}

function optional(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

let cachedConfig: Config | null = null;

/**
 * Load and validate configuration. In production, all mandatory settings are
 * validated together so the process fails deterministically rather than
 * partially starting with a broken runtime contract.
 */
export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const nodeEnv = optional("NODE_ENV", "development");
  const isProduction = nodeEnv === "production";
  const errors: string[] = [];

  const supabaseUrl = optional("SUPABASE_URL");
  const supabaseKey = optional("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = optional("RESEND_API_KEY");
  const emailModeRaw = optional("CORTEX_EMAIL_MODE", optional("WORKFLO_EMAIL_MODE", isProduction ? "resend" : "mock"));
  const emailMode = emailModeRaw === "mock" || emailModeRaw === "resend" ? emailModeRaw : "";

  const contactTo = optional("CORTEX_CONTACT_TO_EMAIL");
  const contactFrom = optional("CORTEX_CONTACT_EMAIL_FROM");
  const waitlistTo = optional("CORTEX_WAITLIST_TO_EMAIL", optional("WORKFLO_WAITLIST_TO_EMAIL"));
  const waitlistFrom = optional("CORTEX_EMAIL_FROM", optional("WORKFLO_EMAIL_FROM"));

  // Supabase is authoritative in production.
  if (isProduction) {
    required("SUPABASE_URL", errors);
    required("SUPABASE_SERVICE_ROLE_KEY", errors);
    required("RESEND_API_KEY", errors);
    if (!emailMode) errors.push("CORTEX_EMAIL_MODE (must be mock or resend)");
    if (emailMode !== "resend") errors.push("CORTEX_EMAIL_MODE=resend");
    if (!contactTo) errors.push("CORTEX_CONTACT_TO_EMAIL");
    if (!contactFrom) errors.push("CORTEX_CONTACT_EMAIL_FROM");
    if (!waitlistTo) errors.push("CORTEX_WAITLIST_TO_EMAIL");
    if (!waitlistFrom) errors.push("CORTEX_EMAIL_FROM");
  } else if (emailModeRaw !== "mock" && emailModeRaw !== "resend") {
    console.warn(`[config] Invalid email mode '${emailModeRaw}' — using mock development mode.`);
  }

  if (errors.length > 0) {
    throw new Error(`[config] Production configuration invalid. Missing or invalid: ${errors.join(", ")}`);
  }

  const portValue = Number.parseInt(optional("PORT", "3000"), 10);
  if (!Number.isInteger(portValue) || portValue < 1 || portValue > 65535) {
    throw new Error(`[config] Invalid PORT: ${process.env.PORT ?? ""}`);
  }

  cachedConfig = {
    port: portValue,
    nodeEnv,
    isProduction,
    supabase: {
      url: supabaseUrl || null,
      serviceRoleKey: supabaseKey || null,
      configured: Boolean(supabaseUrl && supabaseKey),
    },
    resend: {
      apiKey: resendKey || null,
      emailMode: emailMode === "resend" ? "resend" : "mock",
      configured: Boolean(resendKey),
    },
    email: {
      contactTo: contactTo || null,
      contactFrom: contactFrom || null,
      waitlistTo: waitlistTo || null,
      waitlistFrom: waitlistFrom || null,
    },
    admin: {
      token: optional("WORKFLO_ADMIN_TOKEN") || null,
      configured: Boolean(optional("WORKFLO_ADMIN_TOKEN")),
    },
    ollama: {
      baseUrl: optional("OLLAMA_BASE_URL", "http://localhost:11434"),
      model: optional("OLLAMA_MODEL", "llama3"),
      configured: Boolean(optional("OLLAMA_BASE_URL")),
    },
    files: {
      waitlist: optional("WORKFLO_WAITLIST_FILE", "data/waitlist.json"),
      contact: optional("CORTEX_CONTACT_FILE", "data/contacts.json"),
      demo: optional("CORTEX_DEMO_FILE", "data/demos.json"),
      newsletter: optional("CORTEX_NEWSLETTER_FILE", "data/newsletter.json"),
      analytics: optional("CORTEX_ANALYTICS_FILE", "data/analytics.json"),
    },
  };

  console.log(`[config] ${isProduction ? "Production" : "Development"} configuration validated.`);
  return cachedConfig;
}

/** Test-only hook. */
export function __resetConfigForTests(): void {
  cachedConfig = null;
}
