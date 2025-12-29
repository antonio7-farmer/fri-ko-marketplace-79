export type UserRole = 'buyer' | 'seller' | 'farmer' | 'admin'
export type StockStatus = 'available' | 'low' | 'out'
export type ProductCategory = 'voce' | 'povrce' | 'meso' | 'jaja' | 'mlijecni' | 'ostalo'
export type SubscriptionTier = 'free' | 'farmer'

export interface Profile {
  id: string
  role: UserRole
  display_name: string
  avatar_url?: string
  cover_url?: string
  bio?: string
  location_lat?: number
  location_lng?: number
  location_address?: string
  rating: number
  verified: boolean
  farm_pictures?: string[]
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  tier: SubscriptionTier
  expires_at?: string
  created_at: string
}

export interface Product {
  id: string
  seller_id: string
  title: string
  description?: string
  price: number
  unit: string
  category: ProductCategory
  image_url?: string
  stock_status: StockStatus
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  product_id?: string
  content: string
  read: boolean
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  seller_id: string
  created_at: string
}

export interface Reservation {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  unit: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  message?: string
  created_at: string
  updated_at: string
}
