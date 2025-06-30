import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../auth/auth_context";

const ProtectedRoute = () => {
	const { user, loading } = useContext(AuthContext);

	if (loading) {
		return <div className="text-center p-8">Checking authentication...</div>;
	}

	return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
