import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { signup, login, logout, getMe } from '../apis/auth.ts'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getMe,
    retry: false, // don't retry 401s — the user is just not logged in
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, email, password }: { username: string; email: string; password: string }) =>
      signup(username, email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null)
    },
  })
}
