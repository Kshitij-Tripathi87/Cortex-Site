/* Silverline Systems reminder: legal pages are trust surfaces. Plain language, clear
 * structure, honest scope — and a visible review date, never silent staleness.
 *
 * IMPORTANT: this is template content aligned to the site's actual processing
 * (forms, waitlist, first-party analytics). It must be reviewed by counsel
 * before it is treated as final, including DPDP Act 2023 / DPDP Rules 2025
 * compliance for India, retention schedules, subprocessors, and DPA terms.
 */

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const LEGAL_UPDATED = "September 8, 2026";

const COUNSEL_NOTE =
  "This page is provided for transparency and will be finalized with legal counsel. If any statement here conflicts with a signed agreement between you and Cortex, the signed agreement controls.";

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    updated: LEGAL_UPDATED,
    intro:
      "Cortex collects the minimum personal information needed to run this website, respond to your requests, and understand — in aggregate — how the site is used. We do not sell personal information.",
    sections: [
      {
        heading: "Information you provide",
        paragraphs: [
          "When you contact us, request a demo, join the Workflo waitlist, or subscribe to updates, we receive the details you enter: typically your name, work email, company, role, and the content of your message.",
          "Demo and scheduling flows may also record your preferred meeting time and timezone so calendar invitations arrive correctly.",
        ],
      },
      {
        heading: "Information collected automatically",
        paragraphs: [
          "If you enable analytics in the cookie banner, we record first-party events such as pages viewed and funnel actions (for example, starting or submitting a form), along with coarse attribution such as UTM parameters and referrer.",
          "We do not use cross-site tracking, fingerprinting, or third-party advertising cookies. Do-not-track signals are honored as an analytics opt-out.",
        ],
      },
      {
        heading: "How we use information",
        paragraphs: [
          "We use your information to respond to inquiries, schedule and confirm meetings, operate the waitlist and newsletter, secure the site against abuse, and improve our pages and content.",
          "We do not use form submissions to train public models, and we do not share your details with advertisers.",
        ],
      },
      {
        heading: "Sharing and subprocessors",
        paragraphs: [
          "We share information only with the service providers needed to operate this site — for example, hosting, transactional email, and (when provisioned) our database provider — each bound to process data solely on our instructions.",
          "A subprocessor list will be published here once the production vendor set is finalized with counsel.",
        ],
      },
      {
        heading: "India: DPDP Act notice",
        paragraphs: [
          "For visitors in India, personal data is processed under the Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025. Where consent is the basis for processing, you may withdraw it at any time using the cookie preferences control or by writing to us, without affecting processing already completed.",
          "You may request access, correction, erasure, nomination, and grievance redressal as provided under the Act. Grievance contact details will be published here once designated.",
        ],
      },
      {
        heading: "Retention",
        paragraphs: [
          "Intake records (contact, demo, waitlist, newsletter) are kept only as long as needed for the purpose they were collected, plus a reasonable period for audit and legal compliance. Aggregated analytics are retained separately from identifiers.",
          "A formal retention schedule will be published with the finalized policy.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "You can withdraw analytics, marketing, and preference consent at any time from the cookie preferences control in the footer, and unsubscribe from the newsletter with one click.",
          "To request access, correction, or deletion of your information, write to hello@cortex.systems from the address you used with us.",
        ],
      },
      { heading: "Counsel review", paragraphs: [COUNSEL_NOTE] },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    updated: LEGAL_UPDATED,
    intro:
      "These terms govern your use of the Cortex marketing website. The Cortex product itself (when generally available) will be governed by its own agreements.",
    sections: [
      {
        heading: "The website",
        paragraphs: [
          "This site provides information about Cortex products, platform, company, and resources. Demonstrations and interactive elements on marketing pages are illustrative unless they explicitly state otherwise.",
          "Nothing on this site obligates Cortex to deliver any product, feature, or timeline. Early-access and coming-soon labels describe current plans, not commitments.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "You agree to use the site lawfully and as further described in the Acceptable Use Policy, including not attempting to disrupt, probe, or abuse the site, its forms, or the AI Core assistant.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "The Cortex name, marks, design, and content on this site are owned by Cortex or its licensors. You may view and share links to our pages; any other reproduction requires written permission.",
        ],
      },
      {
        heading: "AI Core",
        paragraphs: [
          "The AI Core assistant provides general information grounded in Cortex documentation. Its answers may be incomplete and are not professional advice. Use of AI features is additionally governed by the AI Terms.",
        ],
      },
      {
        heading: "Disclaimers and liability",
        paragraphs: [
          "The site is provided “as is” without warranties of any kind to the maximum extent permitted by law. To that same extent, Cortex is not liable for indirect or consequential losses arising from use of the site.",
          "These limitations will be finalized with counsel for each jurisdiction in which Cortex operates.",
        ],
      },
      {
        heading: "Changes and contact",
        paragraphs: [
          "We may update these terms as the site and company evolve; the review date at the top always shows the current version. Questions: hello@cortex.systems.",
        ],
      },
      { heading: "Counsel review", paragraphs: [COUNSEL_NOTE] },
    ],
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    updated: LEGAL_UPDATED,
    intro: "A short list of what is and isn’t acceptable when using the Cortex website and its interactive features.",
    sections: [
      {
        heading: "Do",
        paragraphs: [
          "Explore, share, and reference our public content; submit honest inquiries through the provided forms; report suspected abuse or security issues to hello@cortex.systems.",
        ],
      },
      {
        heading: "Do not",
        paragraphs: [
          "Submit false, misleading, or unlawful content; attempt to access accounts, systems, or data without authorization; probe, scan, or overload the site; circumvent rate limits, access controls, or consent choices.",
          "Do not use AI Core to extract system prompts, generate harmful content, impersonate others, or process personal data about third parties without a lawful basis.",
        ],
      },
      {
        heading: "Enforcement",
        paragraphs: [
          "We may rate-limit, block, or otherwise restrict access that violates this policy, and we may preserve evidence where required by law.",
        ],
      },
      { heading: "Counsel review", paragraphs: [COUNSEL_NOTE] },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    updated: LEGAL_UPDATED,
    intro:
      "Cortex uses a small amount of browser storage — and only loads non-essential categories after you choose them. Essential storage is always on because the site cannot function without it.",
    sections: [
      {
        heading: "Essential (always on)",
        paragraphs: [
          "Security and session cookies for protected areas, load balancing, and remembering your consent choice itself (cortex-consent-v1). No consent is required because the site cannot operate without them.",
        ],
      },
      {
        heading: "Analytics (opt-in)",
        paragraphs: [
          "First-party funnel measurement: pages viewed, CTA and form events, and coarse attribution. Stored only after you enable Analytics, and never shared with ad networks. Do-not-track is honored as an opt-out.",
        ],
      },
      {
        heading: "Preferences (opt-in)",
        paragraphs: [
          "Convenience storage on your device, such as recent searches and AI Core context. Nothing leaves the browser except when you use the related feature.",
        ],
      },
      {
        heading: "Marketing (opt-in)",
        paragraphs: [
          "Campaign attribution (UTM parameters) so we can tell which outreach earned a visit. No third-party advertising trackers are installed by this site.",
        ],
      },
      {
        heading: "Managing your choices",
        paragraphs: [
          "Use the “Cookie preferences” control in the footer to review or withdraw consent at any time. Withdrawing consent stops future collection; it does not delete data already processed, which you can request to delete under the Privacy Policy.",
          "You can also clear site storage from your browser settings, which resets all Cortex categories to essential-only.",
        ],
      },
      { heading: "Counsel review", paragraphs: [COUNSEL_NOTE] },
    ],
  },
  {
    slug: "ai-terms",
    title: "AI Terms",
    updated: LEGAL_UPDATED,
    intro:
      "These terms apply to AI features on this website, including the AI Core assistant. They supplement the Terms of Service and Acceptable Use Policy.",
    sections: [
      {
        heading: "What AI Core is",
        paragraphs: [
          "AI Core is a documentation assistant grounded in Cortex platform and product content. It cites the source behind each answer and suggests follow-up questions to help you find the right page.",
          "AI Core is informational only. It does not execute operations, access your systems, or make decisions on your behalf.",
        ],
      },
      {
        heading: "Limits of AI answers",
        paragraphs: [
          "AI-generated answers can be incomplete or out of date. Verify consequential information against the cited documentation or by talking to our team before acting on it.",
        ],
      },
      {
        heading: "Your inputs",
        paragraphs: [
          "Do not submit secrets, credentials, or sensitive personal data to AI Core. Prompts are processed to generate answers and — in aggregate — to improve the assistant; they are rate-limited and abuse-monitored.",
        ],
      },
      {
        heading: "Fair use",
        paragraphs: [
          "Automated bulk querying, prompt-injection attempts, and efforts to make the assistant misrepresent Cortex capabilities are prohibited and may result in restricted access.",
        ],
      },
      { heading: "Counsel review", paragraphs: [COUNSEL_NOTE] },
    ],
  },
];

export function legalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}
