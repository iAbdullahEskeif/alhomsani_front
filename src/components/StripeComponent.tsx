import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { API_URL } from "../config";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Types
interface StripeComponentProps {
  carId: number;
  quantity: number;
}

interface PaymentIntentResponse {
  client_secret: string;
}

// API function
const createPaymentIntent = async (
  token: string,
  carId: number,
  quantity: number,
): Promise<PaymentIntentResponse> => {
  const response = await fetch(`${API_URL}/payment/intent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cart: [{ id: carId, quantity }],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment intent");
  }

  return response.json();
};

// Main StripeComponent
export default function StripeComponent({
  carId,
  quantity,
}: StripeComponentProps) {
  const { getToken } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fix for scroll issue - ensure body can scroll when component mounts
  useEffect(() => {
    // No need to modify body overflow here - we'll handle it in the Dialog component
    return () => {
      // Cleanup function is empty as we're not changing anything
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const token: string | null = await getToken();
      if (!token) {
        throw new Error("Authentication failed. Please log in again.");
      }
      return createPaymentIntent(token, carId, quantity);
    },
    onSuccess: (data) => {
      setClientSecret(data.client_secret);
    },
    onError: (err) => {
      console.error("Payment intent error:", err);
      setError("Failed to initialize payment. Please try again.");
    },
  });

  useEffect(() => {
    if (carId && quantity) {
      mutation.mutate();
    }
  }, [carId, quantity, mutation]);

  if (mutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  if (error || mutation.isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error ?? "An error occurred."}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6 text-center text-zinc-200">
        Complete Your Purchase
      </h2>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#3f3f46", // zinc-700
              colorBackground: "#18181b", // zinc-900
              colorText: "#e4e4e7", // zinc-200
              colorDanger: "#ef4444", // red-500
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              borderRadius: "0.375rem", // rounded-md
              spacingUnit: "4px",
            },
            rules: {
              ".Input": {
                border: "1px solid #27272a", // zinc-800
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // shadow-sm
                color: "#e4e4e7", // zinc-200
                backgroundColor: "#27272a", // zinc-800
              },
              ".Input:focus": {
                border: "1px solid #3f3f46", // zinc-700
                boxShadow: "0 0 0 1px rgba(63, 63, 70, 0.5)", // Focus ring
              },
              ".Label": {
                fontWeight: "500",
                fontSize: "0.875rem",
                color: "#a1a1aa", // zinc-400
              },
              ".Tab": {
                border: "1px solid #27272a", // zinc-800
                backgroundColor: "#18181b", // zinc-900
              },
              ".Tab:hover": {
                color: "#e4e4e7", // zinc-200
              },
              ".Tab--selected": {
                borderColor: "#3f3f46", // zinc-700
                color: "#e4e4e7", // zinc-200
              },
              ".CheckboxInput": {
                backgroundColor: "#27272a", // zinc-800
                borderColor: "#3f3f46", // zinc-700
              },
              ".CheckboxLabel": {
                color: "#a1a1aa", // zinc-400
              },
            },
          },
        }}
      >
        <CheckoutForm />
      </Elements>
    </div>
  );
}

// Checkout form component
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation/`,
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentError(error.message ?? "Payment failed. Please try again.");
      } else if (paymentIntent?.status === "succeeded") {
        setPaymentSuccess(true);
      } else {
        setPaymentError("Payment failed. Please try again.");
      }
    } catch (err) {
      setPaymentError(`An unexpected error occurred. ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center p-6">
        <div className="mb-4 text-green-500">✅ Payment Successful!</div>
        <p className="text-zinc-400 mb-4">
          Thank you for your purchase. Your order has been processed
          successfully.
        </p>
        <Button onClick={() => (window.location.href = "/")}>
          Return to Showroom
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Card Details
        </label>
        <PaymentElement />
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Shipping Address
        </label>
        <AddressElement
          options={{
            mode: "shipping",
          }}
        />
      </div>

      {paymentError && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-md">
          <p className="text-red-400 text-sm">{paymentError}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
}
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { API_URL } from "../config";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Types
interface StripeComponentProps {
  carId: number;
  quantity: number;
}

interface PaymentIntentResponse {
  client_secret: string;
}

// API function
const createPaymentIntent = async (
  token: string,
  carId: number,
  quantity: number,
): Promise<PaymentIntentResponse> => {
  const response = await fetch(`${API_URL}/payment/intent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cart: [{ id: carId, quantity }],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment intent");
  }

  return response.json();
};

// Main StripeComponent
export default function StripeComponent({
  carId,
  quantity,
}: StripeComponentProps) {
  const { getToken } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fix for scroll issue - ensure body can scroll when component mounts
  useEffect(() => {
    // No need to modify body overflow here - we'll handle it in the Dialog component
    return () => {
      // Cleanup function is empty as we're not changing anything
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const token: string | null = await getToken();
      if (!token) {
        throw new Error("Authentication failed. Please log in again.");
      }
      return createPaymentIntent(token, carId, quantity);
    },
    onSuccess: (data) => {
      setClientSecret(data.client_secret);
    },
    onError: (err) => {
      console.error("Payment intent error:", err);
      setError("Failed to initialize payment. Please try again.");
    },
  });

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const token: string | null = await getToken();
        if (!token) {
          throw new Error("Authentication failed. Please log in again.");
        }
        const data = await createPaymentIntent(token, carId, quantity);
        setClientSecret(data.client_secret);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError("Failed to initialize payment. Please try again.");
      }
    };

    if (carId && quantity) {
      fetchClientSecret();
    }
  }, [carId, quantity, getToken]);

  if (mutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  if (error || mutation.isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error ?? "An error occurred."}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6 text-center text-zinc-200">
        Complete Your Purchase
      </h2>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#3f3f46", // zinc-700
              colorBackground: "#18181b", // zinc-900
              colorText: "#e4e4e7", // zinc-200
              colorDanger: "#ef4444", // red-500
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              borderRadius: "0.375rem", // rounded-md
              spacingUnit: "4px",
            },
            rules: {
              ".Input": {
                border: "1px solid #27272a", // zinc-800
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // shadow-sm
                color: "#e4e4e7", // zinc-200
                backgroundColor: "#27272a", // zinc-800
              },
              ".Input:focus": {
                border: "1px solid #3f3f46", // zinc-700
                boxShadow: "0 0 0 1px rgba(63, 63, 70, 0.5)", // Focus ring
              },
              ".Label": {
                fontWeight: "500",
                fontSize: "0.875rem",
                color: "#a1a1aa", // zinc-400
              },
              ".Tab": {
                border: "1px solid #27272a", // zinc-800
                backgroundColor: "#18181b", // zinc-900
              },
              ".Tab:hover": {
                color: "#e4e4e7", // zinc-200
              },
              ".Tab--selected": {
                borderColor: "#3f3f46", // zinc-700
                color: "#e4e4e7", // zinc-200
              },
              ".CheckboxInput": {
                backgroundColor: "#27272a", // zinc-800
                borderColor: "#3f3f46", // zinc-700
              },
              ".CheckboxLabel": {
                color: "#a1a1aa", // zinc-400
              },
            },
          },
        }}
      >
        <CheckoutForm />
      </Elements>
    </div>
  );
}

// Checkout form component
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation/`,
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentError(error.message ?? "Payment failed. Please try again.");
      } else if (paymentIntent?.status === "succeeded") {
        setPaymentSuccess(true);
      } else {
        setPaymentError("Payment failed. Please try again.");
      }
    } catch (err) {
      setPaymentError(`An unexpected error occurred. ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center p-6">
        <div className="mb-4 text-green-500">✅ Payment Successful!</div>
        <p className="text-zinc-400 mb-4">
          Thank you for your purchase. Your order has been processed
          successfully.
        </p>
        <Button onClick={() => (window.location.href = "/")}>
          Return to Showroom
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Card Details
        </label>
        <PaymentElement />
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Shipping Address
        </label>
        <AddressElement
          options={{
            mode: "shipping",
          }}
        />
      </div>

      {paymentError && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-md">
          <p className="text-red-400 text-sm">{paymentError}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
}
