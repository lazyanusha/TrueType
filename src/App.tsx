import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Contact from "./pages/user/Contact";
import Home from "./pages/user/Home";
import { useEffect } from "react";
import RegistrationForm from "./pages/user/Register";
import Payments from "./pages/admin/Payments";
import Users from "./pages/admin/Users";
import Dashboard from "./pages/admin/Dashboard";
import Sidebar from "./components/publilc/Sidebar";
import AdminSettings from "./pages/admin/Settings";
import TestRecords from "./pages/admin/TestResult";
import UserSettingsPage from "./pages/user/UserSetting";
import LoginPage from "./pages/user/Login";
import Layout from "./components/publilc/Layout";
import Features from "./pages/user/Features";
import HowItWorks from "./pages/user/HowItWorks";
import Resources from "./pages/admin/Resources";
import SubscriptionPage from "./pages/user/Subscription";
import PaymentStatus from "./pages/user/paymentstatus";
import KhaltiPageWrapper from "./components/user_component/KhaltiPageWrapper";

function App() {
  useEffect(() => {
    // When component mounts (page reloads), scroll smoothly to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegistrationForm />} />
          <Route path="features" element={<Features />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="contact" element={<Contact />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="usersetting" element={<UserSettingsPage />} />
          <Route path="payment-status" element={<PaymentStatus />} />
          <Route path="/payment" element={<KhaltiPageWrapper />} />{" "}
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<Sidebar />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="payments" element={<Payments />} />
          <Route path="resources" element={<Resources />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="tests" element={<TestRecords />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
