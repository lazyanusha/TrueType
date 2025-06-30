import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../auth/auth_context";
const AdminRoute = () => {
	const { user, loading } = useContext(AuthContext);

	if (loading)
		return <div className="text-center p-8">Checking authentication...</div>;

	if (!user) return <Navigate to="/login" replace />;
	if (user.roles?.toLowerCase() !== "admin") return <Navigate to="/" replace />;

	return <Outlet />;
};

export default AdminRoute;
