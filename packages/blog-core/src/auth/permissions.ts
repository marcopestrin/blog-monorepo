export type Action =
  | "article:create" | "article:update:any" | "article:update:own"
  | "article:publish" | "article:archive"
  | "tag:manage" | "media:upload"
  | "author:manage" | "tenant:manage";

const matrix: Record<string, Action[]> = {
  writer:    ["article:create","article:update:own","media:upload"],
  editor:    ["article:create","article:update:any","media:upload","tag:manage"],
  publisher: ["article:update:any","article:publish","article:archive"],
  admin:     ["article:create","article:update:any","article:publish","article:archive","tag:manage","media:upload","author:manage","tenant:manage"],
};

export function can(roles: string[], action: Action) {
  return roles.some(r => matrix[r]?.includes(action));
}
