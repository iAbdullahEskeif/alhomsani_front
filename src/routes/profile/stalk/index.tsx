
// src/routes/profile/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/profile/stalk/")({
    component: StalkIndexRedirect,
});

function StalkIndexRedirect() {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && user?.id) {
            navigate({
                to: "/profile/stalk/$id",
                params: { id: user.id },
            });
        }
    }, [isLoaded, user, navigate]);

    return <p>Redirecting to your profile...</p>;
}
