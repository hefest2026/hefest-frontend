import { Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Login from "./pages/Login"
import SignupPage from "./pages/SignUp"

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<Login />} path="/hefest-frontend/" />
        <Route element={<SignupPage />} path="/hefest-frontend/signup" />
      </Routes>
    </ThemeProvider>
  )
}

export default App
