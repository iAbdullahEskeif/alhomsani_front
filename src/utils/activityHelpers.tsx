import {
    ShoppingCart,
    Eye,
    Bookmark,
    Heart,
    Clock,
} from "lucide-react";

export const getCarNameFromActivity = (
    carId: number,
    carNames: { [carId: number]: string }
): string => carNames[carId] || `Car ID: ${carId} (Loading...)`;

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getActionIcon = (action: string) => {
    switch (action) {
        case "purchase":
            return <ShoppingCart className="size-4 text-emerald-500" />;
        case "view":
            return <Eye className="size-4 text-amber-500" />;
        case "bookmark":
            return <Bookmark className="size-4 text-amber-500" />;
        case "favorite":
            return <Heart className="size-4 text-amber-500" />;
        default:
            return <Clock className="size-4 text-amber-500" />;
    }
};

export const getActionText = (action: string): string => {
    switch (action) {
        case "purchase":
            return "Purchased a car";
        case "view":
            return "Viewed a car";
        case "bookmark":
            return "Bookmarked a car";
        case "favorite":
            return "Favorited a car";
        default:
            return "Interacted with a car";
    }
};
