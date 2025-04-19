import { Product } from "@/types/interfaces";
export const fetchCars = async (carIds: number[], getToken: () => Promise<string | null>, API_URL: string): Promise<Product[]> => {
    try {
        if (!carIds.length) return [];

        const token = await getToken();
        const response = await fetch(`${API_URL}/api/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch cars");
        }

        const allCars: Product[] = await response.json();
        // Filter cars to only include those in the provided IDs
        return allCars.filter((car) => carIds.includes(car.id));
    } catch (error) {
        console.error("Error fetching cars:", error);
        throw error;
    }
};


