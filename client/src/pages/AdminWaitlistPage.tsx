import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, RefreshCw } from "lucide-react";
import { Link } from "wouter";

type WaitlistSignup = {
  id: string;
  name: string;
  email: string;
  company: string;
  submittedAt: string;
};

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminWaitlistPage() {
  const [token, setToken] = useState(() => window.sessionStorage.getItem("workflo-admin-token") || "");
  const [tokenInput, setTokenInput] = useState(() => window.sessionStorage.getItem("workflo-admin-token") || "");
  const [entries, setEntries] = useState<WaitlistSignup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEntries = async (authToken = token) => {
    if (!authToken) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/waitlist", { headers: { Authorization: `Bearer ${authToken}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          window.sessionStorage.removeItem("workflo-admin-token");
          setToken("");
        }
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
    if (token) void loadEntries(token);
  }, [token]);

  const submitToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextToken = tokenInput.trim();
    if (!nextToken) return;
    window.sessionStorage.setItem("workflo-admin-token", nextToken);
    setToken(nextToken);
  };

  const signOut = () => {
    window.sessionStorage.removeItem("workflo-admin-token");
    setToken("");
    setTokenInput("");
    setEntries([]);
    setError("");
  };

  return <div className="admin-site"><header className="detail-header"><Link href="/" className="brand"><span className="brand-mark-shell"><span className="brand-mark admin-mark">C</span></span><span className="brand-wordmark">CORTEX</span></Link><span className="admin-header-label">WORKFLO / ADMIN</span>{token && <button type="button" className="admin-signout" onClick={signOut}>Sign out</button>}</header><main className="admin-main">{!token ? <section className="admin-login-card"><div className="admin-icon"><LockKeyhole size={19} /></div><p className="eyebrow">PRIVATE WORKSPACE</p><h1>Workflo<br /><em>waitlist.</em></h1><p>Enter the admin access token to view early-access submissions.</p><form onSubmit={submitToken}><label>Admin token<input type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} placeholder="Paste your access token" autoComplete="current-password" required /></label><button className="button-primary" type="submit">Open dashboard <ArrowRight size={16} /></button></form></section> : <section className="admin-dashboard"><div className="admin-dashboard-topline"><div><p className="eyebrow">WORKFLO / EARLY ACCESS</p><h1>Waitlist submissions.</h1><p>Every request received through the Workflo early-access form.</p></div><button type="button" className="admin-refresh" onClick={() => void loadEntries()} disabled={loading}><RefreshCw size={16} className={loading ? "admin-refresh-spin" : ""} /> {loading ? "Refreshing..." : "Refresh"}</button></div>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-summary"><strong>{entries.length}</strong><span>total signups</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Submitted</th></tr></thead><tbody>{entries.length ? entries.map((entry) => <tr key={entry.id}><td>{entry.name}</td><td><a href={`mailto:${entry.email}`}>{entry.email}</a></td><td>{entry.company || "—"}</td><td>{formatSubmittedAt(entry.submittedAt)}</td></tr>) : <tr><td colSpan={4} className="admin-empty">No waitlist submissions yet.</td></tr>}</tbody></table></div></section>}</main><footer className="admin-footer"><Link href="/product"><ArrowLeft size={15} /> Back to products</Link><span>Protected Workflo workspace</span></footer></div>;
}
