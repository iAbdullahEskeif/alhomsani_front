"se client";

import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { API_URL } from "../../config";
import StripeComponent from "../../components/StripeComponent.tsx";
import {
  Check,
  ShieldCheck,
  Fuel,
  Gauge,
  Calendar,
  Clock,
  ArrowLeft,
  Zap,
  Key,
  Loader2,
  MessageSquare,
  Send,
  Heart,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format, formatDistanceToNow } from "date-fns";

interface CarType {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  sku: string;
  category: number;
  availability: "in_stock" | "out_of_stock";
  car_type: "classic" | "luxury" | "electrical";
  image_url: string;
  created_at: string;
  updated_at: string;
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

interface Review {
  id: number;
  reviewer: string;
  car: number;
  review: string;
  time_written: string;
}

interface SimilarCar {
  id: number;
  name: string;
  price: string;
  image_url: string;
  car_type: string;
}

function ProductDetail() {
  const { id } = useParams({ from: "/cars/$id" });
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<CarType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [similarCars, setSimilarCars] = useState<SimilarCar[]>([]);
  const reviewTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Replace the above removed code with this simplified version
  const { isSignedIn, getToken } = useAuth();

  // Check if car is in favorites/bookmarks on component mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isSignedIn) return;

      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/profiles/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const profile = await response.json();
        setIsFavorite(profile.favorite_cars.includes(Number(id)));
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkSavedStatus();
  }, [isSignedIn, getToken, id]);

  const handleBuyNowClick = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to make a purchase");
      return;
    }
    setShowStripeModal(true);
  };

  // Fetch car data from API
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const response = await fetch(`${API_URL}/api/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch car details");
        }

        const data = await response.json();
        setProduct(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching car details:", error);
        setError("Failed to load car details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCarData();
    }
  }, [id, getToken]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/api/${id}/reviews/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
      }
    };

    if (id && isSignedIn) {
      fetchReviews();
    }
  }, [id, isSignedIn, getToken]);

  // Fetch similar cars
  useEffect(() => {
    const fetchSimilarCars = async () => {
      if (!product) return;

      try {
        const token = await getToken();
        const response = await fetch(
          `${API_URL}/api/filtered/?car_type=${product.car_type}&limit=3`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch similar cars");
        }

        const data = await response.json();
        // Filter out the current car
        const filteredCars = data
          .filter((car: SimilarCar) => car.id !== Number(id))
          .slice(0, 3);
        setSimilarCars(filteredCars);
      } catch (error) {
        console.error("Error fetching similar cars:", error);
      }
    };

    if (product) {
      fetchSimilarCars();
    }
  }, [product, id, getToken]);

  // Format price
  const formatPrice = (price: string): string => {
    return Number.parseFloat(price).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to add favorites");
      return;
    }

    try {
      const endpoint = isFavorite
        ? `/profiles/favorites/remove/${id}/`
        : `/profiles/favorites/add/${id}/`;

      const token = await getToken();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ car_id: Number(id) }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isFavorite ? "remove from" : "add to"} favorites`,
        );
      }

      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites",
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  // Upda the handleSubmitReview function to use the actual username from Clerk
  const handleSubmitReview = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (!newReview.trim()) {
      toast.error("Please enter a review");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const token = await getToken();
      // Get the user's actual name from Clerk
      const response = await fetch(`${API_URL}/api/${id}/reviews/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Include the actual username in the request
        body: JSON.stringify({
          review: newReview,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // Fetch updated reviews
      const updatedReviewsResponse = await fetch(
        `${API_URL}/api/${id}/reviews/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!updatedReviewsResponse.ok) {
        throw new Error("Failed to fetch updated reviews");
      }

      const updatedReviews = await updatedReviewsResponse.json();
      setReviews(updatedReviews);

      setNewReview("");
      setShowReviewModal(false);
      toast.success("Review submitted successfully");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatReviewDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();

      // If less than 30 days ago, show relative time
      if (now.getTime() - date.getTime() < 30 * 24 * 60 * 60 * 1000) {
        return formatDistanceToNow(date, { addSuffix: true });
      }

      // Otherwise show formatted date
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return `Unknown date with error: ${e}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 text-zinc-700 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Car Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 mb-4">
              {error || "We couldn't find the car you're looking for."}
            </p>
            <Button
              asChild
              variant="secondary"
              className="w-full bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700"
            >
              <Link to="/">Return to Showroom</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate total price with fees
  const basePrice = Number.parseFloat(product.price);
  const destinationFee = 1095;
  const taxAndTitle = Math.round(basePrice * 0.09); // Approximately 9% for tax and title
  const totalPrice = basePrice + destinationFee + taxAndTitle;

  return (
    <div className="bg-zinc-950">
      <div className="w-full max-w-7xl mx-auto p-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center text-zinc-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="mr-1 size-4" />
          Back to Showroom
        </Link>
      </div>

      <div className="w-full max-w-7xl mx-auto p-4">
        <Card className="bg-zinc-900 border-zinc-800 shadow-md overflow-hidden">
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-white mb-8 md:mb-0 z-10">
              <Badge className="mb-4 bg-amber-900/60 text-amber-200 hover:bg-amber-800">
                {product.car_type.toUpperCase()} CAR
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 text-white">
                {product.name}
              </h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center text-amber-400 mr-3">
                  <Heart
                    className={`size-5 mr-1 ${isFavorite ? "fill-amber-400" : ""}`}
                  />
                  <span>
                    {/* {likeCount} {likeCount === 1 ? "person likes" : "people like"} this */}
                  </span>
                </div>
              </div>
              <p className="text-zinc-400 text-lg mb-6 border-l-4 border-amber-700/70 pl-4">
                {product.description}
              </p>
              <div className="flex items-center">
                <span className="text-3xl md:text-4xl font-medium text-white">
                  {formatPrice(product.price)}
                </span>
                <span className="ml-2 text-zinc-500">plus taxes & fees</span>
              </div>

              <div className="flex gap-4 mt-6">
                <div className="flex items-center text-zinc-400">
                  <Zap className="size-5 text-amber-500 mr-2" />
                  <span>
                    {product.power ? product.power.split(" ")[0] : "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-zinc-400">
                  <Clock className="size-5 text-amber-500 mr-2" />
                  <span>
                    {product.acceleration_0_100
                      ? product.acceleration_0_100.split(" ")[0]
                      : "N/A"}
                    s
                  </span>
                </div>
                <div className="flex items-center text-zinc-400">
                  <Gauge className="size-5 text-amber-500 mr-2" />
                  <span>{product.top_speed || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center z-10">
              <div className="relative transition-transform duration-500 hover:scale-105">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full max-w-md rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=400&width=600&text=No+Image";
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-zinc-900 border-zinc-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-medium text-white">
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 bg-zinc-800 rounded-lg">
                  <Gauge className="size-8 text-amber-500 mb-2" />
                  <span className="text-sm text-zinc-500">Power</span>
                  <span className="font-medium text-white">
                    {product.power ? product.power.split(" ")[0] : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-zinc-800 rounded-lg">
                  <Clock className="size-8 text-amber-500 mb-2" />
                  <span className="text-sm text-zinc-500">0-100 km/h</span>
                  <span className="font-medium text-white">
                    {product.acceleration_0_100
                      ? product.acceleration_0_100
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-zinc-800 rounded-lg">
                  <Fuel className="size-8 text-amber-500 mb-2" />
                  <span className="text-sm text-zinc-500">Fuel Economy</span>
                  <span className="font-medium text-white">
                    {product.fuel_economy ? product.fuel_economy : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-zinc-800 rounded-lg">
                  <Calendar className="size-8 text-amber-500 mb-2" />
                  <span className="text-sm text-zinc-500">Year</span>
                  <span className="font-medium text-white">
                    {new Date(product.created_at).getFullYear()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-medium text-white">
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(showAllFeatures
                  ? product.key_features || []
                  : (product.key_features || []).slice(0, 6)
                ).map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start bg-zinc-800 p-3 rounded-lg"
                  >
                    <Check className="size-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>
              {(product.key_features || []).length > 6 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                  className="mt-4 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800"
                >
                  {showAllFeatures ? "Show Less" : "Show All Features"}
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showAllFeatures ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      ></path>
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    )}
                  </svg>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-medium text-white">
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Engine</span>
                    <span className="font-medium text-white">
                      {product.engine || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Power</span>
                    <span className="font-medium text-white">
                      {product.power || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Torque</span>
                    <span className="font-medium text-white">
                      {product.torque || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Transmission</span>
                    <span className="font-medium text-white">
                      {product.transmission || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Weight</span>
                    <span className="font-medium text-white">
                      {product.weight_kg ? `${product.weight_kg} kg` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Wheelbase</span>
                    <span className="font-medium text-white">
                      {product.wheelbase_mm
                        ? `${product.wheelbase_mm} mm`
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Acceleration</span>
                    <span className="font-medium text-white">
                      {product.acceleration_0_100 || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Top Speed</span>
                    <span className="font-medium text-white">
                      {product.top_speed || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Fuel Economy</span>
                    <span className="font-medium text-white">
                      {product.fuel_economy || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Dimensions</span>
                    <span className="font-medium text-white">
                      {product.dimensions || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Fuel Tank</span>
                    <span className="font-medium text-white">
                      {product.fuel_tank_capacity
                        ? `${product.fuel_tank_capacity} liters`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-500">Trunk Capacity</span>
                    <span className="font-medium text-white">
                      {product.trunk_capacity_liters
                        ? `${product.trunk_capacity_liters} liters`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="sticky top-5 bg-zinc-900 border-zinc-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-white flex items-center">
                <Key className="size-5 text-amber-500 mr-2" />
                Purchase Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-500 mb-2">
                  Stock & Availability
                </h3>
                <div className="flex items-center">
                  <span
                    className={`inline-block size-3 rounded-full ${
                      product.availability === "in_stock"
                        ? "bg-emerald-500"
                        : "bg-zinc-500"
                    } mr-2`}
                  ></span>
                  <span className="text-sm text-zinc-400">
                    {product.availability === "in_stock"
                      ? `In Stock (${product.stock_quantity} available)`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-500 mb-2">
                  Price Breakdown
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Base Price</span>
                    <span className="text-white">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Destination Fee</span>
                    <span className="text-white">
                      ${destinationFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Est. Tax & Title</span>
                    <span className="text-white">
                      ${taxAndTitle.toLocaleString()}
                    </span>
                  </div>
                  <Separator className="my-2 bg-zinc-800" />
                  <div className="flex justify-between font-medium">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-amber-300">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-amber-800 text-amber-100 hover:bg-amber-700 border-amber-900"
                  variant="secondary"
                  disabled={product.availability !== "in_stock"}
                  onClick={handleBuyNowClick}
                >
                  Buy Now
                </Button>

                <Dialog
                  open={showStripeModal}
                  onOpenChange={setShowStripeModal}
                >
                  <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-200">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-200">
                        Complete Your Purchase
                      </DialogTitle>
                    </DialogHeader>
                    <StripeComponent carId={Number(id)} quantity={1} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-center text-sm text-zinc-500">
                <ShieldCheck className="size-4 mr-1 text-amber-500" />
                <span>Secure transaction & 7-day return policy</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update the reviews section in the JSX to remove the likes count display */}
      <div className="w-full max-w-7xl mx-auto p-4 mt-4">
        <Card className="bg-zinc-900 border-zinc-800 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-medium text-white">
              Customer Reviews
            </CardTitle>
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-amber-300 hover:bg-zinc-800"
              onClick={() => {
                if (!isSignedIn) {
                  toast.error("Please sign in to write a review");
                  return;
                }
                setShowReviewModal(true);
                setTimeout(() => {
                  reviewTextareaRef.current?.focus();
                }, 100);
              }}
            >
              Write a Review
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-4">
                    <MessageSquare className="size-6 text-amber-500 mr-2" />
                    <span className="text-xl font-medium text-white">
                      {reviews.length}{" "}
                      {reviews.length === 1 ? "Review" : "Reviews"}
                    </span>
                  </div>

                  <Button
                    onClick={toggleFavorite}
                    variant="outline"
                    className={`border-amber-700 bg-zine-500 ${isFavorite ? "bg-amber-800/30 text-amber-300" : "text-zinc-400 hover:text-amber-300"} hover:bg-amber-900/20`}
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${isFavorite ? "fill-amber-400" : ""}`}
                    />
                    {isFavorite ? "Liked" : "Like this car"}
                  </Button>
                </div>
              </div>

              <div className="md:w-2/3">
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-zinc-800 pb-6"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-amber-800/30 text-amber-300 p-1.5 rounded-full mr-2">
                              <User className="size-4" />
                            </div>
                            <div className="font-medium text-white">
                              {review.reviewer}
                            </div>
                          </div>
                          <div className="text-zinc-500 text-sm">
                            {formatReviewDate(review.time_written)}
                          </div>
                        </div>
                        <p className="text-zinc-400">{review.review}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-amber-700/50 mb-3" />
                    <h3 className="text-zinc-400 text-lg mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-zinc-500 mb-4">
                      Be the first to share your experience with this vehicle
                    </p>
                    <Button
                      variant="outline"
                      className="bg-amber-800/20 text-amber-300 border-amber-700/50 hover:bg-amber-800/40"
                      onClick={() => {
                        if (!isSignedIn) {
                          toast.error("Please sign in to write a review");
                          return;
                        }
                        setShowReviewModal(true);
                      }}
                    >
                      Write a Review
                    </Button>
                  </div>
                )}

                {reviews.length > 5 && (
                  <Button
                    variant="ghost"
                    className="mt-6 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800"
                  >
                    View All {reviews.length} Reviews
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-zinc-200">Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400 mb-2">Reviewing: {product.name}</p>
              <Textarea
                ref={reviewTextareaRef}
                placeholder="Share your experience with this vehicle..."
                className="min-h-[150px] bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 focus:ring-amber-600/20"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || !newReview.trim()}
              className="bg-amber-800 text-amber-100 hover:bg-amber-700 border-amber-900"
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-1 size-4" />
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-7xl mx-auto p-4 mt-8 mb-16">
        <h2 className="text-2xl font-medium text-white mb-6">
          You May Also Like
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarCars.length > 0 ? (
            similarCars.map((car) => (
              <Card
                key={car.id}
                className="bg-zinc-900 border-zinc-800 shadow-md overflow-hidden transition-all duration-300 hover:border-amber-700/50"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={car.image_url || "/placeholder.svg"}
                    alt={car.name}
                    className="w-full h-48 object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=200&width=300&text=No+Image";
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-1 text-white">
                    {car.name}
                  </h3>
                  <p className="text-zinc-500 mb-3">
                    Starting at {formatPrice(car.price)}
                  </p>
                  <Button
                    variant="ghost"
                    asChild
                    className="text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 flex items-center p-0"
                  >
                    <Link to="/cars/$id" params={{ id: car.id.toString() }}>
                      View Details
                      <svg
                        className="ml-1 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-zinc-500">
                No similar vehicles available at this time.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="w-full bg-zinc-950 border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-zinc-600 text-sm">
            <p>
              © {new Date().getFullYear()} Luxury Automotive. All rights
              reserved.
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

export const Route = createFileRoute("/cars/$id")({
  component: ProductDetail,
});
