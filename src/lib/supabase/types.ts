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
          story: string | null;
          category: string;
          image_url: string | null;
          price: number;
          compare_at_price: number | null;
          stock: number;
          is_active: boolean;
          is_archived: boolean;
          is_customisable: boolean;
          customisable_fields: Json | null;
          product_type: "standard" | "cap" | "apparel" | "bag" | "journal" | "frame" | "resin" | "badge" | "stationery" | "digital" | null;
          customisation_surcharge: number;
          tags: string[] | null;
          meta_title: string | null;
          meta_description: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug?: string | null;
          description?: string | null;
          story?: string | null;
          category?: string;
          image_url?: string | null;
          price: number;
          compare_at_price?: number | null;
          stock?: number;
          is_active?: boolean;
          is_archived?: boolean;
          is_customisable?: boolean;
          customisable_fields?: Json | null;
          product_type?: "standard" | "cap" | "apparel" | "bag" | "journal" | "frame" | "resin" | "badge" | "stationery" | "digital" | null;
          customisation_surcharge?: number;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string | null;
          description?: string | null;
          story?: string | null;
          category?: string;
          image_url?: string | null;
          price?: number;
          compare_at_price?: number | null;
          stock?: number;
          is_active?: boolean;
          is_archived?: boolean;
          is_customisable?: boolean;
          customisable_fields?: Json | null;
          product_type?: "standard" | "cap" | "apparel" | "bag" | "journal" | "frame" | "resin" | "badge" | "stationery" | "digital" | null;
          customisation_surcharge?: number;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
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
          default_shipping_address: Json;
          role: "customer" | "staff" | "admin" | "wholesale";
          is_first_login: boolean;
          welcome_email_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          default_shipping_address?: Json;
          role?: "customer" | "staff" | "admin" | "wholesale";
          is_first_login?: boolean;
          welcome_email_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          default_shipping_address?: Json;
          role?: "customer" | "staff" | "admin" | "wholesale";
          is_first_login?: boolean;
          welcome_email_sent?: boolean;
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
          tracking_number: string | null;
          is_gift: boolean;
          gift_message: string | null;
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
          tracking_number?: string | null;
          is_gift?: boolean;
          gift_message?: string | null;
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
          tracking_number?: string | null;
          is_gift?: boolean;
          gift_message?: string | null;
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
          title: string | null;
          comment: string | null;
          is_verified_purchase: boolean;
          is_verified: boolean;
          is_approved: boolean;
          admin_reply: string | null;
          admin_reply_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          title?: string | null;
          comment?: string | null;
          is_verified_purchase?: boolean;
          is_verified?: boolean;
          is_approved?: boolean;
          admin_reply?: string | null;
          admin_reply_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          rating?: number;
          title?: string | null;
          comment?: string | null;
          is_verified_purchase?: boolean;
          is_verified?: boolean;
          is_approved?: boolean;
          admin_reply?: string | null;
          admin_reply_at?: string | null;
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
          dimensions: Json | null;
          reference_images: Json | null;
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
          dimensions?: Json | null;
          reference_images?: Json | null;
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
          dimensions?: Json | null;
          reference_images?: Json | null;
          reference_image_path?: string | null;
          reference_image_url?: string | null;
          status?: "todo" | "in_progress" | "review" | "shipped";
          created_at?: string;
          updated_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          source: string;
          status: "subscribed" | "unsubscribed";
          metadata: Json;
          subscribed_at: string;
          unsubscribed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          status?: "subscribed" | "unsubscribed";
          metadata?: Json;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: string;
          status?: "subscribed" | "unsubscribed";
          metadata?: Json;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      discount_codes: {
        Row: {
          id: string;
          code: string;
          type: "percent" | "flat";
          value: number;
          min_order: number;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: "percent" | "flat";
          value: number;
          min_order?: number;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: "percent" | "flat";
          value?: number;
          min_order?: number;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      gift_cards: {
        Row: {
          id: string;
          code: string;
          initial_value: number;
          remaining_value: number;
          purchased_by: string | null;
          recipient_email: string;
          expires_at: string | null;
          is_redeemed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          initial_value: number;
          remaining_value: number;
          purchased_by?: string | null;
          recipient_email: string;
          expires_at?: string | null;
          is_redeemed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          initial_value?: number;
          remaining_value?: number;
          purchased_by?: string | null;
          recipient_email?: string;
          expires_at?: string | null;
          is_redeemed?: boolean;
          created_at?: string;
        };
      };
      abandoned_carts: {
        Row: {
          id: string;
          user_id: string | null;
          guest_email: string | null;
          items: Json;
          email_sent: boolean;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          items?: Json;
          email_sent?: boolean;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          items?: Json;
          email_sent?: boolean;
          updated_at?: string;
          created_at?: string;
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