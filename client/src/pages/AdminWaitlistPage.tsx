import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, LoaderCircle, LogOut, RefreshCw } from "lucide-react";
import { Link } from "wouter";

type WaitlistSignup = { id: string; name: string; email: string; company: string; submittedAt: string };

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminWaitlistPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [entries, setEntries] = useState<WaitlistSignup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/waitlist", { credentials: "same-origin" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) setAuthenticated(false);
        throw new Error(payload.error || "Could not load waitlist submissions.");
      }
      setEntries(payload.entries || []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load waitlist submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/admin/session", { credentials: "same-origin" });
        const payload = await response.json().catch(() => ({}));
        if (!active) return;
        setAuthenticated(response.ok && Boolean(payload.authenticated));
      } catch {
        if (active) setAuthenticated(false);
      } finally {
        if (active) setCheckingSession(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authenticated) void loadEntries();
  }, [authenticated]);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password || signingIn) return;
    setSigningIn(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not sign in.");
      setPassword("");
      setAuthenticated(true);
    } catch (requestError) {
      setLoginError(requestError instanceof Error ? requestError.message : "Could not sign in.");
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      setAuthenticated(false);
      setEmail("");
      setPassword("");
      setEntries([]);
      setError("");
      setSigningOut(false);
    }
  };

  if (checkingSession) {
    return <div className="admin-site"><main className="admin-main"><div className="admin-session-check"><LoaderCircle size={18} className="animate-spin" /> Checking session...</div></main></div>;
  }

  return (
    <div className="admin-site">
      <header className="detail-header">
        <Link href="/" className="brand">
          <span className="brand-mark-shell"><span className="brand-mark admin-mark">C</span></span>
          <span className="brand-wordmark">CORTEX</span>
        </Link>
        <span className="admin-header-label">CORTEX / ADMIN</span>
        {authenticated && <button type="button" className="admin-signout" onClick={() => void signOut()} disabled={signingOut}>{signingOut ? <LoaderCircle size={13} className="animate-spin" /> : <LogOut size={13} />} Sign out</button>}
      </header>

      <main className="admin-main">
        {!authenticated ? (
          <section className="admin-login-card">
            <div className="admin-icon"><LockKeyhole size={19} /></div>
            <p className="eyebrow">PRIVATE WORKSPACE</p>
            <h1>Cortex<br /><em>admin.</em></h1>
            <p>Sign in with your Supabase Auth administrator account.</p>
            <form onSubmit={submitLogin}>
              <label>
                Email address
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@your-domain.com" autoComplete="username" disabled={signingIn} required />
              </label>
              <label>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" disabled={signingIn} required />
              </label>
              {loginError && <p className="admin-error" role="alert">{loginError}</p>}
              <button className="button-primary" type="submit" disabled={signingIn}>{signingIn ? <><LoaderCircle size={16} className="animate-spin" /> Signing in...</> : <>Open dashboard <ArrowRight size={16} /></>}</button>
            </form>
          </section>
        ) : (
          <section className="admin-dashboard">
            <div className="admin-dashboard-topline">
              <div><p className="eyebrow">CORTEX / EARLY ACCESS</p><h1>Waitlist submissions.</h1><p>Every request received through the Cortex early-access form.</p></div>
              <button type="button" className="admin-refresh" onClick={() => void loadEntries()} disabled={loading}><RefreshCw size={16} className={loading ? "admin-refresh-spin" : ""} /> {loading ? "Refreshing..." : "Refresh"}</button>
            </div>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <div className="admin-summary"><strong>{entries.length}</strong><span>total signups</span></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Submitted</th></tr></thead><tbody>
              {entries.length ? entries.map((entry) => <tr key={entry.id}><td>{entry.name}</td><td><a href={`mailto:${entry.email}`}>{entry.email}</a></td><td>{entry.company || "—"}</td><td>{formatSubmittedAt(entry.submittedAt)}</td></tr>) : <tr><td colSpan={4} className="admin-empty">No waitlist submissions yet.</td></tr>}
            </tbody></table></div>
          </section>
        )}
      </main>
      <footer className="admin-footer"><Link href="/products"><ArrowLeft size={15} /> Back to products</Link><span>Protected Cortex workspace</span></footer>
    </div>
  );
}
