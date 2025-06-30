import { useState, useEffect, useRef, useContext } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { AuthContext } from "../../auth/auth_context";

const Layout = () => {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [hasUnread, setHasUnread] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const { user, setUser } = useContext(AuthContext);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Fetch unread notification count
	const fetchUnreadStatus = async () => {
		if (!user) return;
		try {
			const token =
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token");
			if (!token) return;

			const res = await fetch(
				"http://localhost:8000/notifications/unread_count",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (res.ok) {
				const data = await res.json();
				setHasUnread(data.unread_count > 0);
			} else {
				setHasUnread(false);
			}
		} catch (error) {
			console.error("Failed to fetch unread notification status:", error);
			setHasUnread(false);
		}
	};

	useEffect(() => {
		fetchUnreadStatus();
		const interval = setInterval(fetchUnreadStatus, 60000); // Poll every 60s
		return () => clearInterval(interval);
	}, [user]);

	const handleLogout = async () => {
		if (!window.confirm("Are you sure you want to log out?")) return;

		const token =
			localStorage.getItem("access_token") ||
			sessionStorage.getItem("access_token");
		if (!token) return;

		try {
			const res = await fetch("http://localhost:8000/users/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (res.ok) {
				localStorage.clear();
				sessionStorage.clear();
				setUser(null);
				navigate("/");
			} else {
				const error = await res.json();
				console.error("Failed to logout:", error);
			}
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-[#f0f9ff] text-gray-800">
			<nav className="bg-white shadow-sm border-b py-2 border-gray-200">
				<div className="max-w-7xl mx-auto sm:pr-4 lg:pr-4">
					<div className="flex justify-between items-center h-20">
						<Link
							to="/"
							className="flex items-center text-blue-600 hover:text-blue-500 transition"
						>
							<img src="logo.png" alt="TrueType Logo" className="h-19 w-auto" />
						</Link>

						<div className="hidden md:flex space-x-12 text-lg font-medium">
							{[
								{ to: "/", label: "Home" },
								{ to: "/features", label: "Features" },
								{ to: "/how-it-works", label: "How It Works" },
								{ to: "/contact", label: "Contact" },
							].map(({ to, label }) => (
								<Link
									key={to}
									to={to}
									className="relative text-gray-700 hover:text-blue-600 transition-colors duration-300"
								>
									{label}
									<span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-600 scale-x-0 origin-left transition-transform duration-300 hover:scale-x-100" />
								</Link>
							))}
						</div>

						<div className="hidden md:flex space-x-8 text-lg font-medium relative">
							{user && user.roles?.toLowerCase() !== "admin" ? (
								<div
									ref={dropdownRef}
									className="relative flex items-center space-x-4"
								>
									<Link
										to="/notifications"
										title="Notifications"
										className="relative text-gray-700 hover:text-blue-600"
										onClick={() => setDropdownOpen(false)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
											/>
										</svg>
										{hasUnread && (
											<span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
										)}
									</Link>

									<button
										onClick={() => setDropdownOpen(!dropdownOpen)}
										className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
									>
										<span>{user.email}</span>
										<svg
											className={`w-4 h-4 transform transition-transform duration-200 ${
												dropdownOpen ? "rotate-180" : ""
											}`}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</button>

									{dropdownOpen && (
										<div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-10">
											<Link
												to="/usersetting"
												onClick={() => setDropdownOpen(false)}
												className="block px-4 py-2 text-gray-700 hover:bg-blue-600 hover:text-white"
											>
												Settings
											</Link>
											<Link
												to="/subscription"
												onClick={() => setDropdownOpen(false)}
												className="block px-4 py-2 text-gray-700 hover:bg-blue-600 hover:text-white"
											>
												Payment
											</Link>
											<button
												onClick={handleLogout}
												className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-600 hover:text-white"
											>
												Logout
											</button>
										</div>
									)}
								</div>
							) : (
								<>
									<Link
										to="/login"
										className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
									>
										Log In
									</Link>
									<Link
										to="/register"
										className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
									>
										Register
									</Link>
								</>
							)}
						</div>

						<button
							onClick={() => setMenuOpen(!isMenuOpen)}
							className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
							aria-label="Toggle menu"
						>
							<svg
								className="w-8 h-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								{isMenuOpen ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								)}
							</svg>
						</button>
					</div>
				</div>

				{isMenuOpen && (
					<div className="md:hidden bg-white border-t border-gray-200">
						<nav className="flex flex-col space-y-3 p-4 text-gray-700 font-semibold">
							{[
								{ to: "/", label: "Home" },
								{ to: "/features", label: "Features" },
								{ to: "/how-it-works", label: "How It Works" },
								{ to: "/contact", label: "Contact" },
								...(user && user.roles?.toLowerCase() !== "admin"
									? [{ to: "/usersetting", label: "Settings" }]
									: [
											{ to: "/login", label: "Log In" },
											{ to: "/register", label: "Register" },
									  ]),
							].map(({ to, label }) => (
								<Link
									key={to}
									to={to}
									className="hover:text-blue-600 transition-colors duration-200"
									onClick={() => setMenuOpen(false)}
								>
									{label}
								</Link>
							))}
							{user && (
								<button
									onClick={handleLogout}
									className="text-left hover:text-blue-600 transition-colors duration-200"
								>
									Logout
								</button>
							)}
						</nav>
					</div>
				)}
			</nav>

			{/* Main */}
			<main className="flex-grow">
				<Outlet context={{ refetchUnreadCount: fetchUnreadStatus }} />
			</main>

			<Footer />
		</div>
	);
};

export default Layout;
