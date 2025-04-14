// src/routes/profile/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/profile/")({
  component: ProfileIndexRedirect,
});

function ProfileIndexRedirect() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && user?.username) {
      navigate({
        to: "/profile/$username",
        params: { username: user.username },
      });
    }
  }, [isLoaded, user, navigate]);

  return <p>Redirecting to your profile...</p>;
}
