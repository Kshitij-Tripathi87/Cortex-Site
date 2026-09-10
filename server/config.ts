/**
 * Production configuration validation and environment contract.
 *
 * Issue #9: Render deployment contract
 *
 * Validates required environment variables at startup.
 * In production (NODE_ENV=production), missing required
 * variables cause a hard failure with a clear message.
 * In development, missing variables are logged as warnings.
 */

export interface Config {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  supabase: {
    url: string | null;
    serviceRoleKey: string | null;
    configured: boolean;
  };
  resend: {
    apiKey: string | null;
    emailMode: string;
    configured: boolean;
  };
  email: {
    contactTo: string | null;
    contactFrom: string | null;
    waitlistTo: string | null;
    waitlistFrom: string | null;
  };
  admin: {
    token: string | null;
    configured: boolean;
  };
  ollama: {
    baseUrl: string;
    model: string;
    configured: boolean;
  };
  files: {
    waitlist: string;
    contact: string;
    demo: string;
    newsletter: string;
    analytics: string;
  };
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[config] FATAL: Required environment variable ${name} is not set.`);
      console.error(`[config] Set it via Render dashboard or 'render secret set ${name}=VALUE'.`);
      process.exit(1);
    }
    console.warn(`[config] WARNING: ${name} is not set — running in development fallback mode.`);
  }
  return value ?? "";
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const nodeEnv = optional("NODE_ENV", "development");
  const isProduction = nodeEnv === "production";

  const supabaseUrl = isProduction ? required("SUPABASE_URL") : optional("SUPABASE_URL", "");
  const supabaseKey = isProduction ? required("SUPABASE_SERVICE_ROLE_KEY") : optional("SUPABASE_SERVICE_ROLE_KEY", "");
  const resendKey = optional("RESEND_API_KEY", "");
  const adminToken = isProduction ? required("WORKFLO_ADMIN_TOKEN") : optional("WORKFLO_ADMIN_TOKEN", "");

  cachedConfig = {
    port: parseInt(optional("PORT", "3000"), 10),
    nodeEnv,
    isProduction,
    supabase: {
      url: supabaseUrl || null,
      serviceRoleKey: supabaseKey || null,
      configured: Boolean(supabaseUrl && supabaseKey),
    },
    resend: {
      apiKey: resendKey || null,
      emailMode: optional("WORKFLO_EMAIL_MODE", "mock"),
      configured: Boolean(resendKey),
    },
    email: {
      contactTo: optional("CORTEX_CONTACT_TO_EMAIL", "") || null,
      contactFrom: optional("CORTEX_CONTACT_EMAIL_FROM", "") || null,
      waitlistTo: optional("WORKFLO_WAITLIST_TO_EMAIL", "") || null,
      waitlistFrom: optional("WORKFLO_EMAIL_FROM", "") || null,
    },
    admin: {
      token: adminToken || null,
      configured: Boolean(adminToken),
    },
    ollama: {
      baseUrl: optional("OLLAMA_BASE_URL", "http://localhost:11434"),
      model: optional("OLLAMA_MODEL", "llama3"),
      configured: Boolean(optional("OLLAMA_BASE_URL", "")),
    },
    files: {
      waitlist: optional("WORKFLO_WAITLIST_FILE", "data/waitlist.json"),
      contact: optional("CORTEX_CONTACT_FILE", "data/contacts.json"),
      demo: optional("CORTEX_DEMO_FILE", "data/demos.json"),
      newsletter: optional("CORTEX_NEWSLETTER_FILE", "data/newsletter.json"),
      analytics: optional("CORTEX_ANALYTICS_FILE", "data/analytics.json"),
    },
  };

  if (isProduction) {
    console.log("[config] Production mode — all required variables validated.");
    if (!cachedConfig.resend.configured) {
      console.warn("[config] RESEND_API_KEY not set — email delivery will fail.");
    }
    if (!cachedConfig.ollama.configured) {
      console.warn("[config] OLLAMA_BASE_URL not set — AI chat will use grounded fallback only.");
    }
  } else {
    console.log("[config] Development mode — missing variables use fallbacks.");
  }

  return cachedConfig;
}
