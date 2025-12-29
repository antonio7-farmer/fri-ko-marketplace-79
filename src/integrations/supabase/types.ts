export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string
          user_id: string
          seller_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          seller_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          seller_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          product_id: string | null
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          product_id?: string | null
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          product_id?: string | null
          content?: string
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string | null
          price: number
          unit: string
          category: 'voce' | 'povrce' | 'meso' | 'jaja' | 'mlijecni' | 'ostalo'
          image_url: string | null
          stock_status: 'available' | 'low' | 'out'
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description?: string | null
          price: number
          unit: string
          category: 'voce' | 'povrce' | 'meso' | 'jaja' | 'mlijecni' | 'ostalo'
          image_url?: string | null
          stock_status?: 'available' | 'low' | 'out'
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string | null
          price?: number
          unit?: string
          category?: 'voce' | 'povrce' | 'meso' | 'jaja' | 'mlijecni' | 'ostalo'
          image_url?: string | null
          stock_status?: 'available' | 'low' | 'out'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          role: 'buyer' | 'seller' | 'farmer' | 'admin'
          display_name: string
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          location_lat: number | null
          location_lng: number | null
          location_address: string | null
          rating: number
          verified: boolean
          farm_pictures: string[] | null
          created_at: string
        }
        Insert: {
          id: string
          role?: 'buyer' | 'seller' | 'farmer' | 'admin'
          display_name: string
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          rating?: number
          verified?: boolean
          farm_pictures?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'buyer' | 'seller' | 'farmer' | 'admin'
          display_name?: string
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          rating?: number
          verified?: boolean
          farm_pictures?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          product_id: string
          quantity: number
          unit: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          product_id: string
          quantity: number
          unit: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          product_id?: string
          quantity?: number
          unit?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_buyer_id_fkey"
            columns: ["buyer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'farmer'
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier?: 'free' | 'farmer'
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'farmer'
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
