import {
  Award,
  Shield,
  PenToolIcon as Tool,
  Zap,
  Gauge,
  Clock,
  Copyright,
  Heart,
  Bookmark,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import Banner from "../components/banner";
import Galleries from "../components/galleries";
import { useIsVisible } from "@/components/hooks/useisvisible";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { API_URL } from "../config";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Car {
  id: number;
  category: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  sku: string;
  created_at: string;
  updated_at: string;
  availability: "in_stock" | "out_of_stock" | "pre_order";
  car_type: string;
  image_url: string;
  image_public_id: string;
  key_features: string[];
  engine: string;
  power: string;
  torque: string;
  transmission: string;
  acceleration_0_100: string;
  top_speed: string;
  fuel_economy: string;
  dimensions: string;
  weight_kg: number;
  wheelbase_mm: number;
  fuel_tank_capacity: number;
  trunk_capacity_liters: number;
}

// Add this new interface for Profile at the top with the other interfaces
interface Profile {
  user: number;
  name: string;
  location: string;
  contact_info: string;
  bio: string;
  profile_picture: File | string | null | undefined;
  profile_picture_url: string;
  favorite_cars: number[];
  bookmarked_cars: number[];
  activity_log?: ActivityItem[]; // Make this optional
  member_since: string;
}

// Add this interface for ActivityItem
interface ActivityItem {
  id: number;
  action: string;
  timestamp: string;
  details: string;
}

function Index() {
  const images = ["pic1.jpg", "pic2.webp", "pic3.png"];
  const ref1 = useRef<HTMLDivElement>(null);
  const isVisible1 = useIsVisible(ref1);
  const ref2 = useRef<HTMLDivElement>(null);
  const isVisible2 = useIsVisible(ref2);
  const ref3 = useRef<HTMLDivElement>(null);
  const isVisible3 = useIsVisible(ref3);
  const { isSignedIn, getToken } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<
    {
      id: number;
      name: string;
      price: number;
      image: string;
      specs: {
        power: string;
        acceleration: string;
        topSpeed: string;
      };
    }[]
  >([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true); // State for loading

  // Modify the useEffect section to fetch both featured vehicles and profile data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingFeatured(true);
      const token = await getToken();

      try {
        // Fetch featured vehicles
        const vehiclesResponse = await fetch(`${API_URL}/api/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!vehiclesResponse.ok) {
          throw new Error(`HTTP error! status: ${vehiclesResponse.status}`);
        }

        const data: Car[] = await vehiclesResponse.json();
        const newestVehicles = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        const selectedVehicles = newestVehicles.slice(0, 3).map((car) => ({
          id: car.id,
          name: car.name,
          price: car.price,
          image: car.image_url || "/placeholder.svg",
          specs: {
            power: car.power,
            acceleration: car.acceleration_0_100,
            topSpeed: car.top_speed,
          },
        }));

        setFeaturedVehicles(selectedVehicles);

        // Only fetch profile if user is signed in
        if (isSignedIn) {
          // Fetch user profile to get favorites and bookmarks
          const profileResponse = await fetch(`${API_URL}/profiles/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (profileResponse.ok) {
            const profileData: Profile = await profileResponse.json();
            // Initialize favorites and bookmarks from profile data
            setFavorites(profileData.favorite_cars || []);
            setBookmarks(profileData.bookmarked_cars || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
        setFeaturedVehicles([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchData();
  }, [getToken, isSignedIn]);

  // Update the toggleFavorite function to handle the case where a car is already favorited
  const toggleFavorite = async (carId: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to add favorites");
      return;
    }

    const isFavorite = favorites.includes(carId);

    // Don't do anything if we're trying to add a favorite that's already there
    if (!isFavorite) {
      // Optimistically update UI
      setFavorites([...favorites, carId]);

      try {
        const endpoint = `/profiles/favorites/add/${carId}/`;
        const token = await getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ car_id: carId }),
        });

        if (!response.ok) {
          // Check if the error is because the car is already favorited
          const errorData = await response.json();
          if (errorData.detail && errorData.detail.includes("already")) {
            // The car is already favorited, so we can keep our optimistic update
            toast.info("This vehicle is already in your favorites");
            return;
          }
          throw new Error(`Failed to add to favorites`);
        }

        toast.success("Added to favorites");
      } catch (error) {
        console.error("Error adding favorite:", error);
        toast.error("Failed to update favorites");
        // Revert the optimistic update
        setFavorites(favorites.filter((id) => id !== carId));
      }
    } else {
      // Removing a favorite
      // Optimistically update UI
      setFavorites(favorites.filter((id) => id !== carId));

      try {
        const endpoint = `/profiles/favorites/remove/${carId}/`;
        const token = await getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ car_id: carId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to remove from favorites`);
        }

        toast.success("Removed from favorites");
      } catch (error) {
        console.error("Error removing favorite:", error);
        toast.error("Failed to update favorites");
        // Revert the optimistic update
        setFavorites([...favorites, carId]);
      }
    }
  };

  // Update the toggleBookmark function to handle the case where a car is already bookmarked
  const toggleBookmark = async (carId: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to add bookmarks");
      return;
    }

    const isBookmarked = bookmarks.includes(carId);

    // Don't do anything if we're trying to add a bookmark that's already there
    if (!isBookmarked) {
      // Optimistically update UI
      setBookmarks([...bookmarks, carId]);

      try {
        const endpoint = `/profiles/bookmarks/add/${carId}/`;
        const token = await getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ car_id: carId }),
        });

        if (!response.ok) {
          // Check if the error is because the car is already bookmarked
          const errorData = await response.json();
          if (errorData.detail && errorData.detail.includes("already")) {
            // The car is already bookmarked, so we can keep our optimistic update
            toast.info("This vehicle is already in your bookmarks");
            return;
          }
          throw new Error(`Failed to add to bookmarks`);
        }

        toast.success("Added to bookmarks");
      } catch (error) {
        console.error("Error adding bookmark:", error);
        toast.error("Failed to update bookmarks");
        // Revert the optimistic update
        setBookmarks(bookmarks.filter((id) => id !== carId));
      }
    } else {
      // Removing a bookmark
      // Optimistically update UI
      setBookmarks(bookmarks.filter((id) => id !== carId));

      try {
        const endpoint = `/profiles/bookmarks/remove/${carId}/`;
        const token = await getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ car_id: carId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to remove from bookmarks`);
        }

        toast.success("Removed from bookmarks");
      } catch (error) {
        console.error("Error removing bookmark:", error);
        toast.error("Failed to update bookmarks");
        // Revert the optimistic update
        setBookmarks([...bookmarks, carId]);
      }
    }
  };
  const FeaturedSkeleton = () => (
    <Card className="bg-zinc-900 border-zinc-800 shadow-md overflow-hidden">
      <div className="relative overflow-hidden">
        <Skeleton className="w-full h-48 rounded-none bg-zinc-800" />
        <div className="absolute top-2 right-2 flex gap-1">
          <Skeleton className="size-8 rounded-full bg-zinc-800" />
          <Skeleton className="size-8 rounded-full bg-zinc-800" />
        </div>
      </div>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2 bg-zinc-800" />
        <Skeleton className="h-4 w-1/2 mb-4 bg-zinc-800" />
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 bg-zinc-800 rounded-md" />
          ))}
        </div>
        <Skeleton className="w-full h-10 bg-zinc-800" />
      </CardContent>
    </Card>
  );
  return (
    <div className="min-h-screen bg-zinc-950">
      <div
        ref={ref1}
        className={`transition-opacity ease-in duration-700 ${isVisible1 ? "opacity-100" : "opacity-0"}`}
      >
        <Banner images={images} />
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-8 md:py-16">
          <Galleries />
        </div>
      </div>
      <div
        ref={ref2}
        className={`transition-opacity ease-in duration-700 ${isVisible2 ? "opacity-100" : "opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-medium text-amber-300 mb-10">
            Featured Vehicles
          </h2>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <FeaturedSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {featuredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="bg-zinc-900 border-zinc-800 shadow-md overflow-hidden transition-all duration-300 hover:border-amber-700"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={vehicle.image || "/placeholder.svg"}
                      alt={vehicle.name}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8 bg-zinc-900/80 hover:bg-zinc-800"
                        onClick={() => toggleFavorite(vehicle.id)}
                      >
                        <Heart
                          className={`size-4 ${
                            favorites.includes(vehicle.id)
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-400"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8 bg-zinc-900/80 hover:bg-zinc-800"
                        onClick={() => toggleBookmark(vehicle.id)}
                      >
                        <Bookmark
                          className={`size-4 ${
                            bookmarks.includes(vehicle.id)
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-400"
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-medium text-amber-100 mb-2">
                      {vehicle.name}
                    </h3>
                    <p className="text-amber-300 mb-4">
                      Starting at ${vehicle.price.toLocaleString()}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-md h-20 justify-between">
                        <Zap className="size-4 text-amber-600 mb-1" />
                        <span className="text-xs text-zinc-500">Power</span>
                        <span className="text-sm font-medium text-white text-center truncate w-full">
                          {vehicle.specs.power}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-md h-20 justify-between">
                        <Clock className="size-4 text-amber-600 mb-1" />
                        <span className="text-xs text-zinc-500">0-100</span>
                        <span className="text-sm font-medium text-white text-center truncate w-full">
                          {vehicle.specs.acceleration}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-md h-20 justify-between">
                        <Gauge className="size-4 text-amber-600 mb-1" />
                        <span className="text-xs text-zinc-500">Top Speed</span>
                        <span className="text-sm font-medium text-white text-center truncate w-full">
                          {vehicle.specs.topSpeed}
                        </span>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
                    >
                      <Link
                        to="/cars/$id"
                        params={{ id: vehicle.id.toString() }}
                      >
                        View Details{" "}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        ref={ref3}
        className={`transition-opacity ease-in duration-700 ${isVisible3 ? "opacity-100" : "opacity-0"}`}
      >
        <div className="bg-zinc-900 py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-3 md:px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-medium text-amber-300 mb-3">
                Why Choose Luxury Automotive
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Experience unparalleled luxury and performance with our
                exclusive collection of premium vehicles.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              <Card className="bg-zinc-900 border-zinc-800 transition-all duration-300 hover:border-amber-700">
                <CardContent className="pt-6">
                  <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Award className="size-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-medium text-amber-100 mb-2">
                    Premium Selection
                  </h3>
                  <p className="text-zinc-400">
                    Our vehicles are hand-selected from the world's most
                    prestigious manufacturers to ensure exceptional quality.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800 transition-all duration-300 hover:border-amber-700">
                <CardContent className="pt-6">
                  <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Tool className="size-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-medium text-amber-100 mb-2">
                    Expert Maintenance
                  </h3>
                  <p className="text-zinc-400">
                    Our certified technicians provide comprehensive maintenance
                    services to keep your vehicle in peak condition.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800 transition-all duration-300 hover:border-amber-700">
                <CardContent className="pt-6">
                  <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Shield className="size-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-medium text-amber-100 mb-2">
                    Extended Warranty
                  </h3>
                  <p className="text-zinc-400">
                    Drive with confidence knowing your investment is protected
                    by our comprehensive warranty program.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Separator className="bg-zinc-800" />
      <footer className="w-full bg-zinc-950 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-amber-800/70 text-sm">
            <p className="flex justify-center items-center gap-1">
              <Copyright className="size-4" />
              <span>
                {new Date().getFullYear()} Luxury Automotive. All rights
                reserved.
              </span>
            </p>
            <p className="mt-2">
              Engineered for those who drive the extraordinary.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export const Route = createFileRoute("/")({
  component: Index,
});
