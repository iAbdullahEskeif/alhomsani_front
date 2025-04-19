export interface ActivityItem {
    id: number;
    profile: number;
    product: number;
    action: "purchase" | "view" | "bookmark" | "favorite";
    timestamp: string;
    details?: string;
}

export interface ActivityResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ActivityItem[];
}

export interface Profile {
    user: number;
    name: string;
    location: string;
    contact_info: string;
    bio: string;
    profile_picture: File | string | null;
    profile_picture_url: string;
    favorite_cars: number[];
    bookmarked_cars: number[];
    activity_log?: ActivityItem[];
    member_since: string;
}

export interface PaymentSearchParams {
    payment_intent?: string;
    payment_intent_client_secret?: string;
}

export interface OrderDetails {
    success: boolean;
    order_id: string;
    amount: number;
    car_name?: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    stock_quantity: number;
    sku: string;
    category: number;
    availability: "in_stock" | "out_of_stock";
    car_type: "classic" | "luxury" | "electrical";
    created_at: string;
    updated_at: string;
    image: File | string | null | undefined;
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

export interface ContactFormState {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export interface Review {
    id: number;
    reviewer: string;
    reviewer_id: number;
    car: number;
    review: string;
    reviewer_Profile_pic: string;
    time_written: string;
}


export interface StripeComponentProps {
    carId: number;
    quantity: number;
}

export interface PaymentIntentResponse {
    client_secret: string;
}

export interface GalleryItem {
    name: string;
    path: string;
}

export interface Gallery {
    title: string;
    items: GalleryItem[];
}

export interface CreatePaymentIntentParams {
    getToken: () => Promise<string | null>;
    API_URL: string;
    carId: number;
    quantity: number;
}
