// A number input registers as a string; an empty one is "not entered", not 0.
export function toNumber(value: unknown): number | undefined {
  return value === '' || value === null || value === undefined ? undefined : Number(value)
}

export function toNumberOrNull(value: unknown): number | null | undefined {
  return value === '' || value === null || value === undefined ? null : Number(value)
}
