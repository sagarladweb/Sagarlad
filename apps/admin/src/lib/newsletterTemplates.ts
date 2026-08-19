// Email-safe HTML builders. Pure functions — importable from the server send
// path AND from the client composer preview. Email clients only reliably
// render tables + inline styles: no flex, no grid, no external CSS, no JS.
// Every field is plain text; the builders escape and wrap it in paragraphs.

export type TemplateId = "letter" | "editorial" | "minimal";

export type NewsletterContent = {
  template: TemplateId;
  accent: string;
  preheader: string;
  greeting: string;
  intro: string;
  sections: { heading: string; body: string }[];
  quote: { text: string; author: string } | null;
  cta: { label: string; url: string } | null;
  signoff: string;
  socials: { label: string; href: string }[];
};

// Accent choices offered in the composer. Yellow is the site default; blue is
// the deep-brand option for a more formal letter.
export const BRAND_ACCENTS = [
  { name: "Yellow", value: "#ffd51d" },
  { name: "Blue", value: "#0d21a1" },
];

// Follow row appended before the sign-off. Email-safe table, always inline.
export function socialRow(socials: { label: string; href: string }[]): string {
  if (socials.length === 0) return "";
  const links = socials
    .map(
      (s, i) => `
        <td style="padding:0 ${
          i === socials.length - 1 ? "0" : "12px"
        } 0 0">
          <a href="${esc(s.href)}" style="color:${INK};text-decoration:underline;text-underline-offset:2px;font-size:13px;font-weight:600;white-space:nowrap">${esc(s.label)}</a>
        </td>`
    )
    .join("");
  return `
    <tr><td style="padding:6px 40px 2px 40px">
      <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Follow me</p>
    </td></tr>
    <tr><td style="padding:0 40px 26px 40px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>${links}</tr></table>
    </td></tr>`;
}

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  tagline: string;
  swatch: string;
}[] = [
  { id: "letter", name: "The Letter", tagline: "Warm, classic, easy to read", swatch: "#ffcb00" },
  { id: "editorial", name: "Editorial", tagline: "Bold magazine layout, high contrast", swatch: "#111110" },
  { id: "minimal", name: "Minimal", tagline: "Airy, quiet, focused on the words", swatch: "#e8e6e1" },
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Split text on blank lines into <p> tags.
function paras(text: string): string {
  const clean = esc(text).trim();
  return clean
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px 0;line-height:1.65">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

// Brand tokens — aligned with design.md. Yellow accent is the site's only
// constant accent; ink/cream match the site's typography surfaces. The accent
// comes from the composer (BRAND_ACCENTS) so a letter can switch to blue.
const INK = "#111110";
const MUTED = "#6b6a66";
const CREAM = "#faf9f6";

const FONT = 'font-family:-apple-system,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;';

const dateLabel = () =>
  new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// The preheader is the hidden first line of the email — the snippet most
// clients show after the subject in the inbox. Left empty, clients fall back
// to scraping body copy; setting it explicitly keeps the inbox line on-brand.
function preheaderDiv(preheader: string): string {
  if (!preheader.trim()) return "";
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(
    preheader
  )}</div>`;
}

// ---------------------------------------------------------------------------
// Template: The Letter — warm banded header, serif headings, left-rule quotes,
// pill CTA. The default for this site.
// ---------------------------------------------------------------------------
export function letterBody(c: NewsletterContent): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${FONT}">
    ${preheaderDiv(c.preheader)}
    <tr><td align="center" style="background:${CREAM};padding:28px 24px 0 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #ecebe6;border-radius:14px;overflow:hidden">
        <tr><td style="padding:34px 40px 10px 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="12" style="height:12;background:${c.accent};border-radius:3px"></td>
              <td style="font-size:13px;font-weight:700;letter-spacing:2px;color:${INK};text-transform:uppercase;padding:0 0 0 10px">Sagar Lad</td>
              <td align="right" style="font-size:12px;color:${MUTED};padding:0">${dateLabel()}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="height:1px;background:${c.accent};padding:0 40px">
          <div style="height:2px;background:${c.accent}"></div>
        </td></tr>
        <tr><td style="padding:30px 40px 6px 40px;font-size:15px;color:${INK};${FONT}min-height:40px">
          <p style="margin:0 0 6px 0;font-weight:700">${esc(c.greeting)}</p>
          ${paras(c.intro)}
        </td></tr>
        ${c.sections
          .map(
            (s, i) => `
        <tr><td style="padding:${i === 0 ? "14px" : "6px"} 40px 0 40px">
          <p style="margin:0 0 10px 0;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;color:${INK}">${esc(s.heading)}</p>
          <div style="margin:0 0 14px 0;height:3px;width:42px;background:${c.accent}"></div>
          <div style="font-size:15px;color:#2a2926">${paras(s.body)}</div>
        </td></tr>`
          )
          .join("")}
        ${
          c.quote
            ? `
        <tr><td style="padding:18px 40px 0 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="4" style="background:${c.accent};border-radius:2px"></td>
            <td style="padding:6px 22px;font-style:italic;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#3c3a35">${esc(c.quote.text)}
              ${
                c.quote.author
                  ? `<div style="font-style:normal;font-size:13px;font-weight:700;color:${MUTED};margin-top:8px">— ${esc(c.quote.author)}</div>`
                  : ""
              }
            </td>
          </tr></table>
        </td></tr>`
            : ""
        }
        ${
          c.cta
            ? `
        <tr><td align="center" style="padding:26px 40px 0 40px">
          <a href="${esc(c.cta.url)}" style="background:${c.accent};color:${INK};text-decoration:none;font-weight:700;font-size:15px;padding:13px 34px;border-radius:999px;display:inline-block">${esc(c.cta.label)}</a>
        </td></tr>`
            : ""
        }
        ${socialRow(c.socials)}
        <tr><td style="padding:28px 40px 34px 40px;color:${MUTED};${FONT}font-size:14px">
          ${paras(c.signoff || "Warm regards,<br/>Sagar Lad")}
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

// ---------------------------------------------------------------------------
// Template: Editorial — black banded header with yellow logo block, crisp
// hairline section rules, highlighted quote, slab CTA.
// ---------------------------------------------------------------------------
export function editorialBody(c: NewsletterContent): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${FONT}">
    ${preheaderDiv(c.preheader)}
    <tr><td align="center" style="background:#f3f2ee;padding:28px 24px 0 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e3dd;border-radius:6px;overflow:hidden">
        <tr><td style="background:${INK};padding:26px 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td><span style="background:${c.accent};color:${INK};font-weight:800;letter-spacing:1px;font-size:13px;padding:5px 10px;border-radius:3px">SAGAR LAD</span></td>
              <td align="right" style="color:rgba(255,255,255,0.55);font-size:12px">${dateLabel()}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:34px 40px 4px 40px;font-size:15px;color:#2b2a26">
          <p style="margin:0 0 8px 0;font-weight:700;color:${INK}">${esc(c.greeting)}</p>
          ${paras(c.intro)}
        </td></tr>
        ${c.sections
          .map(
            (s, i) => `
        <tr><td style="padding:${i === 0 ? "18px" : "10px"} 40px 0 40px;border-top:1px solid #efede8">
          <p style="margin:16px 0 12px 0;font-size:19px;font-weight:800;color:${INK}">${esc(s.heading)}</p>
          <div style="font-size:15px;color:#2b2a26">${paras(s.body)}</div>
        </td></tr>`
          )
          .join("")}
        ${
          c.quote
            ? `
        <tr><td style="padding:20px 40px 0 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:${c.accent};border-radius:4px;padding:18px 24px">
              <p style="margin:0;font-size:16px;font-style:italic;font-family:Georgia,'Times New Roman',serif;color:${INK}">${esc(c.quote.text)}</p>
              ${
                c.quote.author
                  ? `<p style="margin:8px 0 0 0;font-size:12px;font-weight:700;color:${INK};letter-spacing:1px;text-transform:uppercase">${esc(c.quote.author)}</p>`
                  : ""
              }
            </td>
          </tr></table>
        </td></tr>`
            : ""
        }
        ${
          c.cta
            ? `
        <tr><td align="center" style="padding:26px 40px 0 40px">
          <a href="${esc(c.cta.url)}" style="background:${INK};color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:0.5px;padding:14px 36px;border-radius:3px;display:inline-block">${esc(c.cta.label)}</a>
        </td></tr>`
            : ""
        }
        ${socialRow(c.socials)}
        <tr><td style="padding:14px 40px 30px 40px;color:${MUTED};font-size:14px">
          ${paras(c.signoff || "Warm regards,<br/>Sagar Lad")}
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

// ---------------------------------------------------------------------------
// Template: Minimal — thin header rule, quiet type, single cut-through line,
// underlined text CTA. No buttons, no color blocks.
// ---------------------------------------------------------------------------
export function minimalBody(c: NewsletterContent): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${FONT}">
    ${preheaderDiv(c.preheader)}
    <tr><td align="center" style="background:#fbfbfa;padding:34px 20px 0 20px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:transparent">
        <tr><td style="padding:0 24px 18px 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="height:1px;background:#d8d5cf"></td>
            <td width="8"></td>
            <td style="font-size:11px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;white-space:nowrap">Letter ${dateLabel()}</td>
            <td width="8"></td>
            <td style="height:1px;background:#d8d5cf"></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:6px 24px;font-size:15px;color:#33322e">
          <p style="margin:0 0 8px 0;font-weight:600">${esc(c.greeting)}</p>
          ${paras(c.intro)}
        </td></tr>
        ${c.sections
          .map(
            (s, i) => `
        <tr><td style="padding:${i === 0 ? "14px" : "4px"} 24px 0 24px">
          <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:${INK}">${esc(s.heading)}</p>
          <div style="font-size:15px;color:#4a4843">${paras(s.body)}</div>
        </td></tr>`
          )
          .join("")}
        ${
          c.quote
            ? `
        <tr><td style="padding:20px 24px 0 24px">
          <p style="margin:0;font-style:italic;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#3c3a35;border-top:1px solid #e2e0db;border-bottom:1px solid #e2e0db;padding:20px 8px">${esc(c.quote.text)}
            ${
              c.quote.author
                ? `<span style="font-style:normal;font-size:12px;font-weight:700;color:${MUTED}"> — ${esc(c.quote.author)}</span>`
                : ""
            }
          </p>
        </td></tr>`
            : ""
        }
        ${
          c.cta
            ? `
        <tr><td style="padding:24px 24px 0 24px">
          <a href="${esc(c.cta.url)}" style="color:${INK};text-decoration:underline;text-underline-offset:3px;font-weight:600;font-size:15px">${esc(c.cta.label)} <span style="color:${c.accent}">→</span></a>
        </td></tr>`
            : ""
        }
        ${socialRow(c.socials)}
        <tr><td style="padding:14px 24px 30px 24px;color:${MUTED};font-size:14px">
          ${paras(c.signoff || "Warm regards,<br/>Sagar Lad")}
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

const BUILDERS: Record<TemplateId, (c: NewsletterContent) => string> = {
  letter: letterBody,
  editorial: editorialBody,
  minimal: minimalBody,
};

export function buildTemplateBody(id: TemplateId, c: NewsletterContent): string {
  return BUILDERS[id](c);
}

export const emptyNewsletter: NewsletterContent = {
  template: "letter",
  accent: "#ffd51d",
  preheader:
    "A big idea, a practical filter, and one simple thing you can do this week.",
  greeting: "Hi there,",
  intro:
    "A big idea, a practical filter, and one simple thing you can do this week. Read time: under three minutes.",
  sections: [{ heading: "The idea", body: "Start writing here. Short paragraphs, one idea at a time." }],
  quote: null,
  cta: null,
  signoff: "Warm regards,\nSagar Lad",
  socials: [],
};

// Full envelope: body + unsubscribe footer. Rendered identically by the
// composer preview and the Brevo send path.
export function emailShell(companyName: string, bodyHtml: string, unsubscribeUrl: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fafafa">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:24px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;font-family:-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:#1a1a1a">
        <tr><td>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:26px 20px 10px 20px;font-size:12px;color:#888;text-align:center;${FONT}">
          You are receiving this because you subscribed to ${esc(companyName)}.<br/>
          <a href="${esc(unsubscribeUrl)}" style="color:#888">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}