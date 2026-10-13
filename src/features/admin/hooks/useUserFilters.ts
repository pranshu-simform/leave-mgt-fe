import { useEffect, useMemo, useState } from 'react'
import { USER_ROLES, type UserRole } from '@/constants/constant'
import type { AdminUserParams } from '@/features/admin/types/adminTypes'
import { useDebounce } from '@/hooks/useDebounce'
import { useTableFilters } from '@/hooks/useTableFilters'

const FILTER_DEFAULTS = { search: '', role: '', active: '' }
const FILTER_VALIDATORS = {
  role: (value: string) => Object.values(USER_ROLES).includes(value as UserRole),
  active: (value: string) => value === 'true' || value === 'false',
}

// The filters, search box and request parameters of a people list. The state lives in the URL, and
// the box keeps what is typed while the URL (and the request) follow once typing pauses.
export function useUserFilters() {
  const table = useTableFilters({ defaults: FILTER_DEFAULTS, validate: FILTER_VALIDATORS })
  const { filters, page, pageSize, setFilter, reset } = table

  const [text, setText] = useState(filters.search)
  const debouncedText = useDebounce(text.trim(), 300)
  useEffect(() => {
    if (debouncedText !== filters.search) setFilter('search', debouncedText)
    // Only a pause in typing should write the URL.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText])

  const params: AdminUserParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.role ? { role: filters.role as UserRole } : {}),
      ...(filters.active ? { isActive: filters.active === 'true' } : {}),
    }),
    [page, pageSize, filters],
  )

  const clearFilters = () => {
    setText('')
    reset()
  }

  return { ...table, text, setText, params, clearFilters }
}
