import { revalidatePath, revalidateTag } from "next/cache";

// Revalidate every public page after an admin write so the site stays fresh
// without paying a DB query per visitor. Pages use ISR (`revalidate`) as the
// fallback TTL; this is the instant path when content actually changes.
export function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/blog", "page");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/books", "page");
  revalidatePath("/videos", "page");
  revalidatePath("/videos/[slug]", "page");
  revalidatePath("/quotes", "page");
  revalidatePath("/content", "page");
  revalidatePath("/content/[slug]", "page");
  revalidateTag("socials", "max");
  revalidateTag("content", "max");
  revalidateTag("categories", "max");
  revalidateTag("videos", "max");
  revalidateTag("books", "max");
  revalidateTag("quotes", "max");
}
