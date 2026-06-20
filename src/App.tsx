import { Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Login from "./pages/Login"

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<Login />} path="/hefest-frontend/" />
      </Routes>
    </ThemeProvider>
  )
}

export default App
