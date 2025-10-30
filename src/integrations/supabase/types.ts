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
          about_page_about_section_visible: boolean | null
          about_page_about_stats_visible: boolean | null
          about_page_content: Json | null
          about_page_hero_background_url: string | null
          about_page_hero_description: string | null
          about_page_hero_title: string | null
          about_page_hero_title_first_line: string | null
          about_page_hero_title_second_line: string | null
          about_page_stats_section_visible: boolean | null
          about_page_team_section_visible: boolean | null
          about_story: string | null
          about_team_section_description: string | null
          about_team_section_title_first_line: string | null
          about_team_section_title_second_line: string | null
          about_us_label: string | null
          ai_color_palette: string | null
          ai_image_mood: string | null
          ai_image_style: string | null
          carousel_display_order: number | null
          carousel_enabled: boolean | null
          client_id: string
          contact_delivery_briefing: string | null
          contact_page_contact_section_visible: boolean | null
          contact_page_hero_background_url: string | null
          contact_page_hero_description: string | null
          contact_page_hero_title: string | null
          contact_page_hero_title_first_line: string | null
          contact_page_hero_title_second_line: string | null
          contact_page_map_visible: boolean | null
          contact_reservation_description: string | null
          contact_reservation_title: string | null
          contact_us_label: string | null
          content_briefing: string | null
          created_at: string
          culinary_masterpieces_label: string | null
          detected_image_style: Json | null
          downloadable_menu_url: string | null
          footer_description: string | null
          footer_logo_url: string | null
          header_logo_url: string | null
          homepage_about_section_description: string | null
          homepage_about_section_image_url: string | null
          homepage_about_section_title: string | null
          homepage_about_section_title_first_line: string | null
          homepage_about_section_title_second_line: string | null
          homepage_about_section_visible: boolean | null
          homepage_about_stats_visible: boolean | null
          homepage_contact_hide_reservation_box: boolean | null
          homepage_contact_map_visible: boolean | null
          homepage_contact_section_description: string | null
          homepage_contact_section_title: string | null
          homepage_contact_section_title_first_line: string | null
          homepage_contact_section_title_second_line: string | null
          homepage_contact_section_visible: boolean | null
          homepage_cta_button1_link: string | null
          homepage_cta_button1_text: string | null
          homepage_cta_button2_link: string | null
          homepage_cta_button2_text: string | null
          homepage_cta_description: string | null
          homepage_cta_title: string | null
          homepage_delivery_section_description: string | null
          homepage_delivery_section_title: string | null
          homepage_delivery_section_visible: boolean | null
          homepage_faq_section_visible: boolean | null
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
          homepage_menu_section_visible: boolean | null
          homepage_reservations_section_visible: boolean | null
          homepage_reviews_section_visible: boolean | null
          homepage_services_section_description: string | null
          homepage_services_section_title: string | null
          homepage_services_section_title_first_line: string | null
          homepage_services_section_title_second_line: string | null
          homepage_services_section_visible: boolean | null
          id: string
          image_preference: string | null
          menu_page_hero_background_url: string | null
          menu_page_hero_description: string | null
          menu_page_hero_title: string | null
          menu_page_hero_title_first_line: string | null
          menu_page_hero_title_second_line: string | null
          our_menu_label: string | null
          our_services_label: string | null
          our_story_label: string | null
          our_team_label: string | null
          reviews_page_hero_background_url: string | null
          reviews_page_hero_description: string | null
          reviews_page_hero_title: string | null
          reviews_page_hero_title_first_line: string | null
          reviews_page_hero_title_second_line: string | null
          reviews_section_description: string | null
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
          style_briefing: string | null
          testimonials_label: string | null
          updated_at: string
          whatsapp_general_message: string | null
          whatsapp_reservation_message: string | null
        }
        Insert: {
          about_chef_info?: string | null
          about_mission?: string | null
          about_page_about_section_image_url?: string | null
          about_page_about_section_visible?: boolean | null
          about_page_about_stats_visible?: boolean | null
          about_page_content?: Json | null
          about_page_hero_background_url?: string | null
          about_page_hero_description?: string | null
          about_page_hero_title?: string | null
          about_page_hero_title_first_line?: string | null
          about_page_hero_title_second_line?: string | null
          about_page_stats_section_visible?: boolean | null
          about_page_team_section_visible?: boolean | null
          about_story?: string | null
          about_team_section_description?: string | null
          about_team_section_title_first_line?: string | null
          about_team_section_title_second_line?: string | null
          about_us_label?: string | null
          ai_color_palette?: string | null
          ai_image_mood?: string | null
          ai_image_style?: string | null
          carousel_display_order?: number | null
          carousel_enabled?: boolean | null
          client_id: string
          contact_delivery_briefing?: string | null
          contact_page_contact_section_visible?: boolean | null
          contact_page_hero_background_url?: string | null
          contact_page_hero_description?: string | null
          contact_page_hero_title?: string | null
          contact_page_hero_title_first_line?: string | null
          contact_page_hero_title_second_line?: string | null
          contact_page_map_visible?: boolean | null
          contact_reservation_description?: string | null
          contact_reservation_title?: string | null
          contact_us_label?: string | null
          content_briefing?: string | null
          created_at?: string
          culinary_masterpieces_label?: string | null
          detected_image_style?: Json | null
          downloadable_menu_url?: string | null
          footer_description?: string | null
          footer_logo_url?: string | null
          header_logo_url?: string | null
          homepage_about_section_description?: string | null
          homepage_about_section_image_url?: string | null
          homepage_about_section_title?: string | null
          homepage_about_section_title_first_line?: string | null
          homepage_about_section_title_second_line?: string | null
          homepage_about_section_visible?: boolean | null
          homepage_about_stats_visible?: boolean | null
          homepage_contact_hide_reservation_box?: boolean | null
          homepage_contact_map_visible?: boolean | null
          homepage_contact_section_description?: string | null
          homepage_contact_section_title?: string | null
          homepage_contact_section_title_first_line?: string | null
          homepage_contact_section_title_second_line?: string | null
          homepage_contact_section_visible?: boolean | null
          homepage_cta_button1_link?: string | null
          homepage_cta_button1_text?: string | null
          homepage_cta_button2_link?: string | null
          homepage_cta_button2_text?: string | null
          homepage_cta_description?: string | null
          homepage_cta_title?: string | null
          homepage_delivery_section_description?: string | null
          homepage_delivery_section_title?: string | null
          homepage_delivery_section_visible?: boolean | null
          homepage_faq_section_visible?: boolean | null
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
          homepage_menu_section_visible?: boolean | null
          homepage_reservations_section_visible?: boolean | null
          homepage_reviews_section_visible?: boolean | null
          homepage_services_section_description?: string | null
          homepage_services_section_title?: string | null
          homepage_services_section_title_first_line?: string | null
          homepage_services_section_title_second_line?: string | null
          homepage_services_section_visible?: boolean | null
          id?: string
          image_preference?: string | null
          menu_page_hero_background_url?: string | null
          menu_page_hero_description?: string | null
          menu_page_hero_title?: string | null
          menu_page_hero_title_first_line?: string | null
          menu_page_hero_title_second_line?: string | null
          our_menu_label?: string | null
          our_services_label?: string | null
          our_story_label?: string | null
          our_team_label?: string | null
          reviews_page_hero_background_url?: string | null
          reviews_page_hero_description?: string | null
          reviews_page_hero_title?: string | null
          reviews_page_hero_title_first_line?: string | null
          reviews_page_hero_title_second_line?: string | null
          reviews_section_description?: string | null
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
          style_briefing?: string | null
          testimonials_label?: string | null
          updated_at?: string
          whatsapp_general_message?: string | null
          whatsapp_reservation_message?: string | null
        }
        Update: {
          about_chef_info?: string | null
          about_mission?: string | null
          about_page_about_section_image_url?: string | null
          about_page_about_section_visible?: boolean | null
          about_page_about_stats_visible?: boolean | null
          about_page_content?: Json | null
          about_page_hero_background_url?: string | null
          about_page_hero_description?: string | null
          about_page_hero_title?: string | null
          about_page_hero_title_first_line?: string | null
          about_page_hero_title_second_line?: string | null
          about_page_stats_section_visible?: boolean | null
          about_page_team_section_visible?: boolean | null
          about_story?: string | null
          about_team_section_description?: string | null
          about_team_section_title_first_line?: string | null
          about_team_section_title_second_line?: string | null
          about_us_label?: string | null
          ai_color_palette?: string | null
          ai_image_mood?: string | null
          ai_image_style?: string | null
          carousel_display_order?: number | null
          carousel_enabled?: boolean | null
          client_id?: string
          contact_delivery_briefing?: string | null
          contact_page_contact_section_visible?: boolean | null
          contact_page_hero_background_url?: string | null
          contact_page_hero_description?: string | null
          contact_page_hero_title?: string | null
          contact_page_hero_title_first_line?: string | null
          contact_page_hero_title_second_line?: string | null
          contact_page_map_visible?: boolean | null
          contact_reservation_description?: string | null
          contact_reservation_title?: string | null
          contact_us_label?: string | null
          content_briefing?: string | null
          created_at?: string
          culinary_masterpieces_label?: string | null
          detected_image_style?: Json | null
          downloadable_menu_url?: string | null
          footer_description?: string | null
          footer_logo_url?: string | null
          header_logo_url?: string | null
          homepage_about_section_description?: string | null
          homepage_about_section_image_url?: string | null
          homepage_about_section_title?: string | null
          homepage_about_section_title_first_line?: string | null
          homepage_about_section_title_second_line?: string | null
          homepage_about_section_visible?: boolean | null
          homepage_about_stats_visible?: boolean | null
          homepage_contact_hide_reservation_box?: boolean | null
          homepage_contact_map_visible?: boolean | null
          homepage_contact_section_description?: string | null
          homepage_contact_section_title?: string | null
          homepage_contact_section_title_first_line?: string | null
          homepage_contact_section_title_second_line?: string | null
          homepage_contact_section_visible?: boolean | null
          homepage_cta_button1_link?: string | null
          homepage_cta_button1_text?: string | null
          homepage_cta_button2_link?: string | null
          homepage_cta_button2_text?: string | null
          homepage_cta_description?: string | null
          homepage_cta_title?: string | null
          homepage_delivery_section_description?: string | null
          homepage_delivery_section_title?: string | null
          homepage_delivery_section_visible?: boolean | null
          homepage_faq_section_visible?: boolean | null
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
          homepage_menu_section_visible?: boolean | null
          homepage_reservations_section_visible?: boolean | null
          homepage_reviews_section_visible?: boolean | null
          homepage_services_section_description?: string | null
          homepage_services_section_title?: string | null
          homepage_services_section_title_first_line?: string | null
          homepage_services_section_title_second_line?: string | null
          homepage_services_section_visible?: boolean | null
          id?: string
          image_preference?: string | null
          menu_page_hero_background_url?: string | null
          menu_page_hero_description?: string | null
          menu_page_hero_title?: string | null
          menu_page_hero_title_first_line?: string | null
          menu_page_hero_title_second_line?: string | null
          our_menu_label?: string | null
          our_services_label?: string | null
          our_story_label?: string | null
          our_team_label?: string | null
          reviews_page_hero_background_url?: string | null
          reviews_page_hero_description?: string | null
          reviews_page_hero_title?: string | null
          reviews_page_hero_title_first_line?: string | null
          reviews_page_hero_title_second_line?: string | null
          reviews_section_description?: string | null
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
          style_briefing?: string | null
          testimonials_label?: string | null
          updated_at?: string
          whatsapp_general_message?: string | null
          whatsapp_reservation_message?: string | null
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
      analytics_events: {
        Row: {
          client_id: string
          created_at: string
          device_type: string | null
          event_data: Json
          event_type: string
          id: string
          session_id: string
          user_agent: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          device_type?: string | null
          event_data?: Json
          event_type: string
          id?: string
          session_id: string
          user_agent?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          device_type?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      brand_profile: {
        Row: {
          brand_values: string[]
          company_description: string
          company_name: string
          created_at: string
          founder_bio: string | null
          geographic_focus: string[]
          id: string
          key_differentiators: string[]
          primary_services: string[]
          target_audience: string
          tone_of_voice: string
          updated_at: string
        }
        Insert: {
          brand_values?: string[]
          company_description: string
          company_name?: string
          created_at?: string
          founder_bio?: string | null
          geographic_focus?: string[]
          id?: string
          key_differentiators?: string[]
          primary_services?: string[]
          target_audience: string
          tone_of_voice?: string
          updated_at?: string
        }
        Update: {
          brand_values?: string[]
          company_description?: string
          company_name?: string
          created_at?: string
          founder_bio?: string | null
          geographic_focus?: string[]
          id?: string
          key_differentiators?: string[]
          primary_services?: string[]
          target_audience?: string
          tone_of_voice?: string
          updated_at?: string
        }
        Relationships: []
      }
      carousel_images: {
        Row: {
          alt_text: string | null
          client_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          client_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          client_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carousel_images_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_billing_info: {
        Row: {
          business_name: string | null
          client_id: string
          created_at: string
          dni: string | null
          document_type: string
          fiscal_address: string | null
          id: string
          ruc: string | null
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          client_id: string
          created_at?: string
          dni?: string | null
          document_type: string
          fiscal_address?: string | null
          id?: string
          ruc?: string | null
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          client_id?: string
          created_at?: string
          dni?: string | null
          document_type?: string
          fiscal_address?: string | null
          id?: string
          ruc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_billing_info_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_discount_assignments: {
        Row: {
          applied_at: string | null
          client_id: string
          created_at: string
          discount_id: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          client_id: string
          created_at?: string
          discount_id: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          client_id?: string
          created_at?: string
          discount_id?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_discount_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_discount_assignments_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "client_discounts"
            referencedColumns: ["id"]
          },
        ]
      }
      client_discounts: {
        Row: {
          created_at: string
          discount_type: string
          id: string
          is_active: boolean
          name: string
          percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_type: string
          id?: string
          is_active?: boolean
          name: string
          percentage: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_type?: string
          id?: string
          is_active?: boolean
          name?: string
          percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      client_images: {
        Row: {
          alt_text: string | null
          client_id: string
          created_at: string
          file_size_kb: number | null
          id: string
          image_url: string
          original_filename: string | null
          updated_at: string
          upload_context: string | null
          uploaded_at: string
        }
        Insert: {
          alt_text?: string | null
          client_id: string
          created_at?: string
          file_size_kb?: number | null
          id?: string
          image_url: string
          original_filename?: string | null
          updated_at?: string
          upload_context?: string | null
          uploaded_at?: string
        }
        Update: {
          alt_text?: string | null
          client_id?: string
          created_at?: string
          file_size_kb?: number | null
          id?: string
          image_url?: string
          original_filename?: string | null
          updated_at?: string
          upload_context?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_images_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_monthly_usage: {
        Row: {
          billed: boolean | null
          billing_date: string | null
          client_id: string
          created_at: string | null
          id: string
          month: string
          overage_bandwidth_gb: number | null
          overage_charge: number | null
          overage_visits: number | null
          total_bandwidth_gb: number | null
          total_visits: number | null
          updated_at: string | null
        }
        Insert: {
          billed?: boolean | null
          billing_date?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          month: string
          overage_bandwidth_gb?: number | null
          overage_charge?: number | null
          overage_visits?: number | null
          total_bandwidth_gb?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          billed?: boolean | null
          billing_date?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          month?: string
          overage_bandwidth_gb?: number | null
          overage_charge?: number | null
          overage_visits?: number | null
          total_bandwidth_gb?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_monthly_usage_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_policies: {
        Row: {
          client_id: string
          cookies_policy_content: string | null
          cookies_policy_enabled: boolean
          created_at: string
          id: string
          privacy_policy_content: string | null
          privacy_policy_enabled: boolean
          reclamaciones_email: string | null
          reclamaciones_enabled: boolean
          terms_of_service_content: string | null
          terms_of_service_enabled: boolean
          updated_at: string
        }
        Insert: {
          client_id: string
          cookies_policy_content?: string | null
          cookies_policy_enabled?: boolean
          created_at?: string
          id?: string
          privacy_policy_content?: string | null
          privacy_policy_enabled?: boolean
          reclamaciones_email?: string | null
          reclamaciones_enabled?: boolean
          terms_of_service_content?: string | null
          terms_of_service_enabled?: boolean
          updated_at?: string
        }
        Update: {
          client_id?: string
          cookies_policy_content?: string | null
          cookies_policy_enabled?: boolean
          created_at?: string
          id?: string
          privacy_policy_content?: string | null
          privacy_policy_enabled?: boolean
          reclamaciones_email?: string | null
          reclamaciones_enabled?: boolean
          terms_of_service_content?: string | null
          terms_of_service_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_policies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_settings: {
        Row: {
          body_font: string | null
          client_id: string
          created_at: string
          custom_cta_button_link: string | null
          custom_cta_button_text: string | null
          delivery_info: Json | null
          header_background_enabled: boolean | null
          header_background_style: string | null
          hero_overlay_opacity: number | null
          hide_phone_button_menu: boolean | null
          hide_whatsapp_button_menu: boolean | null
          id: string
          layout_type: string | null
          other_customizations: Json | null
          primary_button_text_style: string | null
          primary_color: string | null
          show_whatsapp_popup: boolean | null
          title_font: string | null
          title_font_weight: string | null
          title_size_scale: number | null
          updated_at: string
          whatsapp_messages: Json | null
        }
        Insert: {
          body_font?: string | null
          client_id: string
          created_at?: string
          custom_cta_button_link?: string | null
          custom_cta_button_text?: string | null
          delivery_info?: Json | null
          header_background_enabled?: boolean | null
          header_background_style?: string | null
          hero_overlay_opacity?: number | null
          hide_phone_button_menu?: boolean | null
          hide_whatsapp_button_menu?: boolean | null
          id?: string
          layout_type?: string | null
          other_customizations?: Json | null
          primary_button_text_style?: string | null
          primary_color?: string | null
          show_whatsapp_popup?: boolean | null
          title_font?: string | null
          title_font_weight?: string | null
          title_size_scale?: number | null
          updated_at?: string
          whatsapp_messages?: Json | null
        }
        Update: {
          body_font?: string | null
          client_id?: string
          created_at?: string
          custom_cta_button_link?: string | null
          custom_cta_button_text?: string | null
          delivery_info?: Json | null
          header_background_enabled?: boolean | null
          header_background_style?: string | null
          hero_overlay_opacity?: number | null
          hide_phone_button_menu?: boolean | null
          hide_whatsapp_button_menu?: boolean | null
          id?: string
          layout_type?: string | null
          other_customizations?: Json | null
          primary_button_text_style?: string | null
          primary_color?: string | null
          show_whatsapp_popup?: boolean | null
          title_font?: string | null
          title_font_weight?: string | null
          title_size_scale?: number | null
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
          cancellation_date: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cloudflare_zone_id: string | null
          coordinates: Json | null
          country_code: string | null
          created_at: string
          custom_domain: string | null
          dashboard_is_deactivated: boolean
          delivery: Json | null
          dns_records_status: Json | null
          domain: string | null
          domain_verification_date: string | null
          domain_verified: boolean | null
          email: string | null
          favicon_url: string | null
          id: string
          is_deactivated: boolean
          last_domain_check: string | null
          last_payment_attempt: string | null
          locale: string | null
          locked_advanced_price: number | null
          locked_basic_price: number | null
          monthly_bandwidth_limit_gb: number | null
          monthly_visits_limit: number | null
          next_billing_date: string | null
          opening_hours: Json | null
          opening_hours_ordered: Json | null
          openpay_customer_id: string | null
          openpay_subscription_id: string | null
          other_customizations: Json | null
          payment_failures_count: number | null
          payment_status: string | null
          pending_plan_change: string | null
          pending_plan_change_date: string | null
          phone: string | null
          phone_country_code: string | null
          plan_type: string | null
          razon_social: string | null
          reengagement_sent_at: string | null
          referral_source: string | null
          reservations_email: string | null
          restaurant_name: string
          review_request_sent_at: string | null
          ruc: string | null
          signup_completed: boolean
          site_live_at: string | null
          social_media_links: Json | null
          ssl_issued_date: string | null
          ssl_status: string | null
          subdomain: string
          subscription_auto_recurring: boolean | null
          subscription_end_date: string | null
          subscription_pause_date: string | null
          subscription_resume_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          template_id: string | null
          theme: string | null
          timezone: string | null
          trial_end_date: string | null
          turnstile_secret_key: string | null
          turnstile_site_key: string | null
          turnstile_widget_id: string | null
          updated_at: string
          use_coordinates: boolean | null
          vercel_dashboard_url: string | null
          vercel_project: string | null
          vercel_team: string | null
          whatsapp: string | null
          whatsapp_country_code: string | null
        }
        Insert: {
          address?: string | null
          brand_colors?: Json | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cloudflare_zone_id?: string | null
          coordinates?: Json | null
          country_code?: string | null
          created_at?: string
          custom_domain?: string | null
          dashboard_is_deactivated?: boolean
          delivery?: Json | null
          dns_records_status?: Json | null
          domain?: string | null
          domain_verification_date?: string | null
          domain_verified?: boolean | null
          email?: string | null
          favicon_url?: string | null
          id?: string
          is_deactivated?: boolean
          last_domain_check?: string | null
          last_payment_attempt?: string | null
          locale?: string | null
          locked_advanced_price?: number | null
          locked_basic_price?: number | null
          monthly_bandwidth_limit_gb?: number | null
          monthly_visits_limit?: number | null
          next_billing_date?: string | null
          opening_hours?: Json | null
          opening_hours_ordered?: Json | null
          openpay_customer_id?: string | null
          openpay_subscription_id?: string | null
          other_customizations?: Json | null
          payment_failures_count?: number | null
          payment_status?: string | null
          pending_plan_change?: string | null
          pending_plan_change_date?: string | null
          phone?: string | null
          phone_country_code?: string | null
          plan_type?: string | null
          razon_social?: string | null
          reengagement_sent_at?: string | null
          referral_source?: string | null
          reservations_email?: string | null
          restaurant_name: string
          review_request_sent_at?: string | null
          ruc?: string | null
          signup_completed?: boolean
          site_live_at?: string | null
          social_media_links?: Json | null
          ssl_issued_date?: string | null
          ssl_status?: string | null
          subdomain: string
          subscription_auto_recurring?: boolean | null
          subscription_end_date?: string | null
          subscription_pause_date?: string | null
          subscription_resume_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          template_id?: string | null
          theme?: string | null
          timezone?: string | null
          trial_end_date?: string | null
          turnstile_secret_key?: string | null
          turnstile_site_key?: string | null
          turnstile_widget_id?: string | null
          updated_at?: string
          use_coordinates?: boolean | null
          vercel_dashboard_url?: string | null
          vercel_project?: string | null
          vercel_team?: string | null
          whatsapp?: string | null
          whatsapp_country_code?: string | null
        }
        Update: {
          address?: string | null
          brand_colors?: Json | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cloudflare_zone_id?: string | null
          coordinates?: Json | null
          country_code?: string | null
          created_at?: string
          custom_domain?: string | null
          dashboard_is_deactivated?: boolean
          delivery?: Json | null
          dns_records_status?: Json | null
          domain?: string | null
          domain_verification_date?: string | null
          domain_verified?: boolean | null
          email?: string | null
          favicon_url?: string | null
          id?: string
          is_deactivated?: boolean
          last_domain_check?: string | null
          last_payment_attempt?: string | null
          locale?: string | null
          locked_advanced_price?: number | null
          locked_basic_price?: number | null
          monthly_bandwidth_limit_gb?: number | null
          monthly_visits_limit?: number | null
          next_billing_date?: string | null
          opening_hours?: Json | null
          opening_hours_ordered?: Json | null
          openpay_customer_id?: string | null
          openpay_subscription_id?: string | null
          other_customizations?: Json | null
          payment_failures_count?: number | null
          payment_status?: string | null
          pending_plan_change?: string | null
          pending_plan_change_date?: string | null
          phone?: string | null
          phone_country_code?: string | null
          plan_type?: string | null
          razon_social?: string | null
          reengagement_sent_at?: string | null
          referral_source?: string | null
          reservations_email?: string | null
          restaurant_name?: string
          review_request_sent_at?: string | null
          ruc?: string | null
          signup_completed?: boolean
          site_live_at?: string | null
          social_media_links?: Json | null
          ssl_issued_date?: string | null
          ssl_status?: string | null
          subdomain?: string
          subscription_auto_recurring?: boolean | null
          subscription_end_date?: string | null
          subscription_pause_date?: string | null
          subscription_resume_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          template_id?: string | null
          theme?: string | null
          timezone?: string | null
          trial_end_date?: string | null
          turnstile_secret_key?: string | null
          turnstile_site_key?: string | null
          turnstile_widget_id?: string | null
          updated_at?: string
          use_coordinates?: boolean | null
          vercel_dashboard_url?: string | null
          vercel_project?: string | null
          vercel_team?: string | null
          whatsapp?: string | null
          whatsapp_country_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
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
      coupons: {
        Row: {
          applicable_plans: string[]
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          uses_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_plans?: string[]
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applicable_plans?: string[]
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      daily_analytics: {
        Row: {
          avg_time_on_page: number
          bounce_rate: number
          client_id: string
          created_at: string
          date: string
          device_breakdown: Json
          id: string
          menu_downloads: number
          menu_section_data: Json
          phone_clicks: number
          reservation_clicks: number
          total_page_views: number
          unique_sessions: number
          updated_at: string
          whatsapp_clicks: number
        }
        Insert: {
          avg_time_on_page?: number
          bounce_rate?: number
          client_id: string
          created_at?: string
          date: string
          device_breakdown?: Json
          id?: string
          menu_downloads?: number
          menu_section_data?: Json
          phone_clicks?: number
          reservation_clicks?: number
          total_page_views?: number
          unique_sessions?: number
          updated_at?: string
          whatsapp_clicks?: number
        }
        Update: {
          avg_time_on_page?: number
          bounce_rate?: number
          client_id?: string
          created_at?: string
          date?: string
          device_breakdown?: Json
          id?: string
          menu_downloads?: number
          menu_section_data?: Json
          phone_clicks?: number
          reservation_clicks?: number
          total_page_views?: number
          unique_sessions?: number
          updated_at?: string
          whatsapp_clicks?: number
        }
        Relationships: []
      }
      documentation_pages: {
        Row: {
          changefreq: string
          created_at: string
          id: string
          is_active: boolean
          path: string
          priority: number
          updated_at: string
        }
        Insert: {
          changefreq?: string
          created_at?: string
          id?: string
          is_active?: boolean
          path: string
          priority?: number
          updated_at?: string
        }
        Update: {
          changefreq?: string
          created_at?: string
          id?: string
          is_active?: boolean
          path?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_dns_requests: {
        Row: {
          client_id: string
          created_at: string
          dkim_selector: string
          dkim_value: string
          error_message: string | null
          id: string
          mx1_priority: number
          mx1_record: string
          mx2_priority: number
          mx2_record: string
          processed_at: string | null
          spf_record: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          dkim_selector?: string
          dkim_value: string
          error_message?: string | null
          id?: string
          mx1_priority?: number
          mx1_record?: string
          mx2_priority?: number
          mx2_record?: string
          processed_at?: string | null
          spf_record?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          dkim_selector?: string
          dkim_value?: string
          error_message?: string | null
          id?: string
          mx1_priority?: number
          mx1_record?: string
          mx2_priority?: number
          mx2_record?: string
          processed_at?: string | null
          spf_record?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_dns_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          client_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          client_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          client_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
          category_id: string | null
          client_id: string
          created_at: string
          description: string | null
          display_order: number
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
          category_id?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          display_order?: number
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
          category_id?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
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
            foreignKeyName: "fk_menu_items_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      page_metadata: {
        Row: {
          client_id: string
          created_at: string
          id: string
          keywords: string | null
          meta_description: string
          meta_title: string
          og_description: string | null
          og_title: string | null
          page_type: string
          twitter_description: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          keywords?: string | null
          meta_description: string
          meta_title: string
          og_description?: string | null
          og_title?: string | null
          page_type: string
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          keywords?: string | null
          meta_description?: string
          meta_title?: string
          og_description?: string | null
          og_title?: string | null
          page_type?: string
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_metadata_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_features: {
        Row: {
          analytics_enabled: boolean | null
          analytics_setup_date: string | null
          client_id: string
          created_at: string
          google_analytics_id: string | null
          google_search_console_verification: string | null
          id: string
          monthly_reports_enabled: boolean | null
          premium_support_enabled: boolean | null
          unique_support_pin: string | null
          updated_at: string
        }
        Insert: {
          analytics_enabled?: boolean | null
          analytics_setup_date?: string | null
          client_id: string
          created_at?: string
          google_analytics_id?: string | null
          google_search_console_verification?: string | null
          id?: string
          monthly_reports_enabled?: boolean | null
          premium_support_enabled?: boolean | null
          unique_support_pin?: string | null
          updated_at?: string
        }
        Update: {
          analytics_enabled?: boolean | null
          analytics_setup_date?: string | null
          client_id?: string
          created_at?: string
          google_analytics_id?: string | null
          google_search_console_verification?: string | null
          id?: string
          monthly_reports_enabled?: boolean | null
          premium_support_enabled?: boolean | null
          unique_support_pin?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_features_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reclamaciones: {
        Row: {
          address: string | null
          business_name: string | null
          claim_code: string
          claim_type: string
          client_id: string
          created_at: string
          description: string
          dni: string | null
          email: string
          full_name: string
          id: string
          person_type: string
          phone: string | null
          product_description: string
          purchase_amount: number | null
          purchase_date: string
          resolved_at: string | null
          ruc: string | null
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          claim_code: string
          claim_type: string
          client_id: string
          created_at?: string
          description: string
          dni?: string | null
          email: string
          full_name: string
          id?: string
          person_type: string
          phone?: string | null
          product_description: string
          purchase_amount?: number | null
          purchase_date: string
          resolved_at?: string | null
          ruc?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string | null
          claim_code?: string
          claim_type?: string
          client_id?: string
          created_at?: string
          description?: string
          dni?: string | null
          email?: string
          full_name?: string
          id?: string
          person_type?: string
          phone?: string | null
          product_description?: string
          purchase_amount?: number | null
          purchase_date?: string
          resolved_at?: string | null
          ruc?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reclamaciones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      resend_email_logs: {
        Row: {
          client_id: string | null
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          recipient_type: string
          resend_id: string | null
          status: string
          ticket_number: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_type: string
          resend_id?: string | null
          status?: string
          ticket_number?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_type?: string
          resend_id?: string | null
          status?: string
          ticket_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resend_email_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_schedules: {
        Row: {
          capacity: number
          client_id: string
          created_at: string
          custom_table_configs: Json | null
          day_of_week: number
          duration_minutes: number
          end_time: string
          id: string
          is_active: boolean
          max_party_size: number
          min_party_size: number
          special_groups_condition: string | null
          special_groups_contact_method: string | null
          special_groups_enabled: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          capacity: number
          client_id: string
          created_at?: string
          custom_table_configs?: Json | null
          day_of_week: number
          duration_minutes?: number
          end_time: string
          id?: string
          is_active?: boolean
          max_party_size?: number
          min_party_size?: number
          special_groups_condition?: string | null
          special_groups_contact_method?: string | null
          special_groups_enabled?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          client_id?: string
          created_at?: string
          custom_table_configs?: Json | null
          day_of_week?: number
          duration_minutes?: number
          end_time?: string
          id?: string
          is_active?: boolean
          max_party_size?: number
          min_party_size?: number
          special_groups_condition?: string | null
          special_groups_contact_method?: string | null
          special_groups_enabled?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          client_id: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decline_reason: string | null
          duration_minutes: number
          id: string
          internal_notes: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests: string | null
          status: string
          table_config_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decline_reason?: string | null
          duration_minutes?: number
          id?: string
          internal_notes?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests?: string | null
          status?: string
          table_config_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          decline_reason?: string | null
          duration_minutes?: number
          id?: string
          internal_notes?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          special_requests?: string | null
          status?: string
          table_config_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_table_config_id_fkey"
            columns: ["table_config_id"]
            isOneToOne: false
            referencedRelation: "table_configurations"
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
          review_date: string | null
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
          review_date?: string | null
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
          review_date?: string | null
          review_text?: string
          reviewer_name?: string
          star_rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          changefreq: string
          created_at: string
          id: string
          is_active: boolean
          path: string
          priority: number
          updated_at: string
        }
        Insert: {
          changefreq?: string
          created_at?: string
          id?: string
          is_active?: boolean
          path: string
          priority?: number
          updated_at?: string
        }
        Update: {
          changefreq?: string
          created_at?: string
          id?: string
          is_active?: boolean
          path?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_payments: {
        Row: {
          amount: number
          client_id: string
          coupon_code: string | null
          created_at: string
          currency: string
          discount_amount: number | null
          id: string
          original_amount: number | null
          paid_at: string | null
          payment_method: string | null
          period_end: string
          period_start: string
          status: string
        }
        Insert: {
          amount: number
          client_id: string
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          id?: string
          original_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          period_end: string
          period_start: string
          status?: string
        }
        Update: {
          amount?: number
          client_id?: string
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          id?: string
          original_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          period_end?: string
          period_start?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          discount_percentage: number | null
          display_order: number
          features: string[]
          id: string
          is_active: boolean
          is_popular: boolean
          monthly_price: number
          name: string
          original_price: number | null
          plan_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          discount_percentage?: number | null
          display_order?: number
          features?: string[]
          id?: string
          is_active?: boolean
          is_popular?: boolean
          monthly_price: number
          name: string
          original_price?: number | null
          plan_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          discount_percentage?: number | null
          display_order?: number
          features?: string[]
          id?: string
          is_active?: boolean
          is_popular?: boolean
          monthly_price?: number
          name?: string
          original_price?: number | null
          plan_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          last_response_at: string | null
          message: string
          priority: string
          resolved_at: string | null
          response_count: number
          status: string
          subject: string
          support_type: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          last_response_at?: string | null
          message: string
          priority?: string
          resolved_at?: string | null
          response_count?: number
          status?: string
          subject: string
          support_type?: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          last_response_at?: string | null
          message?: string
          priority?: string
          resolved_at?: string | null
          response_count?: number
          status?: string
          subject?: string
          support_type?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      table_configurations: {
        Row: {
          client_id: string
          created_at: string
          duration_minutes: number
          id: string
          is_active: boolean
          max_party_size: number
          min_party_size: number
          quantity: number
          seats: number
          table_name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_party_size: number
          min_party_size: number
          quantity: number
          seats: number
          table_name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_party_size?: number
          min_party_size?: number
          quantity?: number
          seats?: number
          table_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_configurations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      templates: {
        Row: {
          client_count: number | null
          created_at: string | null
          description: string | null
          folder_path: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          client_count?: number | null
          created_at?: string | null
          description?: string | null
          folder_path: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_count?: number | null
          created_at?: string | null
          description?: string | null
          folder_path?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_email: string
          created_by_name: string
          id: string
          is_internal_note: boolean
          message: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_email: string
          created_by_name: string
          id?: string
          is_internal_note?: boolean
          message: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_email?: string
          created_by_name?: string
          id?: string
          is_internal_note?: boolean
          message?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_subscription_end_date: {
        Args: { plan_type: string; start_date: string }
        Returns: string
      }
      generate_fast_load_data: {
        Args: { client_domain: string }
        Returns: undefined
      }
      generate_opening_hours_ordered: {
        Args: { opening_hours_obj: Json }
        Returns: Json
      }
      generate_support_pin: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
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
      increment_client_usage: {
        Args: { p_bandwidth_gb?: number; p_client_id: string }
        Returns: undefined
      }
      increment_coupon_usage: {
        Args: { coupon_code: string }
        Returns: undefined
      }
      is_subscription_active: { Args: { client_id: string }; Returns: boolean }
      link_user_to_client: {
        Args: { client_uuid: string; user_email: string; user_role?: string }
        Returns: string
      }
      validate_coupon: {
        Args: { amount: number; coupon_code: string; plan_type: string }
        Returns: Json
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
