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

  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      setLoadingFeatured(true); // Set loading to true when fetching starts
      const token = await getToken();
      try {
        const response = await fetch(`${API_URL}/api/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Car[] = await response.json();
        // Sort by created_at in descending order to get the newest ones
        const newestVehicles = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        // Take the first 3 newest vehicles
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
      } catch (error) {
        console.error("Error fetching featured vehicles:", error);
        toast.error("Failed to load featured vehicles");
        // Optionally set a default empty array or some fallback data
        setFeaturedVehicles([]);
      } finally {
        setLoadingFeatured(false); // Set loading to false when fetching finishes
      }
    };

    fetchFeaturedVehicles();
  }, [getToken]);

  // Toggle favorite
  const toggleFavorite = async (carId: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to add favorites");
      return;
    }
    try {
      const isFavorite = favorites.includes(carId);
      const endpoint = isFavorite
        ? `/profiles/favorites/remove/${carId}/`
        : `/profiles/favorites/add/${carId}/`;
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
        throw new Error(
          `Failed to ${isFavorite ? "remove from" : "add to"} favorites`,
        );
      }
      // Update local state
      if (isFavorite) {
        setFavorites(favorites.filter((id) => id !== carId));
        toast.success("Removed from favorites");
      } else {
        setFavorites([...favorites, carId]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };
  // Toggle bookmark
  const toggleBookmark = async (carId: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to add bookmarks");
      return;
    }
    try {
      const isBookmarked = bookmarks.includes(carId);
      const endpoint = isBookmarked
        ? `/profiles/bookmarks/remove/${carId}/`
        : `/profiles/bookmarks/add/${carId}/`;
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
        throw new Error(
          `Failed to ${isBookmarked ? "remove from" : "add to"} bookmarks`,
        );
      }
      // Update local state
      if (isBookmarked) {
        setBookmarks(bookmarks.filter((id) => id !== carId));
        toast.success("Removed from bookmarks");
      } else {
        setBookmarks([...bookmarks, carId]);
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmarks");
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
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Galleries />
        </div>
      </div>
      <div
        ref={ref2}
        className={`transition-opacity ease-in duration-700 ${isVisible2 ? "opacity-100" : "opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-medium text-white mb-10">
            Featured Vehicles
          </h2>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <FeaturedSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <h3 className="text-xl font-medium text-white mb-2">
                      {vehicle.name}
                    </h3>
                    <p className="text-amber-300 mb-4">
                      Starting at ${vehicle.price.toLocaleString()}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-md">
                        <Zap className="size-4 text-amber-600 mb-1" />
                        <span className="text-xs text-zinc-500">Power</span>
                        <span className="text-sm font-medium text-white">
                          {vehicle.specs.power}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-md">
                        <Clock className="size-4 text-amber-600 mb-1" />
                        <span className="text-xs text-zinc-500">0-100</span>
                        <span className="text-sm font-medium text-white">
                          {vehicle.specs.acceleration}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-md">
                        <Gauge className="size-4 text-amber-600 mb-1" />
                        <span className="text-xs text-zinc-500">Top Speed</span>
                        <span className="text-sm font-medium text-white">
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
        <div className="bg-zinc-900 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-medium text-white mb-4">
                Why Choose Luxury Automotive
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Experience unparalleled luxury and performance with our
                exclusive collection of premium vehicles.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-zinc-900 border-zinc-800 transition-all duration-300 hover:border-amber-700">
                <CardContent className="pt-6">
                  <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Award className="size-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
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
                  <h3 className="text-xl font-medium text-white mb-2">
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
                  <h3 className="text-xl font-medium text-white mb-2">
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
