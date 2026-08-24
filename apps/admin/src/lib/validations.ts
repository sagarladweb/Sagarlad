import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  name: z.string().trim().min(2, "Please enter your name").max(80).optional().or(z.literal("")),
  acceptedTerms: z.boolean().optional(),
});

// Gate for free eBook downloads: name + email (sanitized), mandatory privacy/terms
// consent, and a *separate* newsletter opt-in checkbox. Newsletter is only ever
// touched when `newsletter` is explicitly true.
export const ebookDownloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(80)
    .regex(/^[\p{L}\p{M}\p{N}\s'\-.]*$/u, "Name contains invalid characters"),
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  acceptedTerms: z.boolean().refine((v) => v === true, {
    message: "You must accept the Privacy Policy and Terms",
  }),
  newsletter: z.boolean().default(false),
});

export const contactSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required").max(80),
  lastName: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  organization: z.string().trim().min(2, "Organization is required").max(120),
  eventDate: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  type: z.enum(["EVENT", "INTERVIEW", "SPEAKING"]).default("EVENT"),
});

export const commentSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  content: z.string().trim().min(3, "Comment is too short").max(1000),
  postSlug: z.string().trim().min(1),
  clientToken: z.string().trim().max(100).optional().or(z.literal("")),
});

export const adminPostSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes"),
  excerpt: z.string().trim().max(400).optional().or(z.literal("")),
  content: z.string().trim().min(10, "Content is too short"),
  coverImage: z.string().trim().max(500).optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
  kicker: z.string().trim().max(80).optional().or(z.literal("")),
  showCover: z.boolean().optional(),
  showAuthorBox: z.boolean().optional(),
  footerNote: z.string().trim().max(300).optional().or(z.literal("")),
});
