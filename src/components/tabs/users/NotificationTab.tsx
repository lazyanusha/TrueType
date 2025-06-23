import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

type Notification = {
	id: number;
	user_id: number;
	message: string;
	created_at: string;
	read: boolean;
};

type OutletContextType = {
	refetchUnreadCount: () => void;
};

const Notifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const { refetchUnreadCount } = useOutletContext<OutletContextType>();

	const fetchNotifications = async () => {
		const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
		if (!token) return;

		try {
			const res = await fetch("http://localhost:8000/notifications", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await res.json();
			const mapped = data.map((item: any) => ({
				...item,
				read: item.is_read ?? false,
			}));
			setNotifications(mapped);
		} catch (err) {
			console.error("Failed to fetch notifications", err);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, []);

	const markAsRead = async (id: number) => {
		const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
		if (!token) return;

		try {
			const res = await fetch("http://localhost:8000/notifications/mark_read", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ notification_id: id }),
			});

			if (res.ok) {
				setNotifications((prev) =>
					prev.map((note) => (note.id === id ? { ...note, read: true } : note))
				);
				refetchUnreadCount(); // ✅ update red dot
			}
		} catch (err) {
			console.error("Error marking notification as read", err);
		}
	};

	return (
		<div className="py-10 max-w-5xl mx-auto">
			<h2 className="text-xl font-semibold mb-4">Notifications</h2>
			{notifications.length === 0 ? (
				<p>No notifications yet.</p>
			) : (
				<ul className="space-y-4">
					{notifications.map((note) => (
						<li
							key={note.id}
							className={`relative p-4 rounded border ${
								note.read
									? "bg-gray-100 border-gray-300 text-gray-600"
									: "bg-white border-indigo-500 font-semibold text-gray-900"
							} flex items-center`}
						>
							<div className="flex-grow">
								<p>{note.message}</p>
								<small className="text-gray-500">
									{new Date(note.created_at).toLocaleString()}
								</small>
							</div>

							{!note.read && (
								<button
									onClick={() => markAsRead(note.id)}
									aria-label="Mark as read"
									className="ml-4 p-1 hover:text-indigo-700 focus:outline-none"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="#5a4fcf"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								</button>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Notifications;
