import { Route, Routes } from "react-router-dom"
import PrivacyPolicy from "./components/privacy"
import TermsAndConditions from "./components/terms"
import { ThemeProvider } from "./components/theme-provider"
import Login from "./pages/Login"
import SignupPage from "./pages/SignUp"
import { EventOrganizerPanel } from "./components/event-draft"

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<Login />} path="/hefest-frontend/" />
        <Route element={<SignupPage />} path="/hefest-frontend/signup" />
        <Route element={<TermsAndConditions />} path="/hefest-frontend/terms" />
        <Route element={<PrivacyPolicy />} path="/hefest-frontend/privacy" />
        <Route
          element={<EventOrganizerPanel />}
          path="/hefest-frontend/events"
        />
      </Routes>
    </ThemeProvider>
  )
}

export default App
