// Slug used in public project URLs: /projects/<nameprojects>.
// Derived from the title on the fly (kept in sync by construction), so no DB
// column is needed. Non-ASCII names fall back to 'untitled'.
export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
  return slug || 'untitled'
}
