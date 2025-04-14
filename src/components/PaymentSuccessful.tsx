// PaymentComplete.tsx

import React, { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

const PaymentComplete: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.navigate({ to: "/" });
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100">
      <h1 className="text-3xl font-bold text-green-800 mb-4">
        Payment Successful!
      </h1>
      <p className="text-lg text-green-700">
        You will be redirected to the home page shortly.
      </p>
    </div>
  );
};

export default PaymentComplete;
