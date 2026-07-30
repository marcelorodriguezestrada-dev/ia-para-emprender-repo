// Panel de uso interno (vos y Daniel) — no hay registro público. El acceso
// se controla con Google Sign-In + una lista blanca de emails permitidos,
// no con roles en base de datos (para algo tan chico, alcanza y sobra).

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function esAdminAutorizado(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
