// Router: public landing at "/", guest-only login/register, role-guarded sections.
// Pages are code-split with React.lazy; shell pieces stay in the main chunk.
import { Suspense, lazy } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth, roleHome } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Button from "./ui/Button";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { CenterLoad } from "./components/Feedback";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const CreateDelivery = lazy(() => import("./pages/customer/CreateDelivery"));
const MyDeliveries = lazy(() => import("./pages/customer/MyDeliveries"));
const CustomerDeliveryDetails = lazy(() => import("./pages/customer/CustomerDeliveryDetails"));
const CustomerPayments = lazy(() => import("./pages/customer/CustomerPayments"));
const RiderDashboard = lazy(() => import("./pages/rider/RiderDashboard"));
const AvailableJobs = lazy(() => import("./pages/rider/AvailableJobs"));
const AssignedJobs = lazy(() => import("./pages/rider/AssignedJobs"));
const RiderDeliveryDetails = lazy(() => import("./pages/rider/RiderDeliveryDetails"));
const RiderHistory = lazy(() => import("./pages/rider/RiderHistory"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminDeliveries = lazy(() => import("./pages/admin/AdminDeliveries"));
const AdminDeliveryDetails = lazy(() => import("./pages/admin/AdminDeliveryDetails"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
// Design review page: dev only, never linked from the app UI.
const Design = import.meta.env.DEV ? lazy(() => import("./pages/Design")) : null;

function IndexRoute() {
  const { loading } = useAuth();
  if (loading) return <CenterLoad />;
  // Public landing for everyone — logged-in users stay on "/" until
  // they choose "Go to dashboard". No redirect here.
  return <Landing />;
}

function GuestRoute({ children }) {
  const { user, token, loading } = useAuth();
  if (loading) return <CenterLoad />;
  if (token && user) return <Navigate to={roleHome(user.role)} replace />;
  return children;
}

const guard = (el, roles) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

function NotFound() {
  const { user } = useAuth();
  const home = user ? roleHome(user.role) : "/";
  const label = user ? "Back to dashboard" : "Back to home";
  return (
    <div className="card narrow not-found">
      <h2>Page not found</h2>
      <p className="muted">This page moved or never existed.</p>
      <Button to={home} variant="primary">{label}</Button>
      {user && (
        <p className="muted" style={{ marginTop: 12 }}>
          <Link to="/">Home</Link>
        </p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Layout>
            <Suspense fallback={<CenterLoad />}>
              <Routes>
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                <Route path="/" element={<IndexRoute />} />
                {/* Customer */}
                <Route path="/customer" element={guard(<CustomerDashboard />, ["CUSTOMER"])} />
                <Route path="/customer/create" element={guard(<CreateDelivery />, ["CUSTOMER"])} />
                <Route path="/customer/deliveries" element={guard(<MyDeliveries />, ["CUSTOMER"])} />
                <Route path="/customer/deliveries/:id" element={guard(<CustomerDeliveryDetails />, ["CUSTOMER"])} />
                <Route path="/customer/payments" element={guard(<CustomerPayments />, ["CUSTOMER"])} />
                {/* Rider */}
                <Route path="/rider" element={guard(<RiderDashboard />, ["RIDER"])} />
                <Route path="/rider/available" element={guard(<AvailableJobs />, ["RIDER"])} />
                <Route path="/rider/assigned" element={guard(<AssignedJobs />, ["RIDER"])} />
                <Route path="/rider/deliveries/:id" element={guard(<RiderDeliveryDetails />, ["RIDER"])} />
                <Route path="/rider/history" element={guard(<RiderHistory />, ["RIDER"])} />
                {/* Admin */}
                <Route path="/admin" element={guard(<AdminDashboard />, ["ADMIN"])} />
                <Route path="/admin/users" element={guard(<AdminUsers />, ["ADMIN"])} />
                <Route path="/admin/riders" element={guard(<AdminUsers fixedRole="RIDER" />, ["ADMIN"])} />
                <Route path="/admin/deliveries" element={guard(<AdminDeliveries />, ["ADMIN"])} />
                <Route path="/admin/deliveries/:id" element={guard(<AdminDeliveryDetails />, ["ADMIN"])} />
                <Route path="/admin/payments" element={guard(<AdminPayments />, ["ADMIN"])} />
                {/* Shared */}
                <Route path="/profile" element={guard(<Profile />)} />
                <Route path="/settings" element={guard(<Settings />)} />
                {Design && <Route path="/design" element={<Design />} />}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
