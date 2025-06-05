import { useContext } from "react";
import { AuthContext } from "../auth/auth_context";

export const useAuth = () => {
  return useContext(AuthContext);
};
