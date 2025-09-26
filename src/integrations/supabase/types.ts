export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_content: {
        Row: {
          about_chef_info: string | null
          about_mission: string | null
          about_page_about_section_image_url: string | null
          about_page_content: Json | null
          about_page_hero_background_url: string | null
          about_page_hero_description: string | null
          about_page_hero_title: string | null
          about_page_hero_title_first_line: string | null
          about_page_hero_title_second_line: string | null
          about_story: string | null
          about_team_section_description: string | null
          about_team_section_title_first_line: string | null
          about_team_section_title_second_line: string | null
          client_id: string
          contact_page_hero_background_url: string | null
          contact_page_hero_description: string | null
          contact_page_hero_title: string | null
          contact_page_hero_title_first_line: string | null
          contact_page_hero_title_second_line: string | null
          created_at: string
          footer_description: string | null
          footer_logo_url: string | null
          header_logo_url: string | null
          homepage_about_section_description: string | null
          homepage_about_section_image_url: string | null
          homepage_about_section_title: string | null
          homepage_about_section_title_first_line: string | null
          homepage_about_section_title_second_line: string | null
          homepage_contact_hide_reservation_box: boolean | null
          homepage_contact_section_description: string | null
          homepage_contact_section_title: string | null
          homepage_contact_section_title_first_line: string | null
          homepage_contact_section_title_second_line: string | null
          homepage_delivery_section_description: string | null
          homepage_delivery_section_title: string | null
          homepage_hero_background_url: string | null
          homepage_hero_description: string | null
          homepage_hero_right_button_link: string | null
          homepage_hero_right_button_text: string | null
          homepage_hero_title: string | null
          homepage_hero_title_first_line: string | null
          homepage_hero_title_second_line: string | null
          homepage_menu_section_description: string | null
          homepage_menu_section_title: string | null
          homepage_menu_section_title_first_line: string | null
          homepage_menu_section_title_second_line: string | null
          homepage_services_section_description: string | null
          homepage_services_section_title: string | null
          homepage_services_section_title_first_line: string | null
          homepage_services_section_title_second_line: string | null
          id: string
          menu_page_hero_background_url: string | null
          menu_page_hero_description: string | null
          menu_page_hero_title: string | null
          menu_page_hero_title_first_line: string | null
          menu_page_hero_title_second_line: string | null
          reviews_page_hero_background_url: string | null
          reviews_page_hero_description: string | null
          reviews_page_hero_title: string | null
          reviews_page_hero_title_first_line: string | null
          reviews_page_hero_title_second_line: string | null
          reviews_section_title_first_line: string | null
          reviews_section_title_second_line: string | null
          services_card1_button_link: string | null
          services_card1_button_text: string | null
          services_card1_description: string | null
          services_card1_icon: string | null
          services_card1_title: string | null
          services_card2_button_link: string | null
          services_card2_button_text: string | null
          services_card2_description: string | null
          services_card2_icon: string | null
          services_card2_title: string | null
          services_card3_button_link: string | null
          services_card3_button_text: string | null
          services_card3_description: string | null
          services_card3_icon: string | null
          services_card3_title: string | null
          services_feature1_icon: string | null
          services_feature1_text: string | null
          services_feature2_icon: string | null
          services_feature2_text: string | null
          services_feature3_icon: string | null
          services_feature3_text: string | null
          stats_awards_label: string | null
          stats_awards_number: string | null
          stats_clients_label: string | null
          stats_clients_number: string | null
          stats_experience_label: string | null
          stats_experience_number: string | null
          stats_item1_icon: string | null
          stats_item1_label: string | null
          stats_item1_number: string | null
          stats_item2_icon: string | null
          stats_item2_label: string | null
          stats_item2_number: string | null
          stats_item3_icon: string | null
          stats_item3_label: string | null
          stats_item3_number: string | null
          updated_at: string
        }
        Insert: {
          about_chef_info?: string | null
          about_mission?: string | null
          about_page_about_section_image_url?: string | null
          about_page_content?: Json | null
          about_page_hero_background_url?: string | null
          about_page_hero_description?: string | null
          about_page_hero_title?: string | null
          about_page_hero_title_first_line?: string | null
          about_page_hero_title_second_line?: string | null
          about_story?: string | null
          about_team_section_description?: string | null
          about_team_section_title_first_line?: string | null
          about_team_section_title_second_line?: string | null
          client_id: string
          contact_page_hero_background_url?: string | null
          contact_page_hero_description?: string | null
          contact_page_hero_title?: string | null
          contact_page_hero_title_first_line?: string | null
          contact_page_hero_title_second_line?: string | null
          created_at?: string
          footer_description?: string | null
          footer_logo_url?: string | null
          header_logo_url?: string | null
          homepage_about_section_description?: string | null
          homepage_about_section_image_url?: string | null
          homepage_about_section_title?: string | null
          homepage_about_section_title_first_line?: string | null
          homepage_about_section_title_second_line?: string | null
          homepage_contact_hide_reservation_box?: boolean | null
          homepage_contact_section_description?: string | null
          homepage_contact_section_title?: string | null
          homepage_contact_section_title_first_line?: string | null
          homepage_contact_section_title_second_line?: string | null
          homepage_delivery_section_description?: string | null
          homepage_delivery_section_title?: string | null
          homepage_hero_background_url?: string | null
          homepage_hero_description?: string | null
          homepage_hero_right_button_link?: string | null
          homepage_hero_right_button_text?: string | null
          homepage_hero_title?: string | null
          homepage_hero_title_first_line?: string | null
          homepage_hero_title_second_line?: string | null
          homepage_menu_section_description?: string | null
          homepage_menu_section_title?: string | null
          homepage_menu_section_title_first_line?: string | null
          homepage_menu_section_title_second_line?: string | null
          homepage_services_section_description?: string | null
          homepage_services_section_title?: string | null
          homepage_services_section_title_first_line?: string | null
          homepage_services_section_title_second_line?: string | null
          id?: string
          menu_page_hero_background_url?: string | null
          menu_page_hero_description?: string | null
          menu_page_hero_title?: string | null
          menu_page_hero_title_first_line?: string | null
          menu_page_hero_title_second_line?: string | null
          reviews_page_hero_background_url?: string | null
          reviews_page_hero_description?: string | null
          reviews_page_hero_title?: string | null
          reviews_page_hero_title_first_line?: string | null
          reviews_page_hero_title_second_line?: string | null
          reviews_section_title_first_line?: string | null
          reviews_section_title_second_line?: string | null
          services_card1_button_link?: string | null
          services_card1_button_text?: string | null
          services_card1_description?: string | null
          services_card1_icon?: string | null
          services_card1_title?: string | null
          services_card2_button_link?: string | null
          services_card2_button_text?: string | null
          services_card2_description?: string | null
          services_card2_icon?: string | null
          services_card2_title?: string | null
          services_card3_button_link?: string | null
          services_card3_button_text?: string | null
          services_card3_description?: string | null
          services_card3_icon?: string | null
          services_card3_title?: string | null
          services_feature1_icon?: string | null
          services_feature1_text?: string | null
          services_feature2_icon?: string | null
          services_feature2_text?: string | null
          services_feature3_icon?: string | null
          services_feature3_text?: string | null
          stats_awards_label?: string | null
          stats_awards_number?: string | null
          stats_clients_label?: string | null
          stats_clients_number?: string | null
          stats_experience_label?: string | null
          stats_experience_number?: string | null
          stats_item1_icon?: string | null
          stats_item1_label?: string | null
          stats_item1_number?: string | null
          stats_item2_icon?: string | null
          stats_item2_label?: string | null
          stats_item2_number?: string | null
          stats_item3_icon?: string | null
          stats_item3_label?: string | null
          stats_item3_number?: string | null
          updated_at?: string
        }
        Update: {
          about_chef_info?: string | null
          about_mission?: string | null
          about_page_about_section_image_url?: string | null
          about_page_content?: Json | null
          about_page_hero_background_url?: string | null
          about_page_hero_description?: string | null
          about_page_hero_title?: string | null
          about_page_hero_title_first_line?: string | null
          about_page_hero_title_second_line?: string | null
          about_story?: string | null
          about_team_section_description?: string | null
          about_team_section_title_first_line?: string | null
          about_team_section_title_second_line?: string | null
          client_id?: string
          contact_page_hero_background_url?: string | null
          contact_page_hero_description?: string | null
          contact_page_hero_title?: string | null
          contact_page_hero_title_first_line?: string | null
          contact_page_hero_title_second_line?: string | null
          created_at?: string
          footer_description?: string | null
          footer_logo_url?: string | null
          header_logo_url?: string | null
          homepage_about_section_description?: string | null
          homepage_about_section_image_url?: string | null
          homepage_about_section_title?: string | null
          homepage_about_section_title_first_line?: string | null
          homepage_about_section_title_second_line?: string | null
          homepage_contact_hide_reservation_box?: boolean | null
          homepage_contact_section_description?: string | null
          homepage_contact_section_title?: string | null
          homepage_contact_section_title_first_line?: string | null
          homepage_contact_section_title_second_line?: string | null
          homepage_delivery_section_description?: string | null
          homepage_delivery_section_title?: string | null
          homepage_hero_background_url?: string | null
          homepage_hero_description?: string | null
          homepage_hero_right_button_link?: string | null
          homepage_hero_right_button_text?: string | null
          homepage_hero_title?: string | null
          homepage_hero_title_first_line?: string | null
          homepage_hero_title_second_line?: string | null
          homepage_menu_section_description?: string | null
          homepage_menu_section_title?: string | null
          homepage_menu_section_title_first_line?: string | null
          homepage_menu_section_title_second_line?: string | null
          homepage_services_section_description?: string | null
          homepage_services_section_title?: string | null
          homepage_services_section_title_first_line?: string | null
          homepage_services_section_title_second_line?: string | null
          id?: string
          menu_page_hero_background_url?: string | null
          menu_page_hero_description?: string | null
          menu_page_hero_title?: string | null
          menu_page_hero_title_first_line?: string | null
          menu_page_hero_title_second_line?: string | null
          reviews_page_hero_background_url?: string | null
          reviews_page_hero_description?: string | null
          reviews_page_hero_title?: string | null
          reviews_page_hero_title_first_line?: string | null
          reviews_page_hero_title_second_line?: string | null
          reviews_section_title_first_line?: string | null
          reviews_section_title_second_line?: string | null
          services_card1_button_link?: string | null
          services_card1_button_text?: string | null
          services_card1_description?: string | null
          services_card1_icon?: string | null
          services_card1_title?: string | null
          services_card2_button_link?: string | null
          services_card2_button_text?: string | null
          services_card2_description?: string | null
          services_card2_icon?: string | null
          services_card2_title?: string | null
          services_card3_button_link?: string | null
          services_card3_button_text?: string | null
          services_card3_description?: string | null
          services_card3_icon?: string | null
          services_card3_title?: string | null
          services_feature1_icon?: string | null
          services_feature1_text?: string | null
          services_feature2_icon?: string | null
          services_feature2_text?: string | null
          services_feature3_icon?: string | null
          services_feature3_text?: string | null
          stats_awards_label?: string | null
          stats_awards_number?: string | null
          stats_clients_label?: string | null
          stats_clients_number?: string | null
          stats_experience_label?: string | null
          stats_experience_number?: string | null
          stats_item1_icon?: string | null
          stats_item1_label?: string | null
          stats_item1_number?: string | null
          stats_item2_icon?: string | null
          stats_item2_label?: string | null
          stats_item2_number?: string | null
          stats_item3_icon?: string | null
          stats_item3_label?: string | null
          stats_item3_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_content_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_settings: {
        Row: {
          client_id: string
          created_at: string
          delivery_info: Json | null
          header_background_enabled: boolean | null
          header_background_style: string | null
          id: string
          layout_type: string | null
          other_customizations: Json | null
          primary_button_text_style: string | null
          primary_color: string | null
          updated_at: string
          whatsapp_messages: Json | null
        }
        Insert: {
          client_id: string
          created_at?: string
          delivery_info?: Json | null
          header_background_enabled?: boolean | null
          header_background_style?: string | null
          id?: string
          layout_type?: string | null
          other_customizations?: Json | null
          primary_button_text_style?: string | null
          primary_color?: string | null
          updated_at?: string
          whatsapp_messages?: Json | null
        }
        Update: {
          client_id?: string
          created_at?: string
          delivery_info?: Json | null
          header_background_enabled?: boolean | null
          header_background_style?: string | null
          id?: string
          layout_type?: string | null
          other_customizations?: Json | null
          primary_button_text_style?: string | null
          primary_color?: string | null
          updated_at?: string
          whatsapp_messages?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "client_settings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          brand_colors: Json | null
          coordinates: Json | null
          created_at: string
          delivery: Json | null
          email: string | null
          id: string
          opening_hours: Json | null
          opening_hours_ordered: Json | null
          other_customizations: Json | null
          phone: string | null
          restaurant_name: string
          social_media_links: Json | null
          subdomain: string
          theme: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          brand_colors?: Json | null
          coordinates?: Json | null
          created_at?: string
          delivery?: Json | null
          email?: string | null
          id?: string
          opening_hours?: Json | null
          opening_hours_ordered?: Json | null
          other_customizations?: Json | null
          phone?: string | null
          restaurant_name: string
          social_media_links?: Json | null
          subdomain: string
          theme?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          brand_colors?: Json | null
          coordinates?: Json | null
          created_at?: string
          delivery?: Json | null
          email?: string | null
          id?: string
          opening_hours?: Json | null
          opening_hours_ordered?: Json | null
          other_customizations?: Json | null
          phone?: string | null
          restaurant_name?: string
          social_media_links?: Json | null
          subdomain?: string
          theme?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      content_gaps: {
        Row: {
          analysis_date: string
          article_id: string | null
          category: string
          created_at: string
          id: string
          priority_score: number
          status: string
          target_keywords: string[]
          topic: string
          updated_at: string
        }
        Insert: {
          analysis_date?: string
          article_id?: string | null
          category: string
          created_at?: string
          id?: string
          priority_score?: number
          status?: string
          target_keywords?: string[]
          topic: string
          updated_at?: string
        }
        Update: {
          analysis_date?: string
          article_id?: string | null
          category?: string
          created_at?: string
          id?: string
          priority_score?: number
          status?: string
          target_keywords?: string[]
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_gaps_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "generated_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_articles: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string
          featured: boolean
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          keywords: string[]
          meta_description: string
          publish_date: string | null
          reading_time: number
          related_articles: string[] | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          featured?: boolean
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[]
          meta_description: string
          publish_date?: string | null
          reading_time?: number
          related_articles?: string[] | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured?: boolean
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[]
          meta_description?: string
          publish_date?: string | null
          reading_time?: number
          related_articles?: string[] | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      generation_logs: {
        Row: {
          article_id: string | null
          content_gap_id: string | null
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          processing_time_ms: number | null
          status: string
          type: string
        }
        Insert: {
          article_id?: string | null
          content_gap_id?: string | null
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          status: string
          type: string
        }
        Update: {
          article_id?: string | null
          content_gap_id?: string | null
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_logs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "generated_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_logs_content_gap_id_fkey"
            columns: ["content_gap_id"]
            isOneToOne: false
            referencedRelation: "content_gaps"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          client_id: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string
          client_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          show_image_home: boolean | null
          show_image_menu: boolean | null
          show_on_homepage: boolean | null
          updated_at: string
        }
        Insert: {
          category: string
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          show_image_home?: boolean | null
          show_image_menu?: boolean | null
          show_on_homepage?: boolean | null
          updated_at?: string
        }
        Update: {
          category?: string
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          show_image_home?: boolean | null
          show_image_menu?: boolean | null
          show_on_homepage?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          review_text: string
          reviewer_name: string
          star_rating: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          review_text: string
          reviewer_name: string
          star_rating: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          review_text?: string
          reviewer_name?: string
          star_rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      target_keywords: {
        Row: {
          category: string
          covered_by_article_id: string | null
          created_at: string
          difficulty: number | null
          id: string
          is_covered: boolean
          keyword: string
          priority: number
          search_volume: number | null
          updated_at: string
        }
        Insert: {
          category: string
          covered_by_article_id?: string | null
          created_at?: string
          difficulty?: number | null
          id?: string
          is_covered?: boolean
          keyword: string
          priority?: number
          search_volume?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          covered_by_article_id?: string | null
          created_at?: string
          difficulty?: number | null
          id?: string
          is_covered?: boolean
          keyword?: string
          priority?: number
          search_volume?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "target_keywords_covered_by_article_id_fkey"
            columns: ["covered_by_article_id"]
            isOneToOne: false
            referencedRelation: "generated_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string | null
          client_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          client_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          title: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          client_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_clients: {
        Row: {
          client_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_opening_hours_ordered: {
        Args: { opening_hours_obj: Json }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      link_user_to_client: {
        Args: { client_uuid: string; user_email: string; user_role?: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "client_owner" | "client_user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client_owner", "client_user"],
    },
  },
} as const
