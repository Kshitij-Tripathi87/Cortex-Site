import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  Feather,
  Instagram,
  Linkedin,
  Menu,
  MousePointer2,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

const testimonials = [
  {
    quote:
      "QuillSpark gives every idea a little more room to breathe. I went from scattered notes to a sharp first draft before my coffee got cold.",
    name: "Maya Chen",
    role: "Brand strategist",
    initials: "MC",
    tint: "#e4d8ff",
  },
  {
    quote:
      "It feels less like asking AI to write for me and more like having an excellent editor sitting beside me, asking the right questions.",
    name: "Jon Bell",
    role: "Independent writer",
    initials: "JB",
    tint: "#f6d8bd",
  },
  {
    quote:
      "The voice presets are magic. Our team finally sounds like one team without every sentence losing its personality.",
    name: "Ari Okafor",
    role: "Content lead at Northstar",
    initials: "AO",
    tint: "#cfe4db",
  },
];

const features = [
  {
    number: "01",
    icon: WandSparkles,
    title: "Find your flow",
    copy: "Turn a blank page into a clear next sentence with context-aware prompts that sound like you.",
    accent: "lavender",
  },
  {
    number: "02",
    icon: Command,
    title: "Shape the signal",
    copy: "Tighten, expand, or shift the tone in one click—without flattening the thought behind it.",
    accent: "peach",
  },
  {
    number: "03",
    icon: BookOpenText,
    title: "Keep your voice",
    copy: "Save the phrases, rhythms, and point of view that make your writing recognizably yours.",
    accent: "mint",
  },
];

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="QuillSpark home">
      <span className="brand-mark"><Feather size={17} strokeWidth={2.4} /></span>
      <span>QuillSpark</span>
    </a>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  const goToTestimonial = (direction: number) => {
    setActiveTestimonial((current) => (current + direction + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[activeTestimonial];

  return (
    <div className="quill-page" id="top">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <header className="site-header">
        <div className="nav-shell">
          <Logo />
          <nav className={mobileOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
            <a href="#stories" onClick={() => setMobileOpen(false)}>Stories</a>
          </nav>
          <a className="nav-cta" href="#early-access">Get early access <ArrowRight size={15} /></a>
          <button className="mobile-toggle" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid container">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> Now gathering a small first circle</div>
              <h1>Make room for your <em>best</em> words.</h1>
              <p className="hero-lede">QuillSpark is the AI writing partner for people with something worth saying—helping you move from a flicker of an idea to words that feel like you.</p>
              <form className="signup-form" id="early-access" onSubmit={submitSignup}>
                <label className="sr-only" htmlFor="email">Your email address</label>
                <input id="email" type="email" placeholder="you@email.com" value={email} onChange={(event) => { setEmail(event.target.value); setSubmitted(false); }} required />
                <button type="submit">{submitted ? <><Check size={17} /> You&apos;re on the list</> : <>Join the first circle <ArrowRight size={17} /></>}</button>
              </form>
              <div className="signup-note"><span className="tiny-lock">✦</span> No noise. Just an invite when it&apos;s ready.</div>
            </div>
            <div className="hero-art" aria-label="A stylized preview of the QuillSpark writing workspace">
              <div className="art-orbit orbit-a" />
              <div className="art-orbit orbit-b" />
              <div className="floating-note note-top"><span className="note-dot" /> Thought, meet structure.</div>
              <div className="floating-note note-bottom"><Sparkles size={14} /> Voice preserved</div>
              <div className="hero-paper">
                <div className="paper-toolbar"><span className="paper-brand"><Feather size={13} /> quill<span>spark</span></span><span className="paper-status">Draft 04 <span className="status-dot" /></span></div>
                <div className="paper-body">
                  <span className="paper-kicker">A note to begin</span>
                  <h2>Start with the<br /><span>almost.</span></h2>
                  <p>The first thought is rarely the one that stays. QuillSpark helps you listen for the sentence underneath it.</p>
                  <div className="paper-suggestion"><div className="suggestion-icon"><WandSparkles size={15} /></div><div><strong>Try a little more wonder</strong><span>Make this feel more like you.</span></div><ArrowRight size={15} /></div>
                </div>
                <div className="paper-footer"><span>482 words</span><span><span className="save-dot" /> All changes saved</span></div>
              </div>
              <div className="cursor"><MousePointer2 size={19} fill="white" /><span>quill</span></div>
            </div>
          </div>
          <div className="hero-scroll"><span /> Scroll to explore</div>
        </section>

        <section className="signal-strip" aria-label="QuillSpark promise">
          <div className="container signal-inner"><span className="signal-label">A calmer way to write</span><span className="signal-line" /><span>Less wrestling with words. More time with the thought.</span><span className="signal-star">✳</span></div>
        </section>

        <section className="features-section section-pad" id="features">
          <div className="container">
            <div className="section-intro"><div><div className="eyebrow"><span className="eyebrow-dot" /> The good stuff</div><h2>Clarity, with a<br /><em>little lift.</em></h2></div><p>Not another autocomplete. QuillSpark is built around the way good writing actually happens: in passes, in questions, in tiny sparks.</p></div>
            <div className="features-grid">{features.map((feature) => { const Icon = feature.icon; return <article className={`feature-card ${feature.accent}`} key={feature.number}><div className="feature-top"><span className="feature-number">{feature.number}</span><div className="feature-icon"><Icon size={22} strokeWidth={1.8} /></div></div><h3>{feature.title}</h3><p>{feature.copy}</p><a href="#early-access" className="text-link">See it in action <ArrowRight size={15} /></a></article>; })}</div>
          </div>
        </section>

        <section className="teaser-section section-pad" id="how-it-works">
          <div className="container teaser-grid">
            <div className="teaser-copy"><div className="eyebrow"><span className="eyebrow-dot" /> A peek inside</div><h2>The page is yours.<br /><em>The possibility is ours.</em></h2><p>QuillSpark stays close to your intent. It listens for your tone, catches the loose thread, and offers just enough magic to keep you moving.</p><a className="dark-button" href="#early-access">Get the first look <ArrowRight size={16} /></a></div>
            <div className="editor-window"><div className="window-top"><div className="window-dots"><span /><span /><span /></div><div className="window-title">Untitled / morning pages</div><div className="window-count">1 of 3</div></div><div className="editor-content"><div className="editor-sidebar"><div className="side-logo"><Feather size={15} /></div><span className="side-active" /><span /><span /><span /></div><div className="editor-main"><div className="editor-meta"><span>MONDAY, 08:42</span><span>PRIVATE DRAFT</span></div><h3>There are days<br />that begin <i>mid-sentence.</i></h3><p className="editor-paragraph">The light comes in before the certainty does. I open the page anyway—<span className="highlight">a small act of trust.</span></p><div className="editor-ai"><div className="ai-spark"><Sparkles size={16} /></div><div><span className="ai-label">QUILLSPARK SUGGESTION</span><p>Keep the image, sharpen the turn.</p></div><button aria-label="Accept suggestion"><Check size={15} /></button></div><div className="editor-lines"><span /><span /><span /></div></div></div><div className="editor-bottom"><span><span className="save-dot" /> Synced just now</span><span>⌘ + K&nbsp;&nbsp; Ask QuillSpark</span></div></div>
          </div>
        </section>

        <section className="stories-section section-pad" id="stories">
          <div className="container stories-layout"><div className="stories-label"><div className="eyebrow"><span className="eyebrow-dot" /> From the first circle</div><span className="quote-mark">“</span><span className="story-index">0{activeTestimonial + 1} / 0{testimonials.length}</span></div><div className="testimonial-area"><blockquote>&ldquo;{currentTestimonial.quote}&rdquo;</blockquote><div className="testimonial-byline"><div className="avatar" style={{ background: currentTestimonial.tint }}>{currentTestimonial.initials}</div><div><strong>{currentTestimonial.name}</strong><span>{currentTestimonial.role}</span></div></div><div className="carousel-controls"><div className="carousel-dots">{testimonials.map((testimonial, index) => <button key={testimonial.name} aria-label={`Show testimonial ${index + 1}`} className={index === activeTestimonial ? "active" : ""} onClick={() => setActiveTestimonial(index)} />)}</div><div className="arrow-controls"><button aria-label="Previous testimonial" onClick={() => goToTestimonial(-1)}><ChevronLeft size={18} /></button><button aria-label="Next testimonial" onClick={() => goToTestimonial(1)}><ChevronRight size={18} /></button></div></div></div></div>
        </section>

        <section className="final-cta section-pad"><div className="container final-cta-inner"><div className="final-spark"><Sparkles size={24} /></div><div className="eyebrow"><span className="eyebrow-dot" /> Your next draft is waiting</div><h2>Good words are<br /><em>worth the wait.</em></h2><p>Join the first circle and be among the first to write with QuillSpark.</p><a className="light-button" href="#early-access">Save my spot <ArrowRight size={16} /></a></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-top"><Logo /><p>Writing, with a little more light.</p><div className="social-links"><a href="#top" aria-label="QuillSpark on Instagram"><Instagram size={17} /></a><a href="#top" aria-label="QuillSpark on LinkedIn"><Linkedin size={17} /></a><a href="#top" aria-label="QuillSpark on X"><span className="x-icon">𝕏</span></a></div></div><div className="container footer-bottom"><span>© 2026 QuillSpark, Inc.</span><div><a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Made for the in-between.</a></div></div></footer>
    </div>
  );
}

