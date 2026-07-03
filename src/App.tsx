import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { ThemeProvider } from "./components/common/theme-provider";

const Login = lazy(() => import("./pages/Login"));
const SignupPage = lazy(() => import("./pages/SignUp"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmail"));
const PrivacyPolicy = lazy(() => import("./components/common/privacy"));
const TermsAndConditions = lazy(() => import("./components/common/terms"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallback"));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-gray-500">
      Зареждане...
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Login />} path="/hefest-frontend/" />
          <Route element={<SignupPage />} path="/hefest-frontend/signup" />
          <Route
            element={<VerifyEmailPage />}
            path="/hefest-frontend/verify-email"
          />
          <Route
            element={<TermsAndConditions />}
            path="/hefest-frontend/terms"
          />
          <Route element={<PrivacyPolicy />} path="/hefest-frontend/privacy" />
          {/* OAuth landing — public: the token arrives in the URL fragment and
              is only stored here, so ProtectedRoute would bounce it. */}
          <Route
            element={<AuthCallbackPage />}
            path="/hefest-frontend/auth/callback"
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<EventsPage />} path="/hefest-frontend/events" />
            <Route
              element={<EventDetailPage />}
              path="/hefest-frontend/events/:eventId"
            />
            {/* Legacy routes — redirect to the unified page */}
            <Route
              path="/hefest-frontend/events/student"
              element={<Navigate to="/hefest-frontend/events" replace />}
            />
            <Route
              path="/hefest-frontend/events/manager"
              element={<Navigate to="/hefest-frontend/events" replace />}
            />
          </Route>
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
