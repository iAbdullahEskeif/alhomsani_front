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
        if (isLoaded && user?.username) {
            navigate({
                to: "/profile/stalk/$id",
                params: { id: user.username },
            });
        }
    }, [isLoaded, user, navigate]);

    return <p>Redirecting to your profile...</p>;
}
