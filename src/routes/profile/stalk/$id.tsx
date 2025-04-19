
import { useState, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useAuth } from "@clerk/clerk-react"
import { API_URL } from "../../../config"
import {
    MapPin,
    Mail,
    Calendar,
    Heart,
    Bookmark,
    Clock,
    Car,
    ChevronRight,
    Loader2,
    User,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Link } from "@tanstack/react-router"
import { getCarNameFromActivity, formatDate, formatTime, getActionIcon, getActionText } from "@/utils/activityHelpers"


// Add these imports at the top of the file with the other imports
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { ActivityItem, Profile, ActivityResponse, Product } from "@/types/interfaces"
// Types



function ProfileStalkerPage() {
    const { getToken, userId } = useAuth()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [carNames, setCarNames] = useState<{ [carId: number]: string }>({})
    const [activityLog, setActivityLog] = useState<ActivityItem[]>([])
    const [hasMoreActivity, setHasMoreActivity] = useState(false)
    const [favoriteCars, setFavoriteCars] = useState<Product[]>([])
    const [bookmarkedCars, setBookmarkedCars] = useState<Product[]>([])

    // Add these query hooks after the state declarations
    const fetchCars = async (carIds: number[]): Promise<Product[]> => {
        try {
            if (!carIds.length) return []

            const token = await getToken()
            const response = await fetch(`${API_URL}/api/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch cars")
            }

            const allCars: Product[] = await response.json()
            return allCars.filter((car) => carIds.includes(car.id))
        } catch (error) {
            console.error("Error fetching cars:", error)
            throw error
        }
    }

    // Query for favorite cars
    const { data: favoriteCarsData = [], isLoading: isFavoritesLoading } = useQuery<Product[]>({
        queryKey: ["favoriteCars", profile?.favorite_cars, profile?.user],
        queryFn: () => fetchCars(profile?.favorite_cars || []),
        enabled: !!profile && profile.favorite_cars.length > 0,
        staleTime: 60000,
    })

    // Query for bookmarked cars
    const { data: bookmarkedCarsData = [], isLoading: isBookmarksLoading } = useQuery<Product[]>({
        queryKey: ["bookmarkedCars", profile?.bookmarked_cars, profile?.user],
        queryFn: () => fetchCars(profile?.bookmarked_cars || []),
        enabled: !!profile && profile.bookmarked_cars.length > 0,
        staleTime: 60000,
    })

    const {
        data: profileData,
        isLoading: isProfileLoading,
        isError,
        error,
    } = useQuery<Profile, Error>({
        queryKey: ["profile", profile?.user, userId],
        queryFn: async () => {
            const token = await getToken()
            const response = await fetch(`${API_URL}/profiles/stalk/${profile?.user}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch profile")
            }

            return (await response.json()) as Profile
        },
        enabled: !!userId,
        staleTime: 60000, // Keep this as it controls when a refetch might occur
    })

    useEffect(() => {
        if (profileData) {
            setProfile(profileData)
        }
    }, [profileData, setProfile]);


    useEffect(() => {
        if (isError) {
            console.error("Error fetching profile:", error)
            toast.error("Failed to load profile data. Please try again.")
        }
    }, [isError, error])

    const {
        data: activityData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isError: isActivityError,
        error: activityError,
    } = useInfiniteQuery<ActivityResponse, Error>({
        queryKey: ["activityLog", profile?.user],
        queryFn: async ({ pageParam = 1 }) => {
            const token = await getToken()
            const response = await fetch(`${API_URL}/profiles/${profile?.user}/activity/?page=${pageParam}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch activity")
            }

            return (await response.json()) as ActivityResponse
        },
        enabled: !!userId,
        getNextPageParam: (lastPage: ActivityResponse) => {
            return lastPage.next ? Number.parseInt(new URL(lastPage.next).searchParams.get("page") || "0") : undefined
        },
        staleTime: 60000,
        initialPageParam: 1,
    })

    useEffect(() => {
        if (activityData) {
            const allResults = activityData.pages.flatMap((page: ActivityResponse) => page.results)
            setActivityLog(allResults)
            setHasMoreActivity(!!activityData.pages[activityData.pages.length - 1]?.next)
        }
    }, [activityData, setActivityLog, setHasMoreActivity])

    // Optional: Handle errors using useEffect as well
    useEffect(() => {
        if (isActivityError) {
            console.error("Error fetching activity log:", activityError)
            // Optionally display an error message to the user
        }
    }, [isActivityError, activityError])

    useEffect(() => {
        const allLoaded = !isFavoritesLoading && !isBookmarksLoading
        if (allLoaded && activityLog.length > 0) {
            const names: { [carId: number]: string } = {}
            activityLog.forEach((activity) => {
                const carId = activity.product
                if (!names[carId]) {
                    const favoriteCar = favoriteCarsData.find((car) => car.id === carId)
                    if (favoriteCar) {
                        names[carId] = favoriteCar.name
                    } else {
                        const bookmarkedCar = bookmarkedCarsData.find((car) => car.id === carId)
                        if (bookmarkedCar) {
                            names[carId] = bookmarkedCar.name
                        } else {
                            names[carId] = `Car ID: ${carId} (Not Found)` // Fallback if car is not in fetched data
                        }
                    }
                }
            })
            setCarNames(names)
        }
    }, [activityLog, favoriteCarsData, bookmarkedCarsData, isFavoritesLoading, isBookmarksLoading])

    // Set the state variables based on the query results
    useEffect(() => {
        if (favoriteCarsData.length > 0) {
            setFavoriteCars(favoriteCarsData)
        }
    }, [favoriteCarsData])

    useEffect(() => {
        if (bookmarkedCarsData.length > 0) {
            setBookmarkedCars(bookmarkedCarsData)
        }
    }, [bookmarkedCarsData])

    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="size-12 text-amber-700/50 animate-spin mx-auto mb-4" />
                    <p className="text-amber-400/70">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-white">Profile Not Found</CardTitle>
                        <CardDescription className="text-zinc-400">
                            We couldn't find the profile for this user. Please check the ID and try again.
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
        )
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
                                        <AvatarImage src={profile.profile_picture_url || "/placeholder.svg"} alt={profile.name} />
                                        <AvatarFallback className="bg-zinc-800 text-amber-500">
                                            <User className="size-12" strokeWidth={1.5} />
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <h2 className="text-2xl font-medium text-white mb-2">{profile.name}</h2>

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
                                        <span>Member since {formatDate(profile.member_since)}</span>
                                    </div>
                                </div>

                                {profile.bio && (
                                    <div className="mt-4 text-zinc-400 border-l-2 border-amber-800/30 pl-4">{profile.bio}</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white">Profile Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-800 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-medium text-amber-300">{profile.favorite_cars.length}</div>
                                        <div className="text-sm text-zinc-400">Favorite Cars</div>
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-medium text-amber-300">{profile.bookmarked_cars.length}</div>
                                        <div className="text-sm text-zinc-400">Bookmarked Cars</div>
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-medium text-amber-300">
                                            {activityLog.filter((a) => a.action === "purchase").length}
                                        </div>
                                        <div className="text-sm text-zinc-400">Purchases</div>
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-medium text-amber-300">{activityLog.length}</div>
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
                                        <CardTitle className="text-xl font-medium text-white">Recent Activity</CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            {`${profile.name}'s recent interactions with our vehicles`}
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
                                                                    <p className="text-white font-medium">{getActionText(activity.action)}</p>
                                                                    <p className="text-amber-500 text-sm">
                                                                        Car: {getCarNameFromActivity(activity.product, carNames)}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-zinc-400 text-sm">{formatDate(activity.timestamp)}</p>
                                                                    <p className="text-zinc-500 text-xs">{formatTime(activity.timestamp)}</p>
                                                                </div>
                                                            </div>
                                                            <Separator className="my-3 bg-zinc-800" />
                                                        </div>
                                                    </div>
                                                ))}

                                                {hasMoreActivity && (
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
                                                <p className="text-zinc-400">No activity recorded yet</p>
                                                <p className="text-zinc-500 text-sm mt-1">
                                                    {`${profile.name} hasn't interacted with any cars yet`}
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
                                        <CardTitle className="text-xl font-medium text-white">Favorite Cars</CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            {`Cars ${profile.name} has marked as favorites`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isFavoritesLoading ? (
                                            <div className="text-center py-8">
                                                <Loader2 className="size-12 text-amber-700/50 mx-auto mb-3 animate-spin" />
                                                <p className="text-zinc-400">Loading favorite cars...</p>
                                            </div>
                                        ) : favoriteCars.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {favoriteCars.map((car) => (
                                                    <Card key={car.id} className="bg-zinc-800 border-zinc-700 overflow-hidden">
                                                        <div className="relative h-40">
                                                            <img
                                                                src={car.image_url || "/placeholder.svg"}
                                                                alt={car.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <CardContent className="p-4">
                                                            <h3 className="text-white font-medium mb-1">{car.name}</h3>
                                                            <p className="text-amber-300 text-sm mb-2">${Number(car.price).toLocaleString()}</p>

                                                            <div className="flex justify-between items-center mt-2">
                                                                <Badge variant="outline" className="bg-zinc-900 text-amber-400 border-amber-800/50">
                                                                    <Car className="size-3 mr-1" />
                                                                    ID: {car.id}
                                                                </Badge>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-zinc-400 hover:text-amber-200 hover:bg-zinc-700 h-8 px-2"
                                                                    asChild
                                                                >
                                                                    <Link to="/cars/$id" params={{ id: car.id.toString() }}>
                                                                        View Details
                                                                    </Link>
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
                                                <p className="text-zinc-500 text-sm mt-1">{`${profile.name} hasn't favorited any cars yet`}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Bookmarks Tab */}
                            <TabsContent value="bookmarks">
                                <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-medium text-white">Bookmarked Cars</CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            {`Cars ${profile.name} has bookmarked for later`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isBookmarksLoading ? (
                                            <div className="text-center py-8">
                                                <Loader2 className="size-12 text-amber-700/50 mx-auto mb-3 animate-spin" />
                                                <p className="text-zinc-400">Loading bookmarked cars...</p>
                                            </div>
                                        ) : bookmarkedCars.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {bookmarkedCars.map((car) => (
                                                    <Card key={car.id} className="bg-zinc-800 border-zinc-700 overflow-hidden">
                                                        <div className="relative h-40">
                                                            <img
                                                                src={car.image_url || "/placeholder.svg"}
                                                                alt={car.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback if image fails to load
                                                                    e.currentTarget.src = `/placeholder.svg?height=200&width=300&text=Car+${car.id}`
                                                                }}
                                                            />
                                                        </div>
                                                        <CardContent className="p-4">
                                                            <h3 className="text-white font-medium mb-1">{car.name}</h3>
                                                            <p className="text-amber-300 text-sm mb-2">${Number(car.price).toLocaleString()}</p>
                                                            <div className="flex justify-between items-center mt-2">
                                                                <Badge variant="outline" className="bg-zinc-900 text-amber-400 border-amber-800/50">
                                                                    <Car className="size-3 mr-1" />
                                                                    ID: {car.id}
                                                                </Badge>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-zinc-400 hover:text-amber-200 hover:bg-zinc-700 h-8 px-2"
                                                                    asChild
                                                                >
                                                                    <Link to="/cars/$id" params={{ id: car.id.toString() }}>
                                                                        View Details
                                                                    </Link>
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
                                                <p className="text-zinc-500 text-sm mt-1">{`${profile.name} hasn't bookmarked any cars yet`}</p>
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
    )
}

export const Route = createFileRoute("/profile/stalk/$id")({
    component: ProfileStalkerPage,
})

