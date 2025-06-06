export const verifyPaymentStatus = async (paymentId: string) => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    alert("Please log in to continue.");
    return;
  }

  const response = await fetch(`http://localhost:8000/payments/verify?payment_id=${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to verify payment status");
  }

  const data = await response.json();
  if (data.status === "Completed") {
    // Payment is successful, now wait for the payment to be confirmed
    await confirmPaymentStatus(paymentId);
  } else {
    // Payment failed, handle the error
    alert("Payment failed. Please try again.");
  }
};

const confirmPaymentStatus = async (paymentId: string) => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    alert("Please log in to continue.");
    return;
  }

  const response = await fetch(`http://localhost:8000/payments/confirm?payment_id=${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to confirm payment status");
  }

  const data = await response.json();
  if (data.status === "Confirmed") {
    // Payment is confirmed, now redirect the user to the Khalti payment page
    window.location.href = `/khalti-payment/${paymentId}`;
  } else {
    // Payment failed to be confirmed, handle the error
    alert("Payment failed to be confirmed. Please try again.");
  }
};