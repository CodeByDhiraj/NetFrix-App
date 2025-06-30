// utils/format.ts
export const minutesToHms = (m: number) =>
  `${Math.floor(m / 60)}h ${m % 60}m`

export const list = (arr?: string[], limit = 4) =>
  (arr ?? []).slice(0, limit).join(", ")
