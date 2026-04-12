export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          slug: string | null;
          description: string | null;
          category: string;
          image_url: string | null;
          price: number;
          stock: number;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug?: string | null;
          description?: string | null;
          category?: string;
          image_url?: string | null;
          price: number;
          stock?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string | null;
          description?: string | null;
          category?: string;
          image_url?: string | null;
          price?: number;
          stock?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          role: "customer" | "staff" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "staff" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "staff" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          guest_email: string | null;
          status: string;
          currency: string;
          subtotal: number;
          discount: number;
          shipping_amount: number;
          premium_gifting_fee: number;
          total_amount: number;
          promo_code: string | null;
          payment_provider: string;
          payment_status: string;
          payment_reference: string | null;
          razorpay_payment_id: string | null;
          payment_signature: string | null;
          paid_at: string | null;
          confirmation_email_sent_at: string | null;
          shipping_address: Json;
          line_items: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          status?: string;
          currency?: string;
          subtotal: number;
          discount?: number;
          shipping_amount?: number;
          premium_gifting_fee?: number;
          total_amount: number;
          promo_code?: string | null;
          payment_provider?: string;
          payment_status?: string;
          payment_reference?: string | null;
          razorpay_payment_id?: string | null;
          payment_signature?: string | null;
          paid_at?: string | null;
          confirmation_email_sent_at?: string | null;
          shipping_address: Json;
          line_items: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          status?: string;
          currency?: string;
          subtotal?: number;
          discount?: number;
          shipping_amount?: number;
          premium_gifting_fee?: number;
          total_amount?: number;
          promo_code?: string | null;
          payment_provider?: string;
          payment_status?: string;
          payment_reference?: string | null;
          razorpay_payment_id?: string | null;
          payment_signature?: string | null;
          paid_at?: string | null;
          confirmation_email_sent_at?: string | null;
          shipping_address?: Json;
          line_items?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          is_verified_purchase: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          is_verified_purchase?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          is_verified_purchase?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      returns: {
        Row: {
          id: string;
          order_id: string;
          user_id: string | null;
          reason: string;
          status: string;
          refund_amount: number | null;
          details: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id?: string | null;
          reason: string;
          status?: string;
          refund_amount?: number | null;
          details?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string | null;
          reason?: string;
          status?: string;
          refund_amount?: number | null;
          details?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_orders: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          vision: string;
          color_palette: string[];
          palette_notes: string | null;
          reference_image_path: string | null;
          reference_image_url: string | null;
          status: "todo" | "in_progress" | "review" | "shipped";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          vision: string;
          color_palette?: string[];
          palette_notes?: string | null;
          reference_image_path?: string | null;
          reference_image_url?: string | null;
          status?: "todo" | "in_progress" | "review" | "shipped";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string;
          vision?: string;
          color_palette?: string[];
          palette_notes?: string | null;
          reference_image_path?: string | null;
          reference_image_url?: string | null;
          status?: "todo" | "in_progress" | "review" | "shipped";
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_events: {
        Row: {
          id: number;
          event_fingerprint: string;
          order_id: string | null;
          provider: string;
          event_type: string;
          payment_id: string | null;
          provider_order_id: string | null;
          payload: Json;
          processing_status: string;
          created_at: string;
          processed_at: string;
        };
        Insert: {
          id?: number;
          event_fingerprint: string;
          order_id?: string | null;
          provider?: string;
          event_type: string;
          payment_id?: string | null;
          provider_order_id?: string | null;
          payload?: Json;
          processing_status?: string;
          created_at?: string;
          processed_at?: string;
        };
        Update: {
          id?: number;
          event_fingerprint?: string;
          order_id?: string | null;
          provider?: string;
          event_type?: string;
          payment_id?: string | null;
          provider_order_id?: string | null;
          payload?: Json;
          processing_status?: string;
          created_at?: string;
          processed_at?: string;
        };
      };
    };
  };
}