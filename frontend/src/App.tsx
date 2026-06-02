import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store, RootState } from '@/store'
import { router } from '@/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useSelector((s: RootState) => s.ui)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])
  return <>{children}</>
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}

export default App
