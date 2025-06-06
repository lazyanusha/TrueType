import { useLocation, useNavigate } from "react-router-dom";
import KhaltiPage from "../../pages/user/KhaltipaymentPage";

export default function KhaltiPageWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state?.user || !state?.planName || !state?.amount) {
    navigate("/subscription");
    return null;
  }

  return (
    <KhaltiPage
      user={state.user}
      planName={state.planName}
      amount={state.amount}
      onSuccessCallback={() =>
        navigate("/subscription", { state: { paymentSuccess: true } })
      }
    />
  );
}
