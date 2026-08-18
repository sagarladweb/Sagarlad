// Anonymous per-browser token used to show a commenter their own pending
// comments. Browser-only — call from client components.
export function getClientToken(): string {
  const KEY = "sg_client_token";
  let token = window.localStorage.getItem(KEY);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(KEY, token);
  }
  return token;
}
