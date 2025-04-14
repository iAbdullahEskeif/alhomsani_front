"use client";

import { useEffect, useState } from "react";
import { Link, createFileRoute, useSearch } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { API_URL } from "../../config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

// Define the search params interface
interface PaymentSearchParams {
  payment_intent?: string;
  payment_intent_client_secret?: string;
}

// Define the order details interface
interface OrderDetails {
  success: boolean;
  order_id: string;
  amount: number;
  car_name?: string;
}

export default function PaymentConfirmation() {
  // Get the route params and search params
  const search = useSearch({ strict: false });
  const { getToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentIntentId = search.payment_intent;
        const paymentIntentClientSecret = search.payment_intent_client_secret;

        if (!paymentIntentId || !paymentIntentClientSecret) {
          setStatus("error");
          return;
        }

        const token = await getToken();
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
          throw new Error("Failed to verify payment");
        }

        const data = await response.json();
        setOrderDetails(data);
        setStatus("success");
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [search, getToken]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 text-zinc-700 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 shadow-md">
          <CardHeader className="text-center">
            <XCircle className="size-16 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-white text-xl">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-zinc-400 mb-6">
              We couldn't verify your payment. Please try again or contact
              customer support.
            </p>
            <div className="flex flex-col space-y-3">
              <Button asChild>
                <Link to="/">Return to Showroom</Link>
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-400"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 shadow-md">
        <CardHeader className="text-center">
          <CheckCircle className="size-16 text-emerald-500 mx-auto mb-2" />
          <CardTitle className="text-white text-xl">
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-zinc-400 mb-6">
            Thank you for your purchase! Your order has been confirmed.
          </p>

          {orderDetails && (
            <div className="bg-zinc-800 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-medium mb-2">Order Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Order ID:</span>
                  <span className="text-zinc-300">{orderDetails.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount:</span>
                  <span className="text-zinc-300">
                    ${orderDetails.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date:</span>
                  <span className="text-zinc-300">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Button asChild>
              <Link to="/">Return to Showroom</Link>
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-400"
              asChild
            >
              <Link to="/">View My Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Define the route with search params
export const Route = createFileRoute("/payment-confirmation/")({
  component: PaymentConfirmation,
  validateSearch: (search: Record<string, unknown>): PaymentSearchParams => {
    return {
      payment_intent: search.payment_intent as string | undefined,
      payment_intent_client_secret: search.payment_intent_client_secret as
        | string
        | undefined,
    };
  },
});
