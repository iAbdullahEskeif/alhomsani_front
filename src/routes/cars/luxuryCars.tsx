"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation } from "@tanstack/react-query"
import { API_URL } from "../../config"
import { useAuth } from "@clerk/clerk-react"
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Tag,
    DollarSign,
    Package,
    Layers,
    FileText,
    ImageIcon,
    AlertCircle,
    Gauge,
    Heart,
    Bookmark,
    Car,
    Zap,
    Clock,
    Scale,
    Ruler,
    Fuel,
    Box,
    Check,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useIsVisible } from "@/components/hooks/useisvisible"
import type { Product } from "@/types/interfaces"

function LuxuryCars() {
    const ref = useRef<HTMLDivElement>(null)
    const isVisible = useIsVisible(ref)
    const [isMobile, setIsMobile] = useState<boolean>(false)

    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [newProduct, setNewProduct] = useState<Product>({
        id: 0,
        name: "",
        description: "",
        price: "",
        stock_quantity: 1,
        sku: "",
        category: 1,
        availability: "in_stock",
        car_type: "electrical",
        image: null,
        image_url: "",
        image_public_id: "",
        created_at: "",
        updated_at: "",
        key_features: [""],
        engine: "",
        power: "",
        torque: "",
        transmission: "",
        acceleration_0_100: "",
        top_speed: "",
        fuel_economy: "",
        dimensions: "",
        weight_kg: 0,
        wheelbase_mm: 0,
        fuel_tank_capacity: 0,
        trunk_capacity_liters: 0,
    })
    const [isFormVisible, setIsFormVisible] = useState<boolean>(false)
    const [isAddButtonVisible, setIsAddButtonVisible] = useState<boolean>(true)
    const [error, setError] = useState<string>("")
    const touchStartX = useRef<number | null>(null)
    const [favorites, setFavorites] = useState<number[]>([])
    const [bookmarks, setBookmarks] = useState<number[]>([])
    const [newFeature, setNewFeature] = useState<string>("")

    const { getToken, isSignedIn } = useAuth()

    // Check if mobile on mount and when window resizes
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 640)
        }

        // Initial check
        checkIfMobile()

        // Add event listener
        window.addEventListener("resize", checkIfMobile)

        // Cleanup
        return () => window.removeEventListener("resize", checkIfMobile)
    }, [])

    // Fetch user's favorites and bookmarks
    useEffect(() => {
        const fetchUserSavedItems = async () => {
            if (!isSignedIn) return

            try {
                const token = await getToken()
                const response = await fetch(`${API_URL}/profiles/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch profile")
                }

                const profile = await response.json()
                setFavorites(profile.favorite_cars || [])
                setBookmarks(profile.bookmarked_cars || [])
            } catch (error) {
                console.error("Error fetching saved items:", error)
            }
        }

        fetchUserSavedItems()
    }, [isSignedIn, getToken])

    const fetchProducts = async (): Promise<Product[]> => {
        try {
            // Use the filtered endpoint for electrical cars
            const response = await fetch(`${API_URL}/api/filtered/?car_type=luxury`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) {
                throw new Error("Failed to fetch products")
            }
            return await response.json()
        } catch (error) {
            console.error("Error fetching products:", error)
            throw error
        }
    }

    const createProduct = async (productData: Product): Promise<Product> => {
        const token = await getToken()

        // If image is a File, use FormData
        if (productData.image instanceof File) {
            const formData = new FormData()
            // Append all fields; ensure key names match your backend serializer
            formData.append("name", productData.name)
            formData.append("description", productData.description)
            formData.append("price", productData.price)
            formData.append("stock_quantity", productData.stock_quantity.toString())
            formData.append("sku", productData.sku)
            formData.append("category", productData.category.toString())
            formData.append("availability", productData.availability)
            formData.append("car_type", productData.car_type)
            formData.append("image", productData.image)

            // Append new technical specifications
            formData.append("engine", productData.engine)
            formData.append("power", productData.power)
            formData.append("torque", productData.torque)
            formData.append("transmission", productData.transmission)
            formData.append("acceleration_0_100", productData.acceleration_0_100)
            formData.append("top_speed", productData.top_speed)
            formData.append("fuel_economy", productData.fuel_economy)
            formData.append("dimensions", productData.dimensions)
            formData.append("weight_kg", productData.weight_kg.toString())
            formData.append("wheelbase_mm", productData.wheelbase_mm.toString())
            formData.append("fuel_tank_capacity", productData.fuel_tank_capacity.toString())
            formData.append("trunk_capacity_liters", productData.trunk_capacity_liters.toString())

            // Append key features as a JSON string
            formData.append("key_features", JSON.stringify(productData.key_features))

            const response = await fetch(`${API_URL}/api/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Do not set Content-Type; the browser will add the correct boundary.
                },
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || "Failed to create product")
            }
            return await response.json()
        } else {
            // Otherwise, if no file, send JSON (if that's acceptable)
            const response = await fetch(`${API_URL}/api/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || "Failed to create product")
            }
            return await response.json()
        }
    }
    const {
        data: products = [],
        isLoading,
        isError,
        error: queryError,
    } = useQuery<Product[]>({
        queryKey: ["products", "luxury"],
        queryFn: fetchProducts,
        staleTime: 60000,
    })

    const addProductMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            setNewProduct({
                id: 0,
                name: "",
                description: "",
                price: "",
                stock_quantity: 1,
                sku: "",
                category: 1,
                availability: "in_stock",
                car_type: "electrical",
                image: null,
                image_url: "",
                image_public_id: "",
                created_at: "",
                updated_at: "",
                key_features: [""],
                engine: "",
                power: "",
                torque: "",
                transmission: "",
                acceleration_0_100: "",
                top_speed: "",
                fuel_economy: "",
                dimensions: "",
                weight_kg: 0,
                wheelbase_mm: 0,
                fuel_tank_capacity: 0,
                trunk_capacity_liters: 0,
            })
            setIsFormVisible(false)
            setIsAddButtonVisible(true)
            setError("")
            toast.success("Vehicle added successfully!")
        },
        onError: (error: Error) => {
            setError(error.message || "Failed to add product. Please try again.")
            toast.error("Failed to add vehicle")
        },
    })

    // Toggle favorite
    const toggleFavorite = async (carId: number) => {
        if (!isSignedIn) {
            toast.error("Please sign in to add favorites")
            return
        }

        const isFavorite = favorites.includes(carId)

        // Optimistically update UI
        if (isFavorite) {
            setFavorites(favorites.filter((id) => id !== carId))
        } else {
            setFavorites([...favorites, carId])
        }

        try {
            const endpoint = isFavorite ? `/profiles/favorites/remove/${carId}/` : `/profiles/favorites/add/${carId}/`

            const token = await getToken()
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ car_id: carId }),
            })

            if (!response.ok) {
                // Check if the error is because the car is already favorited/unfavorited
                const errorData = await response.json().catch(() => ({}))
                if (errorData.detail && errorData.detail.includes("already")) {
                    // The car is already in the desired state, so we can keep our optimistic update
                    toast.info(isFavorite ? "Already removed from favorites" : "Already in your favorites")
                    return
                }
                throw new Error(`Failed to ${isFavorite ? "remove from" : "add to"} favorites`)
            }

            toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
        } catch (error) {
            console.error("Error toggling favorite:", error)
            toast.error("Failed to update favorites")

            // Revert the optimistic update
            if (isFavorite) {
                setFavorites([...favorites, carId])
            } else {
                setFavorites(favorites.filter((id) => id !== carId))
            }
        }
    }

    // Toggle bookmark
    const toggleBookmark = async (carId: number) => {
        if (!isSignedIn) {
            toast.error("Please sign in to add bookmarks")
            return
        }

        const isBookmarked = bookmarks.includes(carId)

        // Optimistically update UI
        if (isBookmarked) {
            setBookmarks(bookmarks.filter((id) => id !== carId))
        } else {
            setBookmarks([...bookmarks, carId])
        }

        try {
            const endpoint = isBookmarked ? `/profiles/bookmarks/remove/${carId}/` : `/profiles/bookmarks/add/${carId}/`

            const token = await getToken()
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ car_id: carId }),
            })

            if (!response.ok) {
                // Check if the error is because the car is already bookmarked/unbookmarked
                const errorData = await response.json().catch(() => ({}))
                if (errorData.detail && errorData.detail.includes("already")) {
                    // The car is already in the desired state, so we can keep our optimistic update
                    toast.info(isBookmarked ? "Already removed from bookmarks" : "Already in your bookmarks")
                    return
                }
                throw new Error(`Failed to ${isBookmarked ? "remove from" : "add to"} bookmarks`)
            }

            toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
        } catch (error) {
            console.error("Error toggling bookmark:", error)
            toast.error("Failed to update bookmarks")

            // Revert the optimistic update
            if (isBookmarked) {
                setBookmarks([...bookmarks, carId])
            } else {
                setBookmarks(bookmarks.filter((id) => id !== carId))
            }
        }
    }

    const rotateProducts = useCallback(
        (direction: "next" | "prev") => {
            if (products.length === 0) return

            setCurrentIndex((prevIndex) => {
                if (direction === "next") {
                    return (prevIndex + 1) % products.length
                } else {
                    return (prevIndex - 1 + products.length) % products.length
                }
            })
        },
        [products.length],
    )

    useEffect(() => {
        if (products.length > 0) {
            const interval = setInterval(() => {
                rotateProducts("next")
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [rotateProducts, products.length])

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return

        const touchEndX = e.changedTouches[0].clientX
        const diff = touchStartX.current - touchEndX

        if (Math.abs(diff) > 50) {
            rotateProducts(diff > 0 ? "next" : "prev")
        }

        touchStartX.current = null
    }

    const getVisibleProducts = (): Product[] => {
        if (products.length === 0) return []

        const visibleProducts: Product[] = []

        if (products.length > 0) {
            visibleProducts.push(products[currentIndex])
        }

        if (products.length > 1) {
            visibleProducts.push(products[(currentIndex + 1) % products.length])
        }

        if (products.length > 2) {
            visibleProducts.push(products[(currentIndex + 2) % products.length])
        }

        return visibleProducts
    }

    const addProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        try {
            const priceFloat = Number.parseFloat(newProduct.price)
            if (isNaN(priceFloat) || priceFloat <= 0) {
                setError("Price must be a positive number.")
                return
            }

            const stockQuantity = Number.parseInt(newProduct.stock_quantity.toString(), 10)
            if (isNaN(stockQuantity) || stockQuantity < 0) {
                setError("Stock quantity must be a non-negative integer.")
                return
            }

            // Validate numeric fields
            if (isNaN(newProduct.weight_kg) || newProduct.weight_kg < 0) {
                setError("Weight must be a non-negative number.")
                return
            }

            if (isNaN(newProduct.wheelbase_mm) || newProduct.wheelbase_mm < 0) {
                setError("Wheelbase must be a non-negative number.")
                return
            }

            if (isNaN(newProduct.fuel_tank_capacity) || newProduct.fuel_tank_capacity < 0) {
                setError("Fuel tank capacity must be a non-negative number.")
                return
            }

            if (isNaN(newProduct.trunk_capacity_liters) || newProduct.trunk_capacity_liters < 0) {
                setError("Trunk capacity must be a non-negative number.")
                return
            }

            // Filter out empty key features
            const filteredKeyFeatures = newProduct.key_features.filter((feature) => feature.trim() !== "")

            const productData: Product = {
                ...newProduct,
                price: priceFloat.toString(),
                stock_quantity: stockQuantity,
                key_features: filteredKeyFeatures.length > 0 ? filteredKeyFeatures : [""],
            }

            addProductMutation.mutate(productData)
        } catch (error) {
            console.error("Error adding product:", error)
            setError((error as Error).message || "Failed to add product. Please try again.")
        }
    }

    const handleAddProductClick = () => {
        setIsFormVisible(true)
        setIsAddButtonVisible(false)
    }

    const handleCancel = () => {
        setIsFormVisible(false)
        setIsAddButtonVisible(true)
    }

    const formatPrice = (price: string): string => {
        return `${Number.parseFloat(price).toFixed(2)}`
    }

    const addKeyFeature = () => {
        if (newFeature.trim() !== "") {
            setNewProduct({
                ...newProduct,
                key_features: [...newProduct.key_features, newFeature],
            })
            setNewFeature("")
        }
    }

    const removeKeyFeature = (index: number) => {
        const updatedFeatures = [...newProduct.key_features]
        updatedFeatures.splice(index, 1)
        setNewProduct({
            ...newProduct,
            key_features: updatedFeatures.length > 0 ? updatedFeatures : [""],
        })
    }

    const updateKeyFeature = (index: number, value: string) => {
        const updatedFeatures = [...newProduct.key_features]
        updatedFeatures[index] = value
        setNewProduct({
            ...newProduct,
            key_features: updatedFeatures,
        })
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <div
                ref={ref}
                className={`max-w-6xl mx-auto p-4 transition-opacity ease-in duration-500 ${isVisible ? "opacity-100" : "opacity-0"
                    }`}
            >
                <h2 className="text-3xl font-medium text-white mb-6">Luxury Cars</h2>

                {error && (
                    <div className="mb-6 p-3 bg-zinc-800 border border-zinc-700 rounded-lg flex items-start">
                        <AlertCircle className="text-zinc-400 mr-2 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-zinc-300 text-sm">{error}</p>
                    </div>
                )}

                {isAddButtonVisible && (
                    <Button
                        onClick={handleAddProductClick}
                        variant="secondary"
                        className="mb-6 bg-zinc-800 text-amber-200 border-zinc-700 hover:bg-zinc-700"
                    >
                        <Plus className="mr-2 size-4" />
                        Add Product
                    </Button>
                )}

                {isFormVisible && (
                    <Card className="mb-8 bg-zinc-900 border-zinc-800 shadow-md">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-medium text-white mb-6">Add New Vehicle</h3>

                            <form onSubmit={addProduct} className="space-y-5">
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid grid-cols-3 mb-4 bg-zinc-800">
                                        <TabsTrigger
                                            value="basic"
                                            className="data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100 text-zinc-400"
                                        >
                                            Basic Info
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="specs"
                                            className="data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100 text-zinc-400"
                                        >
                                            Technical Specs
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="features"
                                            className="data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100 text-zinc-400"
                                        >
                                            Features
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <Label htmlFor="name" className="text-zinc-400">
                                                    Name
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Gauge className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="name"
                                                        value={newProduct.name}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                name: e.target.value,
                                                            })
                                                        }
                                                        required
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="Enter vehicle name"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="sku" className="text-zinc-400">
                                                    SKU
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Tag className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="sku"
                                                        value={newProduct.sku}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                sku: e.target.value,
                                                            })
                                                        }
                                                        required
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="Enter SKU"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="price" className="text-zinc-400">
                                                    Price
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <DollarSign className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={newProduct.price}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                price: e.target.value,
                                                            })
                                                        }
                                                        required
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="Enter price"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="stock" className="text-zinc-400">
                                                    Stock Quantity
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Package className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="stock"
                                                        type="number"
                                                        min="0"
                                                        value={newProduct.stock_quantity}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                stock_quantity: Number(e.target.value),
                                                            })
                                                        }
                                                        required
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="Enter stock quantity"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="category" className="text-zinc-400">
                                                    Category
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Layers className="size-5 text-amber-600" />
                                                    </div>
                                                    <Select
                                                        value={newProduct.category.toString()}
                                                        onValueChange={(value) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                category: Number.parseInt(value),
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                            <SelectItem value="1">Default Category</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="availability" className="text-zinc-400">
                                                    Availability
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Package className="size-5 text-amber-600" />
                                                    </div>
                                                    <Select
                                                        value={newProduct.availability}
                                                        onValueChange={(value) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                availability: value as "in_stock" | "out_of_stock",
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500">
                                                            <SelectValue placeholder="Select availability" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                            <SelectItem value="in_stock">In Stock</SelectItem>
                                                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="car_type" className="text-zinc-400">
                                                    Car Type
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Car className="size-5 text-amber-600" />
                                                    </div>
                                                    <Select
                                                        value={newProduct.car_type}
                                                        onValueChange={(value) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                car_type: value as "classic" | "luxury" | "electrical",
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500">
                                                            <SelectValue placeholder="Select car type" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                            <SelectItem value="classic">Luxury</SelectItem>
                                                            <SelectItem value="luxury">Luxury</SelectItem>
                                                            <SelectItem value="electrical">Electrical</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-zinc-400">
                                                Description
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                                    <FileText className="size-5 text-amber-600" />
                                                </div>
                                                <Textarea
                                                    id="description"
                                                    value={newProduct.description}
                                                    onChange={(e) =>
                                                        setNewProduct({
                                                            ...newProduct,
                                                            description: e.target.value,
                                                        })
                                                    }
                                                    className="pl-10 bg-zinc-800 border-zinc-700 text-white min-h-[120px] focus:border-amber-500"
                                                    placeholder="Enter vehicle description"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="image" className="text-zinc-300 text-sm font-medium mb-1">
                                                Image Upload
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <ImageIcon className="size-5 text-amber-600" />
                                                </div>
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) setNewProduct({ ...newProduct, image: file })
                                                    }}
                                                    required
                                                    className="pl-10 h-10 w-full bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100
                          file:mr-4 file:py-1 file:px-4
                          file:rounded-r-md file:rounded-l-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-amber-700 file:text-amber-100
                          hover:file:bg-amber-600 hover:file:text-amber-50
                          focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                          transition-all
                          placeholder-zinc-500
                          disabled:opacity-50"
                                                    placeholder=" "
                                                />
                                            </div>
                                            <p className="text-sm text-zinc-500 mt-1">Supported formats: PNG, JPG, JPEG (max 5MB)</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="specs" className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <Label htmlFor="engine" className="text-zinc-400">
                                                    Engine
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Gauge className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="engine"
                                                        value={newProduct.engine}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                engine: e.target.value,
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 4.0L Twin-Turbo V8"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="power" className="text-zinc-400">
                                                    Power
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Zap className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="power"
                                                        value={newProduct.power}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                power: e.target.value,
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 496 hp @ 5,500 rpm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="torque" className="text-zinc-400">
                                                    Torque
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Gauge className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="torque"
                                                        value={newProduct.torque}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                torque: e.target.value,
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 700 Nm @ 2,000-4,500 rpm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="transmission" className="text-zinc-400">
                                                    Transmission
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Gauge className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="transmission"
                                                        value={newProduct.transmission}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                transmission: e.target.value,
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 9G-TRONIC 9-Speed Automatic"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="acceleration_0_100" className="text-zinc-400">
                                                    Acceleration (0-100 km/h)
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Clock className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="acceleration_0_100"
                                                        value={newProduct.acceleration_0_100}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                acceleration_0_100: e.target.value,
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 4.3 seconds"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="top_speed" className="text-zinc-400">
                                                    Top Speed
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Gauge className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="top_speed"
                                                        value={newProduct.top_speed}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                top_speed: e.target.value,
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 250 km/h (electronically limited)"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="fuel_economy" className="text-zinc-400">
                                                    Fuel Economy
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Fuel className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="fuel_economy"
                                                        value={newProduct.fuel_economy}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                fuel_economy: e.target.value,
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 10.2 L/100km (combined)"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="dimensions" className="text-zinc-400">
                                                    Dimensions
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Ruler className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="dimensions"
                                                        value={newProduct.dimensions}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                dimensions: e.target.value,
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 5,289 mm × 1,954 mm × 1,503 mm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="weight_kg" className="text-zinc-400">
                                                    Weight (kg)
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Scale className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="weight_kg"
                                                        type="number"
                                                        min="0"
                                                        value={newProduct.weight_kg}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                weight_kg: Number(e.target.value),
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 2065"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="wheelbase_mm" className="text-zinc-400">
                                                    Wheelbase (mm)
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Ruler className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="wheelbase_mm"
                                                        type="number"
                                                        min="0"
                                                        value={newProduct.wheelbase_mm}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                wheelbase_mm: Number(e.target.value),
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 3216"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="fuel_tank_capacity" className="text-zinc-400">
                                                    Fuel Tank Capacity (liters)
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Fuel className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="fuel_tank_capacity"
                                                        type="number"
                                                        min="0"
                                                        value={newProduct.fuel_tank_capacity}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                fuel_tank_capacity: Number(e.target.value),
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 76"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="trunk_capacity_liters" className="text-zinc-400">
                                                    Trunk Capacity (liters)
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Box className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        id="trunk_capacity_liters"
                                                        type="number"
                                                        min="0"
                                                        value={newProduct.trunk_capacity_liters}
                                                        onChange={(e) =>
                                                            setNewProduct({
                                                                ...newProduct,
                                                                trunk_capacity_liters: Number(e.target.value),
                                                            })
                                                        }
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="e.g. 550"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="features" className="space-y-5">
                                        <div>
                                            <Label className="text-zinc-400 block mb-2">Key Features</Label>

                                            <div className="space-y-3 mb-4">
                                                {newProduct.key_features.map((feature, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <Check className="size-5 text-amber-600" />
                                                            </div>
                                                            <Input
                                                                value={feature}
                                                                onChange={(e) => updateKeyFeature(index, e.target.value)}
                                                                className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                                placeholder="Enter a key feature"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => removeKeyFeature(index)}
                                                            className="bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                                                        >
                                                            <X className="size-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Plus className="size-5 text-amber-600" />
                                                    </div>
                                                    <Input
                                                        value={newFeature}
                                                        onChange={(e) => setNewFeature(e.target.value)}
                                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white focus:border-amber-500"
                                                        placeholder="Add a new feature"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addKeyFeature}
                                                    className="bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-amber-200"
                                                >
                                                    Add
                                                </Button>
                                            </div>

                                            <p className="text-sm text-zinc-500 mt-2">Add all the key features of the vehicle</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <Separator className="my-4 bg-zinc-800" />

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    >
                                        <X className="mr-1 size-4" />
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        disabled={addProductMutation.isPending}
                                        className="bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
                                    >
                                        <Plus className="mr-1 size-4" />
                                        {addProductMutation.isPending ? "Adding..." : "Add Vehicle"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {isLoading ? (
                    <div className="w-full p-8 text-center">
                        <div className="inline-block w-12 h-12 border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-zinc-400">Loading vehicles...</p>
                    </div>
                ) : isError ? (
                    <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-start">
                                <AlertCircle className="text-amber-500 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-zinc-300 font-medium mb-1">Failed to load vehicles</h3>
                                    <p className="text-zinc-400">{queryError?.message || "Unknown error"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : products.length > 0 ? (
                    <>
                        {isMobile ? (
                            <div className="space-y-4" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                                {getVisibleProducts().map((product) => (
                                    <div key={product.id} className="transition-all duration-500 ease-in-out">
                                        <Card className="bg-zinc-900 border-zinc-800 shadow-md overflow-hidden h-full flex flex-col hover:border-amber-700 transition-all duration-300">
                                            <div className="relative overflow-hidden bg-zinc-900">
                                                <img
                                                    src={product.image_url || "/placeholder.svg"}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover transition-transform duration-700 hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="size-8 bg-zinc-900/80 hover:bg-zinc-800"
                                                        onClick={() => toggleFavorite(product.id)}
                                                    >
                                                        <Heart
                                                            className={`size-4 ${favorites.includes(product.id) ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`}
                                                        />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="size-8 bg-zinc-900/80 hover:bg-zinc-800"
                                                        onClick={() => toggleBookmark(product.id)}
                                                    >
                                                        <Bookmark
                                                            className={`size-4 ${bookmarks.includes(product.id) ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardContent className="p-5 flex-grow bg-zinc-900">
                                                <h3 className="text-xl font-medium text-white mb-3">{product.name}</h3>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between pb-2 border-b border-zinc-800">
                                                        <span className="text-zinc-500">Price</span>
                                                        <span className="font-medium text-amber-300">${formatPrice(product.price)}</span>
                                                    </div>
                                                    <div className="flex justify-between pb-2 border-b border-zinc-800">
                                                        <span className="text-zinc-500">Stock</span>
                                                        <span className="font-medium text-white">{product.stock_quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between pb-2 border-b border-zinc-800">
                                                        <span className="text-zinc-500">Status</span>
                                                        <span
                                                            className={`font-medium ${product.availability === "in_stock" ? "text-emerald-500" : "text-zinc-400"}`}
                                                        >
                                                            {product.availability === "in_stock" ? "In Stock" : "Out of Stock"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    <Button
                                                        asChild
                                                        variant="secondary"
                                                        className="w-full bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
                                                    >
                                                        <Link to="/cars/$id" params={{ id: product.id.toString() }}>
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                                {getVisibleProducts().map((product) => (
                                    <div key={product.id} className="w-1/3 p-4 transition-all duration-500 ease-in-out">
                                        <Card className="bg-zinc-900 border-zinc-800 shadow-md overflow-hidden h-full flex flex-col hover:border-amber-700 transition-all duration-300">
                                            <div className="relative overflow-hidden bg-zinc-900">
                                                <img
                                                    src={product.image_url || "/placeholder.svg"}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover transition-transform duration-700 hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="size-8 bg-zinc-900/80 hover:bg-zinc-800"
                                                        onClick={() => toggleFavorite(product.id)}
                                                    >
                                                        <Heart
                                                            className={`size-4 ${favorites.includes(product.id) ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`}
                                                        />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="size-8 bg-zinc-900/80 hover:bg-zinc-800"
                                                        onClick={() => toggleBookmark(product.id)}
                                                    >
                                                        <Bookmark
                                                            className={`size-4 ${bookmarks.includes(product.id) ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardContent className="p-5 flex-grow bg-zinc-900">
                                                <h3 className="text-xl font-medium text-white mb-3">{product.name}</h3>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between pb-2 border-b border-zinc-800">
                                                        <span className="text-zinc-500">Price</span>
                                                        <span className="font-medium text-amber-300">${formatPrice(product.price)}</span>
                                                    </div>
                                                    <div className="flex justify-between pb-2 border-b border-zinc-800">
                                                        <span className="text-zinc-500">Stock</span>
                                                        <span className="font-medium text-white">{product.stock_quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between pb-2 border-b border-zinc-800">
                                                        <span className="text-zinc-500">Status</span>
                                                        <span
                                                            className={`font-medium ${product.availability === "in_stock" ? "text-emerald-500" : "text-zinc-400"}`}
                                                        >
                                                            {product.availability === "in_stock" ? "In Stock" : "Out of Stock"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    <Button
                                                        asChild
                                                        variant="secondary"
                                                        className="w-full bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
                                                    >
                                                        <Link to="/cars/$id" params={{ id: product.id.toString() }}>
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-center mt-8">
                            <Button
                                onClick={() => rotateProducts("prev")}
                                variant="outline"
                                size="icon"
                                className="rounded-full mr-4 text-amber-500 hover:bg-amber-900/30 hover:text-amber-300"
                                aria-label="Previous"
                            >
                                <ChevronLeft className="size-5" />
                            </Button>
                            <Button
                                onClick={() => rotateProducts("next")}
                                variant="outline"
                                size="icon"
                                className="rounded-full text-amber-500 hover:bg-amber-900/30 hover:text-amber-300"
                                aria-label="Next"
                            >
                                <ChevronRight className="size-5" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <Card className="bg-zinc-900 border-zinc-800 shadow-md text-center py-12">
                        <CardContent>
                            <div className="w-16 h-16 mx-auto mb-4 opacity-20">
                                <Gauge className="w-full h-full text-amber-500" />
                            </div>
                            <p className="text-zinc-400">No vehicles available at this time.</p>
                            <p className="text-zinc-500 text-sm mt-2">Check back later for our exclusive collection.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export const Route = createFileRoute("/cars/luxuryCars")({
    component: LuxuryCars,
})

