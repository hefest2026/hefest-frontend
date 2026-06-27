import { Route, Routes } from "react-router-dom"
import PrivacyPolicy from "./components/common/privacy"
import TermsAndConditions from "./components/common/terms"
import { ThemeProvider } from "./components/common/theme-provider"
import Login from "./pages/Login"
import SignupPage from "./pages/SignUp"
import { EventManager } from "./components/organizer part/event-manager"
import { StudentEventsPage } from "./pages/Student-Event_Page"

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<Login />} path="/hefest-frontend/" />
        <Route element={<SignupPage />} path="/hefest-frontend/signup" />
        <Route element={<TermsAndConditions />} path="/hefest-frontend/terms" />
        <Route element={<PrivacyPolicy />} path="/hefest-frontend/privacy" />
        <Route
          element={<EventManager />}
          path="/hefest-frontend/events/manager"
        />
        <Route
          element={<StudentEventsPage />}
          path="/hefest-frontend/events/student"
        />
      </Routes>
    </ThemeProvider>
  )
}

export default App
