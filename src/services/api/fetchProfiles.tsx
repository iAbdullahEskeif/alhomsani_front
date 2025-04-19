import { Profile } from "@/types/interfaces";

export const fetchProfile = async (getToken: () => Promise<string | null>, API_URL: string): Promise<Profile> => {
    const token = await getToken();
    const response = await fetch(`${API_URL}/profiles/`, { // Ensure this endpoint is correct
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }

    return (await response.json()) as Profile;
};

