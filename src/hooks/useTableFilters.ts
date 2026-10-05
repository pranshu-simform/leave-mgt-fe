import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/constants/constant'

const PAGE_PARAM = 'page'
const LIMIT_PARAM = 'limit'

type FilterValues = Record<string, string>

interface TableFiltersConfig<F extends FilterValues> {
  // Every filter and its default. A filter at its default is left out of the URL.
  defaults: F
  // A value that fails its check falls back to the default, so a hand-edited URL cannot break the page.
  validate?: { [K in keyof F]?: (value: string) => boolean }
}

function readPositiveInt(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return parsed >= 1 ? parsed : null
}

// The state of a filtered, paginated list lives in the URL search params, so a view can be shared,
// survives a reload and works with back and forward. Changing a filter or the page size goes back
// to page 1. Everything here replaces the history entry, so filtering does not fill the back stack.
export function useTableFilters<F extends FilterValues>({
  defaults,
  validate,
}: Readonly<TableFiltersConfig<F>>) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const resolved: FilterValues = {}
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key)
      const accepted = value !== null && (validate?.[key]?.(value) ?? true)
      resolved[key] = accepted ? value : (defaults[key] ?? '')
    }
    return resolved as F
  }, [searchParams, defaults, validate])

  const page = readPositiveInt(searchParams.get(PAGE_PARAM)) ?? 1
  const requestedSize = readPositiveInt(searchParams.get(LIMIT_PARAM))
  const pageSize = PAGE_SIZE_OPTIONS.find((size) => size === requestedSize) ?? DEFAULT_PAGE_SIZE

  const update = useCallback(
    (change: (next: URLSearchParams) => void) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          change(next)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setFilter = useCallback(
    <K extends keyof F & string>(key: K, value: F[K]) =>
      update((next) => {
        if (value === defaults[key]) next.delete(key)
        else next.set(key, value)
        next.delete(PAGE_PARAM)
      }),
    [update, defaults],
  )

  const setPage = useCallback(
    (nextPage: number) =>
      update((next) => {
        if (nextPage <= 1) next.delete(PAGE_PARAM)
        else next.set(PAGE_PARAM, String(nextPage))
      }),
    [update],
  )

  const setPageSize = useCallback(
    (size: number) =>
      update((next) => {
        if (size === DEFAULT_PAGE_SIZE) next.delete(LIMIT_PARAM)
        else next.set(LIMIT_PARAM, String(size))
        next.delete(PAGE_PARAM)
      }),
    [update],
  )

  const reset = useCallback(
    () =>
      update((next) => {
        for (const key of Object.keys(defaults)) next.delete(key)
        next.delete(PAGE_PARAM)
      }),
    [update, defaults],
  )

  const isFiltered = Object.keys(defaults).some((key) => filters[key] !== defaults[key])

  return { filters, page, pageSize, setFilter, setPage, setPageSize, reset, isFiltered }
}
