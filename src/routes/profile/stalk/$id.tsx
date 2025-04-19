"use client"

import { useState, useEffect } from "react"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { useAuth } from "@clerk/clerk-react"
import { API_URL } from "../../../config"
import { MapPin, Mail, Calendar, Shield, Loader2, User, Lock } from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { formatDate } from "@/utils/activityHelpers"

// Add these imports at the top of the file with the other imports
import { useQuery } from "@tanstack/react-query"
import type { Profile } from "@/types/interfaces"

function ProfileStalkerPage() {
    const { id } = useParams({ from: "/profile/stalk/$id" })
    const { getToken, userId } = useAuth()
    const [profile, setProfile] = useState<Profile | null>(null)

    const {
        data: profileData,
        isLoading: isProfileLoading,
        isError,
        error,
    } = useQuery<Profile, Error>({
        queryKey: ["profile", id, userId],
        queryFn: async () => {
            const token = await getToken()
            const response = await fetch(`${API_URL}/profiles/stalk/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch profile")
            }

            return (await response.json()) as Profile
        },
        enabled: !!userId && !!id,
        staleTime: 60000, // Keep this as it controls when a refetch might occur
    })

    useEffect(() => {
        if (profileData) {
            setProfile(profileData)
        }
    }, [profileData, setProfile])

    useEffect(() => {
        if (isError) {
            console.error("Error fetching profile:", error)
            toast.error("Failed to load profile data. Please try again.")
        }
    }, [isError, error])

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

    // Create a placeholder component for restricted content
    const RestrictedContent = ({ title }: { title: string }) => (
        <div className="text-center py-12">
            <div className="bg-zinc-800/50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lock className="size-8 text-amber-600/70" />
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">Access Restricted</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
                You don't have permission to view {title.toLowerCase()} information for this profile.
            </p>
        </div>
    )

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
                                        <div className="text-2xl font-medium text-amber-300">
                                            <Shield className="size-5 inline-block mr-1 text-amber-600/70" />
                                        </div>
                                        <div className="text-sm text-zinc-400">Favorite Cars</div>
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-medium text-amber-300">
                                            <Shield className="size-5 inline-block mr-1 text-amber-600/70" />
                                        </div>
                                        <div className="text-sm text-zinc-400">Bookmarked Cars</div>
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-medium text-amber-300">
                                            <Shield className="size-5 inline-block mr-1 text-amber-600/70" />
                                        </div>
                                        <div className="text-sm text-zinc-400">Purchases</div>
                                    </div>
                                    <div className="bg-zinc-800 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-medium text-amber-300">
                                            <Shield className="size-5 inline-block mr-1 text-amber-600/70" />
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
                                        <CardTitle className="text-xl font-medium text-white">Recent Activity</CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            {`${profile.name}'s recent interactions with our vehicles`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RestrictedContent title="Activity" />
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
                                        <RestrictedContent title="Favorites" />
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
                                        <RestrictedContent title="Bookmarks" />
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

