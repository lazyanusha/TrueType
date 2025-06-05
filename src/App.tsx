import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Contact from "./user/pages/Contact";
import Home from "./user/pages/Home";
import HowItWorks from "./user/pages/HowItWorks";
import Features from "./user/pages/Features";
import Layout from "./user/components/Layout";
import { useEffect } from "react";
import RegistrationForm from "./user/pages/Register";
import PaymentPage from "./user/pages/Payment";
import Resources from "./admin/pages/Resources";
import Payments from "./admin/pages/Payments";
import Users from "./admin/pages/Users";
import Dashboard from "./admin/pages/Dashboard";
import Sidebar from "./admin/components/Sidebar";
import AdminSettings from "./admin/pages/Settings";
import TestRecords from "./admin/pages/TestResult";
import UserSettingsPage from "./user/pages/UserSetting";
import LoginPage from "./user/pages/Login";


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
          <Route path="payment" element={<PaymentPage />} />
          <Route path="usersetting" element={<UserSettingsPage/>} />
          
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<Sidebar />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="payments" element={<Payments />} />
          <Route path="resources" element={<Resources />} />
          <Route path="settings" element= {<AdminSettings/>} />
          <Route path="tests" element={<TestRecords/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
