import { API_URL } from "@/config";
import { OrderDetails } from "@/types/interfaces";

export const verifyPayment = async (
    paymentIntentId: string,
    paymentIntentClientSecret: string,
    token: string | null | undefined,
): Promise<{ data: OrderDetails }> => {
    const response = await fetch(`${API_URL}/payment/verify/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            payment_intent_client_secret: paymentIntentClientSecret,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || "Failed to verify payment");
    }

    return response.json() as Promise<{ data: OrderDetails }>;
};
