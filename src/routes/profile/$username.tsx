"use client";

import { useState, useEffect } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import { API_URL } from "../../config";
import {
  MapPin,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Heart,
  Bookmark,
  Clock,
  ShoppingCart,
  Eye,
  Car,
  ChevronRight,
  Loader2,
  User,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Add these imports at the top of the file with the other imports
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// Types
interface ActivityItem {
  profile: number;
  product: number;
  action: "purchase" | "view" | "bookmark" | "favorite";
  timestamp: string;
}
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

interface ActivityResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ActivityItem[];
}

interface CarType {
  id: number;
  name: string;
  price: string;
  image_url: string;
  description: string;
  category?: number;
  stock_quantity?: number;
  sku?: string;
  availability?: string;
  car_type?: string;
}

function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { username } = useParams({ from: "/profile/$username" });
  const { getToken, userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [carNames, setCarNames] = useState<{ [carId: number]: string }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [hasMoreActivity, setHasMoreActivity] = useState(false);
  const [favoriteCars, setFavoriteCars] = useState<CarType[]>([]);
  const [bookmarkedCars, setBookmarkedCars] = useState<CarType[]>([]);

  // Add these query hooks after the state declarations
  const fetchCars = async (carIds: number[]): Promise<CarType[]> => {
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

      const allCars: CarType[] = await response.json();
      // Filter cars to only include those in the provided IDs
      return allCars.filter((car) => carIds.includes(car.id));
    } catch (error) {
      console.error("Error fetching cars:", error);
      throw error;
    }
  };

  // Query for favorite cars
  const { data: favoriteCarsData = [], isLoading: isFavoritesLoading } =
    useQuery<CarType[]>({
      queryKey: ["favoriteCars", profile?.favorite_cars],
      queryFn: () => fetchCars(profile?.favorite_cars || []),
      enabled: !!profile && profile.favorite_cars.length > 0,
      staleTime: 60000,
    });

  // Query for bookmarked cars
  const { data: bookmarkedCarsData = [], isLoading: isBookmarksLoading } =
    useQuery<CarType[]>({
      queryKey: ["bookmarkedCars", profile?.bookmarked_cars],
      queryFn: () => fetchCars(profile?.bookmarked_cars || []),
      enabled: !!profile && profile.bookmarked_cars.length > 0,
      staleTime: 60000,
    });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError,
    error,
  } = useQuery<Profile, Error>({
    queryKey: ["profile", username, userId],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/profiles/`, {
        // Ensure this endpoint is correct
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      return (await response.json()) as Profile;
    },
    enabled: !!userId && isLoaded && !!user,
    staleTime: 60000, // Keep this as it controls when a refetch might occur
  });

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setEditedProfile({
        name: profileData.name || username,
        location: profileData.location,
        contact_info: profileData.contact_info,
        bio: profileData.bio,
        profile_picture: profileData.profile_picture_url,
      });
      // Logic to determine if it's the current user
      // This depends on how you identify the current user (e.g., comparing IDs)
      setIsCurrentUser(true); // Adjust this logic
    }
  }, [profileData, username, setProfile, setEditedProfile, setIsCurrentUser]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data. Please try again.");
    }
  }, [isError, error]);
  const {
    data: activityData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError: isActivityError,
    error: activityError,
  } = useInfiniteQuery<ActivityResponse, Error>({
    queryKey: ["activityLog", userId, isCurrentUser],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/profiles/activity/?page=${pageParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      return (await response.json()) as ActivityResponse;
    },
    enabled: !!userId && isCurrentUser && isLoaded,
    getNextPageParam: (lastPage: ActivityResponse) => {
      return lastPage.next
        ? Number.parseInt(
            new URL(lastPage.next).searchParams.get("page") || "0",
          )
        : undefined;
    },
    staleTime: 60000,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (activityData) {
      const allResults = activityData.pages.flatMap(
        (page: ActivityResponse) => page.results,
      );
      setActivityLog(allResults);
      setHasMoreActivity(
        !!activityData.pages[activityData.pages.length - 1]?.next,
      );
    }
  }, [activityData, setActivityLog, setHasMoreActivity]);

  // Optional: Handle errors using useEffect as well
  useEffect(() => {
    if (isActivityError) {
      console.error("Error fetching activity log:", activityError);
      // Optionally display an error message to the user
    }
  }, [isActivityError, activityError]);

  useEffect(() => {
    const allLoaded = !isFavoritesLoading && !isBookmarksLoading;
    if (allLoaded && activityLog.length > 0) {
      const names: { [carId: number]: string } = {};
      activityLog.forEach((activity) => {
        const carId = activity.product;
        if (!names[carId]) {
          const favoriteCar = favoriteCarsData.find((car) => car.id === carId);
          if (favoriteCar) {
            names[carId] = favoriteCar.name;
          } else {
            const bookmarkedCar = bookmarkedCarsData.find(
              (car) => car.id === carId,
            );
            if (bookmarkedCar) {
              names[carId] = bookmarkedCar.name;
            } else {
              names[carId] = `Car ID: ${carId} (Not Found)`; // Fallback if car is not in fetched data
            }
          }
        }
      });
      setCarNames(names);
    }
  }, [
    activityLog,
    favoriteCarsData,
    bookmarkedCarsData,
    isFavoritesLoading,
    isBookmarksLoading,
  ]);
  // Set the state variables based on the query results
  useEffect(() => {
    if (favoriteCarsData.length > 0) {
      setFavoriteCars(favoriteCarsData);
    }
  }, [favoriteCarsData]);

  useEffect(() => {
    if (bookmarkedCarsData.length > 0) {
      setBookmarkedCars(bookmarkedCarsData);
    }
  }, [bookmarkedCarsData]);

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      const token = await getToken();

      const formData = new FormData();

      // Append fields to formData, ensuring they are not undefined
      if (editedProfile.name) formData.append("name", editedProfile.name);
      if (editedProfile.location)
        formData.append("location", editedProfile.location);
      if (editedProfile.contact_info)
        formData.append("contact_info", editedProfile.contact_info);
      if (editedProfile.bio) formData.append("bio", editedProfile.bio);
      if (editedProfile.favorite_cars)
        formData.append(
          "favorite_cars",
          JSON.stringify(editedProfile.favorite_cars),
        );
      if (editedProfile.bookmarked_cars)
        formData.append(
          "bookmarked_cars",
          JSON.stringify(editedProfile.bookmarked_cars),
        );

      // Append profile_picture if it's a valid File
      if (editedProfile.profile_picture instanceof File) {
        formData.append("profile_picture", editedProfile.profile_picture);
      }

      const response = await fetch(`${API_URL}/profiles/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);

      toast.success("Your profile has been successfully updated.");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (carId: number, isFavorite: boolean) => {
    if (!profile || !isCurrentUser) return;

    try {
      const token = await getToken();
      const endpoint = isFavorite
        ? `/profiles/favorites/remove/${carId}/`
        : `/profiles/favorites/add/${carId}/`;

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
        setProfile({
          ...profile,
          favorite_cars: profile.favorite_cars.filter((id) => id !== carId),
        });
        setFavoriteCars(favoriteCars.filter((car) => car.id !== carId));
      } else {
        // Fetch the car details using the same pattern as fetchCars
        const carResponse = await fetch(`${API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!carResponse.ok) {
          throw new Error("Failed to fetch car details");
        }

        const allCars = await carResponse.json();
        const carData = allCars.find((c: CarType) => c.id === carId);

        if (!carData) {
          throw new Error("Car not found");
        }

        setProfile({
          ...profile,
          favorite_cars: [...profile.favorite_cars, carId],
        });
        setFavoriteCars([...favoriteCars, carData]);
      }

      if (isFavorite) {
        toast.success("The car has been removed from your favorites.");
      } else {
        toast.success("The car has been added to your favorites.");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(
        `Failed to ${isFavorite ? "remove from" : "add to"} favorites. Please try again.`,
      );
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (carId: number, isBookmarked: boolean) => {
    if (!profile || !isCurrentUser) return;

    try {
      const token = await getToken();
      const endpoint = isBookmarked
        ? `/profiles/bookmarks/remove/${carId}/`
        : `/profiles/bookmarks/add/${carId}/`;

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
        setProfile({
          ...profile,
          bookmarked_cars: profile.bookmarked_cars.filter((id) => id !== carId),
        });
        setBookmarkedCars(bookmarkedCars.filter((car) => car.id !== carId));
      } else {
        // Fetch the car details using the same pattern as fetchCars
        const carResponse = await fetch(`${API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!carResponse.ok) {
          throw new Error("Failed to fetch car details");
        }

        const allCars = await carResponse.json();
        const carData = allCars.find((c: CarType) => c.id === carId);

        if (!carData) {
          throw new Error("Car not found");
        }

        setProfile({
          ...profile,
          bookmarked_cars: [...profile.bookmarked_cars, carId],
        });
        setBookmarkedCars([...bookmarkedCars, carData]);
      }

      if (isBookmarked) {
        toast.success("The car has been removed from your bookmarks.");
      } else {
        toast.success("The car has been added to your bookmarks.");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error(
        `Failed to ${isBookmarked ? "remove from" : "add to"} bookmarks. Please try again.`,
      );
    }
  };
  const getCarNameFromActivity = (carId: number): string =>
    carNames[carId] || `Car ID: ${carId} (Loading...)`;

  // Format date
  //
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get action icon
  const getActionIcon = (action: string) => {
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

  // Get action text
  const getActionText = (action: string) => {
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
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 text-amber-700/50 animate-spin mx-auto mb-4" />
          <p className="text-amber-400/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Profile Not Found</CardTitle>
            <CardDescription className="text-zinc-400">
              We couldn't find the profile for {username}. Please check the
              username and try again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="secondary"
              className="w-full bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <Avatar className="size-20 bg-zinc-800">
                    <AvatarImage
                      src={profile.profile_picture_url || "/placeholder.svg"}
                      alt={profile.name || username}
                    />
                    <AvatarFallback className="bg-zinc-800 text-amber-500">
                      <User className="size-12" strokeWidth={1.5} />
                    </AvatarFallback>
                  </Avatar>

                  {isCurrentUser && !isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-700/50 bg-zinc-800 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="size-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : isCurrentUser && isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="size-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="size-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>

                {isCurrentUser && isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-zinc-400">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={editedProfile.name || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            name: e.target.value,
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-zinc-400">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={editedProfile.location || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            location: e.target.value,
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact" className="text-zinc-400">
                        Contact Info
                      </Label>
                      <Input
                        id="contact"
                        value={editedProfile.contact_info || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            contact_info: e.target.value,
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-zinc-400">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={editedProfile.bio || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            bio: e.target.value,
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="picture" className="text-zinc-400">
                        Profile Picture URL
                      </Label>
                      <Input
                        id="profile_picture"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            setEditedProfile({
                              ...editedProfile,
                              profile_picture: file,
                            });
                        }}
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-500
                        file:mr-4 file:py-1 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-amber-700 file:text-amber-100
                        hover:file:bg-amber-600"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-medium text-white mb-2">
                      {profile.name || username}
                    </h2>

                    <div className="space-y-3 mb-4">
                      {profile.location && (
                        <div className="flex items-center text-zinc-400">
                          <MapPin className="size-4 mr-2 text-amber-600" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.contact_info && (
                        <div className="flex items-center text-zinc-400">
                          <Mail className="size-4 mr-2 text-amber-600" />
                          <span>{profile.contact_info}</span>
                        </div>
                      )}
                      <div className="flex items-center text-zinc-400">
                        <Calendar className="size-4 mr-2 text-amber-600" />
                        <span>
                          Member since {formatDate(profile.member_since)}
                        </span>
                      </div>
                    </div>

                    {profile.bio && (
                      <div className="mt-4 text-zinc-400 border-l-2 border-amber-800/30 pl-4">
                        {profile.bio}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">
                  Profile Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-medium text-amber-300">
                      {profile.favorite_cars.length}
                    </div>
                    <div className="text-sm text-zinc-400">Favorite Cars</div>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-medium text-amber-300">
                      {profile.bookmarked_cars.length}
                    </div>
                    <div className="text-sm text-zinc-400">Bookmarked Cars</div>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-medium text-amber-300">
                      {
                        activityLog.filter((a) => a.action === "purchase")
                          .length
                      }
                    </div>
                    <div className="text-sm text-zinc-400">Purchases</div>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-medium text-amber-300">
                      {activityLog.length}
                    </div>
                    <div className="text-sm text-zinc-400">Activities</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1 mb-6">
                <TabsTrigger
                  value="activity"
                  className="flex-1 text-zinc-300 hover:text-white data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="flex-1 text-zinc-300 hover:text-white data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
                >
                  Favorites
                </TabsTrigger>
                <TabsTrigger
                  value="bookmarks"
                  className="flex-1 text-zinc-300 hover:text-white data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
                >
                  Bookmarks
                </TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-white">
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {isCurrentUser
                        ? "Your recent interactions with our vehicles"
                        : `${profile.name}'s recent interactions with our vehicles`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activityLog.length > 0 ? (
                      <div className="space-y-4">
                        {activityLog.map((activity, index) => (
                          <div key={index} className="flex items-start">
                            <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center mr-4 flex-shrink-0">
                              {getActionIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-white font-medium">
                                    {getActionText(activity.action)}
                                  </p>
                                  <p className="text-amber-500 text-sm">
                                    Car:{" "}
                                    {getCarNameFromActivity(activity.product)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-zinc-400 text-sm">
                                    {formatDate(activity.timestamp)}
                                  </p>
                                  <p className="text-zinc-500 text-xs">
                                    {formatTime(activity.timestamp)}
                                  </p>
                                </div>
                              </div>
                              <Separator className="my-3 bg-zinc-800" />
                            </div>
                          </div>
                        ))}

                        {hasMoreActivity && isCurrentUser && (
                          <div className="text-center pt-2">
                            <Button
                              variant="ghost"
                              onClick={() => fetchNextPage()}
                              disabled={isFetchingNextPage || !hasNextPage}
                              className="text-amber-500 hover:text-amber-300 hover:bg-zinc-800"
                            >
                              {isFetchingNextPage ? "Loading..." : "Load More"}
                              <ChevronRight className="ml-1 size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="size-12 text-amber-700/50 mx-auto mb-3" />
                        <p className="text-zinc-400">
                          No activity recorded yet
                        </p>
                        <p className="text-zinc-500 text-sm mt-1">
                          {isCurrentUser
                            ? "Your interactions with cars will appear here"
                            : `${profile.name} hasn't interacted with any cars yet`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites">
                <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-white">
                      Favorite Cars
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {isCurrentUser
                        ? "Cars you've marked as favorites"
                        : `Cars ${profile.name} has marked as favorites`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isFavoritesLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="size-12 text-amber-700/50 mx-auto mb-3 animate-spin" />
                        <p className="text-zinc-400">
                          Loading favorite cars...
                        </p>
                      </div>
                    ) : favoriteCars.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favoriteCars.map((car) => (
                          <Card
                            key={car.id}
                            className="bg-zinc-800 border-zinc-700 overflow-hidden"
                          >
                            <div className="relative h-40">
                              <img
                                src={car.image_url || "/placeholder.svg"}
                                alt={car.name}
                                className="w-full h-full object-cover"
                              />
                              {isCurrentUser && (
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute top-2 right-2 bg-zinc-900/80 hover:bg-zinc-900 size-8"
                                  onClick={() => toggleFavorite(car.id, true)}
                                >
                                  <Heart className="size-4 text-amber-400 fill-amber-400" />
                                </Button>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="text-white font-medium mb-1">
                                {car.name}
                              </h3>
                              <p className="text-amber-300 text-sm mb-2">
                                ${Number(car.price).toLocaleString()}
                              </p>

                              <div className="flex justify-between items-center mt-2">
                                <Badge
                                  variant="outline"
                                  className="bg-zinc-900 text-amber-400 border-amber-800/50"
                                >
                                  <Car className="size-3 mr-1" />
                                  ID: {car.id}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-zinc-400 hover:text-amber-200 hover:bg-zinc-700 h-8 px-2"
                                >
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="size-12 text-amber-700/50 mx-auto mb-3" />
                        <p className="text-zinc-400">No favorite cars yet</p>
                        <p className="text-zinc-500 text-sm mt-1">
                          {isCurrentUser
                            ? "Cars you mark as favorites will appear here"
                            : `${profile.name} hasn't favorited any cars yet`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookmarks Tab */}
              <TabsContent value="bookmarks">
                <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-white">
                      Bookmarked Cars
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {isCurrentUser
                        ? "Cars you've bookmarked for later"
                        : `Cars ${profile.name} has bookmarked for later`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isBookmarksLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="size-12 text-amber-700/50 mx-auto mb-3 animate-spin" />
                        <p className="text-zinc-400">
                          Loading bookmarked cars...
                        </p>
                      </div>
                    ) : bookmarkedCars.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookmarkedCars.map((car) => (
                          <Card
                            key={car.id}
                            className="bg-zinc-800 border-zinc-700 overflow-hidden"
                          >
                            <div className="relative h-40">
                              <img
                                src={car.image_url || "/placeholder.svg"}
                                alt={car.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  e.currentTarget.src = `/placeholder.svg?height=200&width=300&text=Car+${car.id}`;
                                }}
                              />
                              {isCurrentUser && (
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute top-2 right-2 bg-zinc-900/80 hover:bg-zinc-900 size-8"
                                  onClick={() => toggleBookmark(car.id, true)}
                                >
                                  <Bookmark className="size-4 text-amber-400 fill-amber-400" />
                                </Button>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="text-white font-medium mb-1">
                                {car.name}
                              </h3>
                              <p className="text-amber-300 text-sm mb-2">
                                ${Number(car.price).toLocaleString()}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <Badge
                                  variant="outline"
                                  className="bg-zinc-900 text-amber-400 border-amber-800/50"
                                >
                                  <Car className="size-3 mr-1" />
                                  ID: {car.id}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-zinc-400 hover:text-amber-200 hover:bg-zinc-700 h-8 px-2"
                                >
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Bookmark className="size-12 text-amber-700/50 mx-auto mb-3" />
                        <p className="text-zinc-400">No bookmarked cars yet</p>
                        <p className="text-zinc-500 text-sm mt-1">
                          {isCurrentUser
                            ? "Cars you bookmark will appear here for easy access"
                            : `${profile.name} hasn't bookmarked any cars yet`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/profile/$username")({
  component: ProfilePage,
});
