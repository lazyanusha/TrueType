import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";

// Lazy Public Pages
const Home = lazy(() => import("./pages/user/Home"));
const Contact = lazy(() => import("./pages/user/Contact"));
const LoginPage = lazy(() => import("./pages/user/Login"));
const RegistrationForm = lazy(() => import("./pages/user/Register"));
const Features = lazy(() => import("./pages/user/Features"));
const HowItWorks = lazy(() => import("./pages/user/HowItWorks"));

// Lazy Protected User Pages
const SubscriptionPage = lazy(() => import("./pages/user/Subscription"));
const UserSettingsPage = lazy(() => import("./pages/user/UserSetting"));
const PaymentStatus = lazy(() => import("./pages/user/payment-status"));
const NotificationTab = lazy(
	() => import("./components/tabs/users/NotificationTab")
);

// Lazy Admin Pages
const Payments = lazy(() => import("./pages/admin/Payments"));
const Users = lazy(() => import("./pages/admin/Users"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Sidebar = lazy(() => import("./components/public/Sidebar"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const TestRecords = lazy(() => import("./pages/admin/TestResult"));
const Resources = lazy(() => import("./pages/admin/Resources"));
const UserDetails = lazy(
	() => import("./components/admin_components/UserDetails")
);

// Shared Layout & Routes
import Layout from "./components/public/Layout";
import ProtectedRoute from "./components/public/protected_routes";
import AdminRoute from "./components/public/admin_routes";
import Spinner from "./components/spinner";

function App() {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	return (
		<Router>
			<Suspense fallback={<Spinner />}>
				<Routes>
					{/* Public layout */}
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						<Route path="login" element={<LoginPage />} />
						<Route path="register" element={<RegistrationForm />} />
						<Route path="features" element={<Features />} />
						<Route path="how-it-works" element={<HowItWorks />} />
						<Route path="contact" element={<Contact />} />

						{/* Protected user routes */}
						<Route element={<ProtectedRoute />}>
							<Route path="subscription" element={<SubscriptionPage />} />
							<Route path="usersetting" element={<UserSettingsPage />} />
							<Route path="payment-status" element={<PaymentStatus />} />
							<Route path="notifications" element={<NotificationTab />} />
						</Route>
					</Route>

					{/* Admin routes */}
					<Route path="/admin" element={<AdminRoute />}>
						<Route path="/admin" element={<Sidebar />}>
							<Route index element={<Dashboard />} />
							<Route path="users" element={<Users />} />
							<Route path="users/:id" element={<UserDetails />} />
							<Route path="payments" element={<Payments />} />
							<Route path="resources" element={<Resources />} />
							<Route path="settings" element={<AdminSettings />} />
							<Route path="tests" element={<TestRecords />} />
						</Route>
					</Route>
				</Routes>
			</Suspense>
		</Router>
	);
}

export default App;
