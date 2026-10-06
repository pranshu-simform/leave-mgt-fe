import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '@/features/auth/api/authApi'
import { handleApiError, isApiError } from '@/lib/apiClient'
import { clearUserData } from '@/lib/queryClient'
import { showError } from '@/lib/toast'

// The cookies are httpOnly, so only the server can end the session. If the call fails the user is
// still signed in, and the screen says so instead of pretending otherwise (this matters on a shared
// computer). A 401 means the session is already gone: the API client signs the app out itself.
export function useLogout() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: authApi.logout,
    // Leaving must not wait on a retry when the network is down.
    retry: false,
    onSuccess: async () => {
      await navigate('/login', { replace: true })
      await clearUserData()
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 401) return
      showError(
        isApiError(error) && error.status === 0
          ? 'Could not reach the server, so you are still signed in. Try again.'
          : handleApiError(error, 'Could not sign out. Try again.'),
        'logout-failed',
      )
    },
  })
}
