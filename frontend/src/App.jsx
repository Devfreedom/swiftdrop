// Router: landing for guests, role-guarded sections for users.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth, roleHome } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { CenterLoad } from "./components/Feedback";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CreateDelivery from "./pages/customer/CreateDelivery";
import MyDeliveries from "./pages/customer/MyDeliveries";
import CustomerDeliveryDetails from "./pages/customer/CustomerDeliveryDetails";
import CustomerPayments from "./pages/customer/CustomerPayments";
import RiderDashboard from "./pages/rider/RiderDashboard";
import AvailableJobs from "./pages/rider/AvailableJobs";
import AssignedJobs from "./pages/rider/AssignedJobs";
import RiderDeliveryDetails from "./pages/rider/RiderDeliveryDetails";
import RiderHistory from "./pages/rider/RiderHistory";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDeliveries from "./pages/admin/AdminDeliveries";
import AdminDeliveryDetails from "./pages/admin/AdminDeliveryDetails";
import AdminPayments from "./pages/admin/AdminPayments";

function IndexRoute() {
  const { user, token, loading } = useAuth();
  if (loading) return <CenterLoad />;
  if (!token || !user) return <Landing />;
  return <Navigate to={roleHome(user.role)} replace />;
}

const guard = (el, roles) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              <Route path="*" element={<p>Page not found. <a href="/">Home</a></p>} />
            </Routes>
          </Layout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
