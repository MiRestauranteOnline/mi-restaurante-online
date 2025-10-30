import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Plus, Trash2, Edit, Search, GripVertical, FolderPlus, ChevronRight, CalendarIcon, Trash, Pencil, ArrowUp, ArrowDown, ChevronUp, ChevronDown, Globe, Utensils, Truck, Users, Clock, Star, MapPin, Award, Heart, Coffee, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ImageUpload } from "@/components/ImageUpload";
import { CustomImagesManager } from "@/components/client/CustomImagesManager";
import { PhoneInput } from "@/components/ui/phone-input";
import { UserWarningOverlay } from "@/components/UserWarningOverlay";
import { MultiLocationInput } from "@/components/MultiLocationInput";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDashboardLanguage } from '@/contexts/DashboardLanguageContext';
import { AnalyticsOverview } from '@/components/client/AnalyticsOverview';
import { ClientDiscountAssignments } from '@/components/admin/ClientDiscountAssignments';
import { PageMetadataManager } from '@/components/admin/PageMetadataManager';
import { useAdminImpersonation } from '@/hooks/useAdminImpersonation';
import { UserCog } from 'lucide-react';
import { timezones } from '@/data/timezones';
import { countries } from '@/data/countries';
import * as React from "react";

// Icon mapping helper
const iconMap: Record<string, any> = {
  Utensils,
  Truck,
  Users,
  Clock,
  Star,
  MapPin,
  Award,
  Heart,
  Coffee,
  Zap
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Utensils;
};

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
  domain?: string;
  email?: string;
  razon_social?: string;
  ruc?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  whatsapp_country_code?: string;
  coordinates?: any;
  opening_hours?: any;
  social_media_links?: any;
  brand_colors?: any;
  delivery?: any;
  other_customizations?: any;
  theme?: string;
  hide_whatsapp_button_menu?: boolean;
  hide_phone_button_menu?: boolean;
  custom_cta_button_text?: string;
  custom_cta_button_link?: string;
  show_whatsapp_popup?: boolean;
  template_id?: string;
  timezone?: string;
  country_code?: string;
  locale?: string;
  is_deactivated?: boolean;
  dashboard_is_deactivated?: boolean;
  subscription_status?: string;
  payment_status?: string;
}

interface ClientSettings {
  id: string;
  client_id: string;
  primary_color: string;
  header_background_enabled: boolean;
  header_background_style: string;
}

interface AdminContent {
  id: string;
  client_id: string;
  
  // Three new briefing fields
  content_briefing?: string;
  style_briefing?: string;
  contact_delivery_briefing?: string;
  
  // Two-part titles
  homepage_hero_title_first_line?: string;
  homepage_hero_title_second_line?: string;
  homepage_menu_section_title_first_line?: string;
  homepage_menu_section_title_second_line?: string;
  homepage_contact_section_title_first_line?: string;
  homepage_contact_section_title_second_line?: string;
  homepage_about_section_title_first_line?: string;
  homepage_about_section_title_second_line?: string;
  homepage_services_section_title_first_line?: string;
  homepage_services_section_title_second_line?: string;
  reviews_section_title_first_line?: string;
  reviews_section_title_second_line?: string;
  reviews_section_description?: string;
  
  // Page hero titles
  about_page_hero_title_first_line?: string;
  about_page_hero_title_second_line?: string;
  contact_page_hero_title_first_line?: string;
  contact_page_hero_title_second_line?: string;
  menu_page_hero_title_first_line?: string;
  menu_page_hero_title_second_line?: string;
  reviews_page_hero_title_first_line?: string;
  reviews_page_hero_title_second_line?: string;
  about_team_section_title_first_line?: string;
  about_team_section_title_second_line?: string;
  
  // Single line titles and descriptions
  homepage_hero_description?: string;
  homepage_hero_background_url?: string;
  homepage_hero_right_button_text?: string;
  homepage_hero_right_button_link?: string;
  homepage_about_section_description?: string;
  homepage_about_section_image_url?: string;
  homepage_menu_section_description?: string;
  homepage_services_section_description?: string;
  homepage_contact_section_description?: string;
  homepage_contact_hide_reservation_box?: boolean;
  homepage_delivery_section_title?: string;
  homepage_delivery_section_description?: string;
  
  // Page content
  about_page_hero_description?: string;
  about_page_hero_background_url?: string;
  about_page_about_section_image_url?: string;
  contact_page_hero_description?: string;
  contact_page_hero_background_url?: string;
  menu_page_hero_description?: string;
  menu_page_hero_background_url?: string;
  reviews_page_hero_description?: string;
  reviews_page_hero_background_url?: string;
  about_team_section_description?: string;
  
  // About content
  about_story?: string;
  about_chef_info?: string;
  about_mission?: string;
  
  // Stats
  stats_experience_number?: string;
  stats_experience_label?: string;
  stats_clients_number?: string;
  stats_clients_label?: string;
  stats_awards_number?: string;
  stats_awards_label?: string;
  stats_item1_icon?: string;
  stats_item2_icon?: string;
  stats_item3_icon?: string;
  
  // Services
  services_card1_icon?: string;
  services_card1_title?: string;
  services_card1_description?: string;
  services_card1_button_text?: string;
  services_card1_button_link?: string;
  services_card2_icon?: string;
  services_card2_title?: string;
  services_card2_description?: string;
  services_card2_button_text?: string;
  services_card2_button_link?: string;
  services_card3_icon?: string;
  services_card3_title?: string;
  services_card3_description?: string;
  services_card3_button_text?: string;
  services_card3_button_link?: string;
  services_feature1_icon?: string;
  services_feature1_text?: string;
  services_feature2_icon?: string;
  services_feature2_text?: string;
  services_feature3_icon?: string;
  services_feature3_text?: string;
  
  // Footer
  footer_description?: string;
  
  // CTA Section
  homepage_cta_title?: string;
  homepage_cta_description?: string;
  homepage_cta_button1_text?: string;
  homepage_cta_button1_link?: string;
  homepage_cta_button2_text?: string;
  homepage_cta_button2_link?: string;
  
  // Contact Reservation Section
  contact_reservation_title?: string;
  contact_reservation_description?: string;
  
  // WhatsApp Messages
  whatsapp_reservation_message?: string;
  whatsapp_general_message?: string;
  
  // New Label Fields
  our_story_label?: string;
  culinary_masterpieces_label?: string;
  testimonials_label?: string;
  our_services_label?: string;
  contact_us_label?: string;
  about_us_label?: string;
  our_menu_label?: string;
  our_team_label?: string;
  
  // Carousel
  carousel_enabled?: boolean;
  carousel_display_order?: number;
  
  // Visibility toggles
  homepage_about_section_visible?: boolean;
  homepage_about_stats_visible?: boolean;
  homepage_menu_section_visible?: boolean;
  homepage_services_section_visible?: boolean;
  homepage_reservations_section_visible?: boolean;
  homepage_reviews_section_visible?: boolean;
  homepage_contact_section_visible?: boolean;
  homepage_contact_map_visible?: boolean;
  homepage_delivery_section_visible?: boolean;
  homepage_faq_section_visible?: boolean;
  about_page_about_section_visible?: boolean;
  about_page_about_stats_visible?: boolean;
  about_page_stats_section_visible?: boolean;
  about_page_team_section_visible?: boolean;
  contact_page_contact_section_visible?: boolean;
  contact_page_map_visible?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  client_id: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string; // legacy field, do not rely on this for linking
  category_id?: string | null;
  image_url?: string;
  is_active: boolean;
  client_id: string;
  show_on_homepage: boolean;
  show_image_menu: boolean;
  show_image_home: boolean;
  display_order: number;
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  client_id: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  star_rating: number;
  display_order: number;
  is_active: boolean;
  client_id: string;
  review_date?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  client_id: string;
}

interface PremiumFeatures {
  id: string;
  client_id: string;
  google_analytics_id?: string;
  google_search_console_verification?: string;
  analytics_setup_date?: string;
  analytics_enabled: boolean;
  monthly_reports_enabled: boolean;
  premium_support_enabled: boolean;
}

// Sortable Category Card Component for Menu Tab
function SortableCategoryCard({ 
  category, 
  categoryItems,
  searchTerm,
  filteredAndGroupedMenuItems,
  openMenuItemDialog,
  openCategoryDialog,
  handleDeleteCategory,
  handleCompleteDeleteCategory,
  handleToggleCategoryStatus,
  formData,
  handleDeleteMenuItem,
  handleToggleItemStatus,
  onItemDragEnd,
  handleMoveMenuItemUp,
  handleMoveMenuItemDown,
  handleMoveCategoryUp,
  handleMoveCategoryDown,
  isFirst,
  isLast
}: {
  category: MenuCategory;
  categoryItems: MenuItem[];
  searchTerm: string;
  filteredAndGroupedMenuItems: Record<string, MenuItem[]>;
  openMenuItemDialog: (item?: MenuItem, defaultCategoryId?: string) => void;
  openCategoryDialog: (category?: MenuCategory) => void;
  handleDeleteCategory: (id: string) => void;
  handleCompleteDeleteCategory: (id: string) => void;
  handleToggleCategoryStatus: (id: string, isActive: boolean) => void;
  formData: any;
  handleDeleteMenuItem: (id: string) => void;
  handleToggleItemStatus: (id: string, isActive: boolean) => void;
  onItemDragEnd: (event: DragEndEvent, categoryId: string) => void;
  handleMoveMenuItemUp: (id: string) => void;
  handleMoveMenuItemDown: (id: string) => void;
  handleMoveCategoryUp: (id: string) => void;
  handleMoveCategoryDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <Collapsible defaultOpen={!searchTerm || categoryItems.length > 0}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveCategoryUp(category.id)}
                    disabled={isFirst}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveCategoryDown(category.id)}
                    disabled={isLast}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">{category.name}</CardTitle>
                  <Badge variant={category.is_active ? "default" : "secondary"} className="shrink-0">
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="shrink-0">
                    {categoryItems.length} items
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={category.is_active}
                  onCheckedChange={(checked) => handleToggleCategoryStatus(category.id, checked)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openMenuItemDialog(undefined, category.name)}
                  className="hidden sm:inline-flex"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openMenuItemDialog(undefined, category.name)}
                  className="sm:hidden"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openCategoryDialog(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {categoryItems.length === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCompleteDeleteCategory(category.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                    title="Delete category permanently"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {categoryItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{searchTerm ? 'No items match your search' : 'No items in this category'}</p>
                {!searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => openMenuItemDialog(undefined, category.name)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add first item
                  </Button>
                )}
              </div>
              ) : (
                    <div className="space-y-2">
                      {categoryItems.map((item, index) => (
                        <SortableMenuItem
                          key={item.id}
                          item={item}
                          currencySymbol={formData.other_customizations.currency}
                          onEdit={openMenuItemDialog}
                          onDelete={handleDeleteMenuItem}
                          onToggleStatus={handleToggleItemStatus}
                          onMoveUp={handleMoveMenuItemUp}
                          onMoveDown={handleMoveMenuItemDown}
                          isFirst={index === 0}
                          isLast={index === categoryItems.length - 1}
                        />
                      ))}
                    </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
function SortableCategoryItem({ category, onEdit, onDelete }: { 
  category: MenuCategory, 
  onEdit: (category: MenuCategory) => void,
  onDelete: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded bg-card"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <span className="font-medium">{category.name}</span>
          <span className="text-sm text-muted-foreground ml-2">Order: {category.display_order}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(category.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Menu Item Component
function SortableMenuItem({ item, currencySymbol, onEdit, onDelete, onToggleStatus, onMoveUp, onMoveDown, isFirst, isLast }: { 
  item: MenuItem, 
  currencySymbol: string,
  onEdit: (item: MenuItem) => void,
  onDelete: (id: string) => void,
  onToggleStatus: (id: string, isActive: boolean) => void,
  onMoveUp: (id: string) => void,
  onMoveDown: (id: string) => void,
  isFirst: boolean,
  isLast: boolean
}) {
  return (
    <div className="flex flex-col gap-3 p-4 border-2 border-border rounded-lg bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base break-words">{item.name}</span>
              <Badge variant={item.is_active ? "default" : "secondary"} className="shrink-0">
                {item.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <span className="text-lg font-bold text-primary">
              {currencySymbol}{item.price}
            </span>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 justify-between pt-3 border-t-2">
        <Switch
          checked={item.is_active}
          onCheckedChange={(checked) => onToggleStatus(item.id, checked)}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onMoveUp(item.id)} disabled={isFirst}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onMoveDown(item.id)} disabled={isLast}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sortable Team Member Component
function SortableTeamMember({ member, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: { 
  member: TeamMember, 
  onEdit: (member: TeamMember) => void,
  onDelete: (id: string) => void,
  onMoveUp: (id: string) => void,
  onMoveDown: (id: string) => void,
  isFirst: boolean,
  isLast: boolean
}) {
  return (
    <div className="flex flex-col gap-3 p-4 border-2 border-border rounded-lg bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {member.image_url && (
            <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 mb-2">
              <span className="font-semibold text-base truncate">{member.name}</span>
              <p className="text-sm text-muted-foreground truncate">{member.title}</p>
            </div>
            {member.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{member.bio}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-3 border-t-2">
        <Button variant="outline" size="sm" onClick={() => onMoveUp(member.id)} disabled={isFirst}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onMoveDown(member.id)} disabled={isLast}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(member.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Review Component
function SortableReview({ review, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: { 
  review: Review, 
  onEdit: (review: Review) => void,
  onDelete: (id: string) => void,
  onMoveUp: (id: string) => void,
  onMoveDown: (id: string) => void,
  isFirst: boolean,
  isLast: boolean
}) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} className="text-yellow-400">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="flex flex-col gap-3 p-4 border-2 border-border rounded-lg bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <span className="font-semibold text-base truncate">{review.reviewer_name}</span>
            <div className="flex gap-0.5 text-lg">{renderStars(review.star_rating)}</div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{review.review_text}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-3 border-t-2">
        <Button variant="outline" size="sm" onClick={() => onMoveUp(review.id)} disabled={isFirst}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onMoveDown(review.id)} disabled={isLast}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(review)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(review.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ClientSettings({ allowedTabs }: { allowedTabs?: string[] } = {}) {
  const { clientId } = useParams<{ clientId: string }>();
  const outletCtx = useOutletContext<{ selectedClientId?: string; setSelectedClientId?: (id: string) => void }>();
  const contextClientId = outletCtx?.selectedClientId;
  const setSelectedClientId = outletCtx?.setSelectedClientId;
  const navigate = useNavigate();
  const { t } = useDashboardLanguage();
  const { startImpersonation, endImpersonation, isImpersonating } = useAdminImpersonation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Prefer route param when present, else fall back to admin context selection
  const effectiveClientId = clientId || contextClientId;
  
  console.log('ClientSettings Debug:', {
    clientId,
    contextClientId, 
    effectiveClientId,
  });
  
  useEffect(() => {
    // If navigated from Client Management with a clientId, sync admin selection to it
    if (clientId && clientId !== contextClientId && setSelectedClientId) {
      setSelectedClientId(clientId);
    }
  }, [clientId, contextClientId, setSelectedClientId]);
  const [client, setClient] = useState<Client | null>(null);
  const [clientSettings, setClientSettings] = useState<ClientSettings | null>(null);
  const [adminContent, setAdminContent] = useState<AdminContent | null>(null);
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [carouselImages, setCarouselImages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showMenuItemDialog, setShowMenuItemDialog] = useState(false);
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);
  const [warningTabName, setWarningTabName] = useState('');
  const [userConfirmedWarning, setUserConfirmedWarning] = useState(false);
  const { toast } = useToast();

  const location = useLocation();
  const isClientView = location.pathname.startsWith('/client/');
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [selectedContentPage, setSelectedContentPage] = useState<string>("homepage");

  // Ensure activeTab is allowed (especially in client view)
  useEffect(() => {
    const order = ['basic','domain','metadata','hours','social','delivery','branding','navigation-visibility','content','briefing','menu','team','reviews','faqs','carousel','custom-images'];
    const adminOnly = ['discounts','advanced','control'];
    const ordered = userRole === 'admin' ? [...order, ...adminOnly] : [...order, ...adminOnly];
    const firstAllowed = ordered.find((v) => showTab(v));
    if (firstAllowed && !showTab(activeTab)) {
      setActiveTab(firstAllowed);
    }
  }, [allowedTabs, userRole, client]);

  const showTab = (name: string) => {
    // Always allow when no restrictions
    if (!allowedTabs) {
      if (name === 'advanced') {
        // Admins always see it; clients only if plan is advanced
        return userRole === 'admin' || (client && (client as any).plan_type === 'advanced');
      }
      return true;
    }
    // Respect allowedTabs first
    if (!allowedTabs.includes(name)) {
      // Exception: allow 'advanced' for clients with advanced plan even if not in allowedTabs
      if (name === 'advanced') {
        return userRole === 'admin' || (client && (client as any).plan_type === 'advanced');
      }
      return false;
    }
    // For 'discounts', still limit to admin unless explicitly allowed
    if (name === 'discounts' && userRole !== 'admin') return false;
    return true;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [categoryForm, setCategoryForm] = useState({ name: '', display_order: 0 });
  const [menuItemForm, setMenuItemForm] = useState({
    name: '', description: '', price: 0, category_id: '', image_url: '',
    show_on_homepage: false, show_image_menu: true, show_image_home: false
  });

  const [teamMemberForm, setTeamMemberForm] = useState({
    name: '', title: '', bio: '', image_url: '', display_order: 0
  });

const [reviewForm, setReviewForm] = useState({
  reviewer_name: '', review_text: '', star_rating: 5, display_order: 0, review_date: null as Date | null,
});

const [faqForm, setFaqForm] = useState({
  question: '', answer: '', display_order: 0
});

  // Briefing state - now three separate briefings
  const [contentBriefing, setContentBriefing] = useState('');
  const [styleBriefing, setStyleBriefing] = useState('');
  const [contactDeliveryBriefing, setContactDeliveryBriefing] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter and group menu items by category (using category_id)
  const filteredAndGroupedMenuItems = useMemo(() => {
    const nameById = Object.fromEntries(categories.map(c => [c.id, c.name]));
    const term = searchTerm.toLowerCase();
    const filtered = menuItems.filter(item => {
      const catName = nameById[item.category_id || '']?.toLowerCase() || '';
      return (
        item.name.toLowerCase().includes(term) ||
        (item.description?.toLowerCase().includes(term) ?? false) ||
        catName.includes(term)
      );
    });

    const grouped = categories.reduce((acc, category) => {
      const categoryItems = filtered.filter(item => {
        const byId = item.category_id === category.id;
        const byLegacyName = (item as any).category 
          ? (item as any).category.toLowerCase().trim() === category.name.toLowerCase().trim()
          : false;
        return byId || byLegacyName;
      });
      // Sort by display_order to ensure items appear in the correct order
      acc[category.id] = categoryItems.sort((a, b) => a.display_order - b.display_order);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    return grouped;
  }, [menuItems, categories, searchTerm]);

  // Helpers to normalize time strings to 24h HH:mm
  const normalizeTime = (value: any): string => {
    if (!value || typeof value !== 'string') return '09:00';
    const v = value.trim();
    // Already 24h HH:mm
    if (/^\d{2}:\d{2}$/.test(v)) return v;
    // 1 or 2 digit hour with AM/PM
    const ampmMatch = v.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (ampmMatch) {
      let hour = parseInt(ampmMatch[1], 10);
      const minute = ampmMatch[2];
      const ampm = ampmMatch[3].toUpperCase();
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      const hh = hour.toString().padStart(2, '0');
      return `${hh}:${minute}`;
    }
    // Fallback: try to extract digits
    const fallback = v.match(/(\d{1,2}):(\d{2})/);
    if (fallback) {
      const hh = Math.min(23, Math.max(0, parseInt(fallback[1], 10))).toString().padStart(2, '0');
      const mm = Math.min(59, Math.max(0, parseInt(fallback[2], 10))).toString().padStart(2, '0');
      return `${hh}:${mm}`;
    }
    return '09:00';
  };

  const normalizeDayHours = (dayObj: any) => ({
    open: normalizeTime(dayObj?.open),
    close: normalizeTime(dayObj?.close),
    closed: Boolean(dayObj?.closed),
  });

  // Icon options for dropdowns
  const iconOptions = [
    { value: 'Utensils', label: t('icons.utensils') },
    { value: 'Truck', label: t('icons.truck') },
    { value: 'Users', label: t('icons.users') },
    { value: 'Clock', label: t('icons.clock') },
    { value: 'Star', label: t('icons.star') },
    { value: 'MapPin', label: t('icons.mapPin') },
    { value: 'Award', label: t('icons.award') },
    { value: 'Heart', label: t('icons.heart') },
    { value: 'Coffee', label: t('icons.coffee') },
    { value: 'Zap', label: t('icons.zap') }
  ];

  const [formData, setFormData] = useState({
    restaurant_name: '',
    subdomain: '',
    domain: '',
    email: '',
    razon_social: '',
    ruc: '',
    phone: '',
    phone_country_code: '+51',
    address: '',
    whatsapp: '',
    whatsapp_country_code: '+51',
    use_coordinates: false,
    coordinates: { lat: '', lng: '' },
    theme: 'dark',
    hide_whatsapp_button_menu: false,
    hide_phone_button_menu: false,
    custom_cta_button_text: '',
    custom_cta_button_link: '',
    show_whatsapp_popup: false,
    timezone: 'America/Lima',
    country_code: 'PE',
    locale: 'es-PE',
    opening_hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    },
    social_media_links: {
      facebook: '',
      instagram: '',
      x: '',
      tiktok: '',
      youtube: '',
      linkedin: ''
    },
    delivery: {
      rappi: '',
      pedidos_ya: '',
      didi_food: ''
    },
    brand_colors: {
      primary: '#8B5CF6',
      accent: '#F59E0B'
    },
    other_customizations: {
      currency: 'S/'
    },
    primary_color: '#FFD700',
    title_font: 'Cormorant Garamond',
    body_font: 'Inter',
    title_font_weight: '400',
    title_size_scale: 0,
    hero_overlay_opacity: 70,
    template_id: '',
    // Admin content fields - Two-part titles
    homepage_hero_title_first_line: '',
    homepage_hero_title_second_line: '',
    homepage_menu_section_title_first_line: '',
    homepage_menu_section_title_second_line: '',
    homepage_contact_section_title_first_line: '',
    homepage_contact_section_title_second_line: '',
    homepage_services_section_title_first_line: '',
    homepage_services_section_title_second_line: '',
    homepage_about_section_title_first_line: '',
    homepage_about_section_title_second_line: '',
    reviews_section_title_first_line: '',
    reviews_section_title_second_line: '',
    reviews_section_description: '',
    about_page_hero_title_first_line: '',
    about_page_hero_title_second_line: '',
    about_team_section_title_first_line: '',
    about_team_section_title_second_line: '',
    contact_page_hero_title_first_line: '',
    contact_page_hero_title_second_line: '',
    menu_page_hero_title_first_line: '',
    menu_page_hero_title_second_line: '',
    reviews_page_hero_title_first_line: '',
    reviews_page_hero_title_second_line: '',
    // Other content fields
    homepage_hero_description: '',
    homepage_hero_background_url: '',
    homepage_hero_right_button_text: 'Contactar',
    homepage_hero_right_button_link: '#contact',
    homepage_about_section_description: '',
    homepage_about_section_image_url: '',
    homepage_services_section_description: '',
    homepage_menu_section_description: 'Descubre nuestra selección de platos cuidadosamente elaborados',
    homepage_contact_section_description: 'Contáctanos para vivir una experiencia gastronómica única',
    homepage_delivery_section_title: 'Delivery Partners',
    homepage_delivery_section_description: 'Ordena desde la comodidad de tu hogar',
    homepage_contact_hide_reservation_box: false,
    about_page_hero_description: 'Conoce la pasión y tradición detrás de cada plato',
    about_page_hero_background_url: '',
    about_page_about_section_image_url: '',
    about_team_section_description: '',
    menu_page_hero_description: 'Explora nuestra carta completa de especialidades culinarias',
    menu_page_hero_background_url: '',
    contact_page_hero_description: 'Estamos aquí para hacer de tu experiencia algo inolvidable',
    contact_page_hero_background_url: '',
    reviews_page_hero_description: 'Lo que nuestros clientes dicen sobre nosotros',
    reviews_page_hero_background_url: '',
    // About content fields (replacing JSONB)
    about_story: '',
    about_chef_info: '',
    about_mission: '',
    // Stats fields (3 items)
    stats_item1_icon: 'Clock',
    stats_item1_number: '',
    stats_item1_label: '',
    stats_item2_icon: 'Users',
    stats_item2_number: '',
    stats_item2_label: '',
    stats_item3_icon: 'Award',
    stats_item3_number: '',
    stats_item3_label: '',
    // Legacy stats fields
    stats_experience_number: '',
    stats_experience_label: '',
    stats_clients_number: '',
    stats_clients_label: '',
    stats_awards_number: '',
    stats_awards_label: '',
    // Services Cards (3 cards)
    services_card1_icon: 'Utensils',
    services_card1_title: '',
    services_card1_description: '',
    services_card1_button_text: '',
    services_card1_button_link: '',
    services_card2_icon: 'Truck',
    services_card2_title: '',
    services_card2_description: '',
    services_card2_button_text: '',
    services_card2_button_link: '',
    services_card3_icon: 'Users',
    services_card3_title: '',
    services_card3_description: '',
    services_card3_button_text: '',
    services_card3_button_link: '',
    // Services Features (3 features)
    services_feature1_icon: 'Clock',
    services_feature1_text: '',
    services_feature2_icon: 'Star',
    services_feature2_text: '',
    services_feature3_icon: 'MapPin',
    services_feature3_text: '',
    // Footer description
    footer_description: '',
    // Logo URLs
    header_logo_url: '',
    footer_logo_url: '',
    // Favicon
    favicon_url: 'https://storage.googleapis.com/gpt-engineer-file-uploads/OiOFvHbbnNe6vX3A3rn8oURdWx83/uploads/1759266175780-Mi Restaurante Online Favicon.png',
    // Downloadable menu
    downloadable_menu_url: '',
    // Homepage CTA Section Fields
    homepage_cta_title: '',
    homepage_cta_description: '',
    homepage_cta_button1_text: '',
    homepage_cta_button1_link: '',
    homepage_cta_button2_text: '',
    homepage_cta_button2_link: '',
    // Contact Reservation Section Fields
    contact_reservation_title: '',
    contact_reservation_description: '',
    // WhatsApp Message Fields
    whatsapp_reservation_message: '',
    whatsapp_general_message: '',
    // New Briefing Fields
    content_briefing: '',
    style_briefing: '',
    contact_delivery_briefing: '',
    // New Label Fields
    our_story_label: '',
    culinary_masterpieces_label: '',
    testimonials_label: '',
    our_services_label: '',
    contact_us_label: '',
    about_us_label: '',
    our_menu_label: '',
    our_team_label: '',
    // Premium Features
    google_analytics_id: '',
    google_search_console_verification: '',
    analytics_enabled: false,
    monthly_reports_enabled: false,
    premium_support_enabled: false,
    // Section Visibility Toggles
    homepage_about_section_visible: true,
    homepage_about_stats_visible: true,
    homepage_menu_section_visible: true,
    homepage_services_section_visible: true,
    homepage_reservations_section_visible: true,
    homepage_reviews_section_visible: true,
    homepage_contact_section_visible: true,
    homepage_contact_map_visible: true,
    homepage_delivery_section_visible: true,
    homepage_faq_section_visible: true,
    about_page_about_section_visible: true,
    about_page_about_stats_visible: true,
    about_page_stats_section_visible: true,
    about_page_team_section_visible: true,
    contact_page_contact_section_visible: true,
    contact_page_map_visible: true,
    // Site deactivation (admin only)
    is_deactivated: false,
    dashboard_is_deactivated: false,
    site_live_at: null
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (effectiveClientId) {
      console.log('Fetching data for client:', effectiveClientId);
      fetchClient();
      fetchClientSettings();
      fetchAdminContent();
      fetchCategories();
      fetchMenuItems();
      fetchTeamMembers();
      fetchReviews();
      fetchFaqs();
      fetchCarouselImages();
      fetchPremiumFeatures();
      fetchUserRole();
      fetchTemplates();
    } else {
      console.log('No effectiveClientId found');
    }
  }, [effectiveClientId]);

  // Capture initial formData snapshot after loading completes
  useEffect(() => {
    if (!loading && client && !initialFormData) {
      setInitialFormData({ ...formData });
    }
  }, [loading, client, formData, initialFormData]);

  // Detect unsaved changes by comparing current formData with initial snapshot
  useEffect(() => {
    if (initialFormData && !saving) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, initialFormData, saving]);

  // Debug team members
  useEffect(() => {
    console.log('Team members state changed:', teamMembers.length, teamMembers);
  }, [teamMembers]);

  const fetchClient = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', effectiveClientId)
        .single();

      if (error) throw error;
      
      console.log('Fetched client data:', data); // Debug log
      
      setClient(data);
      
      // Ensure opening_hours has all required days with proper defaults
      const defaultHours = { open: '09:00', close: '22:00', closed: false };
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const normalizedOpeningHours: any = {};
      
      dayOrder.forEach(day => {
        if (data.opening_hours && typeof data.opening_hours === 'object' && (data.opening_hours as any)[day]) {
          normalizedOpeningHours[day] = normalizeDayHours((data.opening_hours as any)[day]);
        } else {
          normalizedOpeningHours[day] = { ...defaultHours };
        }
      });
      
      console.log('Normalized opening hours:', normalizedOpeningHours); // Debug log
      
      setFormData(prev => ({
        ...prev,
        restaurant_name: data.restaurant_name || '',
        subdomain: data.subdomain || '',
        domain: (data as any).domain || '',
        email: data.email || '',
        razon_social: (data as any).razon_social || '',
        ruc: (data as any).ruc || '',
        phone: data.phone || '',
        phone_country_code: (data as any).phone_country_code || '+51',
        address: (() => {
          const addr = data.address;
          if (!addr) return '';
          if (typeof addr === 'string' && addr.trim().startsWith('[')) {
            return addr; // Already JSON string
          }
          return addr;
        })(),
        whatsapp: data.whatsapp || '',
        whatsapp_country_code: (data as any).whatsapp_country_code || '+51',
        use_coordinates: (data as any).use_coordinates || false,
        coordinates: (data.coordinates as any) || { lat: '', lng: '' },
        theme: (data as any).theme || 'dark',
        hide_whatsapp_button_menu: (data as any).hide_whatsapp_button_menu || false,
        hide_phone_button_menu: (data as any).hide_phone_button_menu || false,
        custom_cta_button_text: (data as any).custom_cta_button_text || '',
        custom_cta_button_link: (data as any).custom_cta_button_link || '',
        show_whatsapp_popup: (data as any).show_whatsapp_popup || false,
        template_id: (data as any).template_id || '',
        favicon_url: (data as any).favicon_url || 'https://storage.googleapis.com/gpt-engineer-file-uploads/OiOFvHbbnNe6vX3A3rn8oURdWx83/uploads/1759266175780-Mi Restaurante Online Favicon.png',
        opening_hours: normalizedOpeningHours,
        social_media_links: {
          facebook: '',
          instagram: '',
          x: '',
          tiktok: '',
          youtube: '',
          linkedin: '',
          ...(data.social_media_links as any || {})
        },
        delivery: {
          rappi: '',
          pedidos_ya: '',
          didi_food: '',
          ...(data.delivery as any || {})
        },
        brand_colors: {
          primary: '#8B5CF6',
          accent: '#F59E0B',
          ...(data.brand_colors as any || {})
        },
        other_customizations: {
          currency: 'S/',
          ...(data.other_customizations as any || {})
        },
        is_deactivated: (data as any).is_deactivated || false,
        dashboard_is_deactivated: (data as any).dashboard_is_deactivated || false,
        site_live_at: (data as any).site_live_at || null
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load client: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientSettings = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await supabase
        .from('client_settings')
        .select('*')
        .eq('client_id', effectiveClientId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setClientSettings(data as any);
        setFormData(prev => ({
          ...prev,
          primary_color: (data as any).primary_color || prev.brand_colors?.primary || '#FFD700',
          title_font: (data as any).title_font || 'Cormorant Garamond',
          body_font: (data as any).body_font || 'Inter',
          title_font_weight: (data as any).title_font_weight || '400',
          title_size_scale: (data as any).title_size_scale ?? 0,
          hero_overlay_opacity: (data as any).hero_overlay_opacity ?? 70,
          hide_whatsapp_button_menu: (data as any).hide_whatsapp_button_menu || false,
          hide_phone_button_menu: (data as any).hide_phone_button_menu || false,
          custom_cta_button_text: (data as any).custom_cta_button_text || '',
          custom_cta_button_link: (data as any).custom_cta_button_link || '',
          show_whatsapp_popup: (data as any).show_whatsapp_popup || false
        }));
      } else {
        // Use upsert to create default client_settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('client_settings')
          .upsert({
            client_id: effectiveClientId,
            primary_color: '#FFD700',
            title_font: 'Cormorant Garamond',
            body_font: 'Inter',
            title_font_weight: '400',
            hero_overlay_opacity: 70,
            hide_whatsapp_button_menu: false,
            hide_phone_button_menu: false,
            custom_cta_button_text: '',
            custom_cta_button_link: '',
            show_whatsapp_popup: false
          }, {
            onConflict: 'client_id'
          })
          .select()
          .single();

        if (createError) throw createError;
        setClientSettings(newSettings as any);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load client settings: " + error.message,
        variant: "destructive"
      });
    }
  };

  const fetchPremiumFeatures = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await supabase
        .from('premium_features')
        .select('*')
        .eq('client_id', effectiveClientId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPremiumFeatures(data);
        setFormData(prev => ({
          ...prev,
          google_analytics_id: data.google_analytics_id || '',
          google_search_console_verification: data.google_search_console_verification || '',
          analytics_enabled: data.analytics_enabled || false,
          monthly_reports_enabled: data.monthly_reports_enabled || false,
          premium_support_enabled: data.premium_support_enabled || false
        }));
      }
    } catch (error: any) {
      console.error('Failed to load premium features:', error.message);
      // Don't show error toast for premium features as they might not exist yet
    }
  };

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates...');
      const { data, error } = await supabase
        .from('templates' as any)
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        // If templates table doesn't exist, silently fail and keep empty array
        console.log('Templates table not available:', error.message);
        setTemplates([]);
        return;
      }
      console.log('Templates fetched successfully:', data);
      setTemplates((data as any) || []);
    } catch (error: any) {
      console.error('Failed to load templates:', error.message);
      setTemplates([]); // Ensure templates is always an array
    }
  };

  const fetchAdminContent = async () => {
    if (!effectiveClientId) return;
    
    try {
      // Use type assertion to bypass TypeScript errors until types are updated
      const { data, error } = await (supabase as any)
        .from('admin_content')
        .select('*')
        .eq('client_id', effectiveClientId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load admin content:', error);
        return;
      }
      
      if (data) {
        console.log('Fetched admin content data:', data); // Debug log
        
        setAdminContent(data);
        
        // Set briefing states
        setContentBriefing(data.content_briefing || '');
        setStyleBriefing(data.style_briefing || '');
        setContactDeliveryBriefing(data.contact_delivery_briefing || '');
        
        // Update form data with admin content
        setFormData(prev => ({
          ...prev,
          // Briefing fields
          content_briefing: data.content_briefing || '',
          style_briefing: data.style_briefing || '',
          contact_delivery_briefing: data.contact_delivery_briefing || '',
          // Two-part titles
          homepage_hero_title_first_line: data.homepage_hero_title_first_line || '',
          homepage_hero_title_second_line: data.homepage_hero_title_second_line || '',
          homepage_menu_section_title_first_line: data.homepage_menu_section_title_first_line || '',
          homepage_menu_section_title_second_line: data.homepage_menu_section_title_second_line || '',
          homepage_contact_section_title_first_line: data.homepage_contact_section_title_first_line || '',
          homepage_contact_section_title_second_line: data.homepage_contact_section_title_second_line || '',
          homepage_services_section_title_first_line: data.homepage_services_section_title_first_line || '',
          homepage_services_section_title_second_line: data.homepage_services_section_title_second_line || '',
          homepage_about_section_title_first_line: data.homepage_about_section_title_first_line || '',
          homepage_about_section_title_second_line: data.homepage_about_section_title_second_line || '',
          reviews_section_title_first_line: data.reviews_section_title_first_line || '',
          reviews_section_title_second_line: data.reviews_section_title_second_line || '',
          reviews_section_description: data.reviews_section_description || '',
          about_page_hero_title_first_line: data.about_page_hero_title_first_line || '',
          about_page_hero_title_second_line: data.about_page_hero_title_second_line || '',
          about_team_section_title_first_line: data.about_team_section_title_first_line || '',
          about_team_section_title_second_line: data.about_team_section_title_second_line || '',
          contact_page_hero_title_first_line: data.contact_page_hero_title_first_line || '',
          contact_page_hero_title_second_line: data.contact_page_hero_title_second_line || '',
          menu_page_hero_title_first_line: data.menu_page_hero_title_first_line || '',
          menu_page_hero_title_second_line: data.menu_page_hero_title_second_line || '',
          reviews_page_hero_title_first_line: data.reviews_page_hero_title_first_line || '',
          reviews_page_hero_title_second_line: data.reviews_page_hero_title_second_line || '',
          // Other content fields
          homepage_hero_description: data.homepage_hero_description || '',
          homepage_hero_background_url: data.homepage_hero_background_url || '',
          homepage_hero_right_button_text: data.homepage_hero_right_button_text || 'Contactar',
          homepage_hero_right_button_link: data.homepage_hero_right_button_link || '#contact',
          homepage_about_section_description: data.homepage_about_section_description || '',
          homepage_about_section_image_url: data.homepage_about_section_image_url || '',
          homepage_services_section_description: data.homepage_services_section_description || '',
          homepage_menu_section_description: data.homepage_menu_section_description || 'Descubre nuestra selección de platos cuidadosamente elaborados',
          homepage_contact_section_description: data.homepage_contact_section_description || 'Contáctanos para vivir una experiencia gastronómica única',
          homepage_delivery_section_title: data.homepage_delivery_section_title || 'Delivery Partners',
          homepage_delivery_section_description: data.homepage_delivery_section_description || 'Ordena desde la comodidad de tu hogar',
          homepage_contact_hide_reservation_box: data.homepage_contact_hide_reservation_box || false,
          about_page_hero_description: data.about_page_hero_description || 'Conoce la pasión y tradición detrás de cada plato',
          about_page_hero_background_url: data.about_page_hero_background_url || '',
          about_page_about_section_image_url: data.about_page_about_section_image_url || '',
          about_team_section_description: data.about_team_section_description || '',
          menu_page_hero_description: data.menu_page_hero_description || 'Explora nuestra carta completa de especialidades culinarias',
          menu_page_hero_background_url: data.menu_page_hero_background_url || '',
          contact_page_hero_description: data.contact_page_hero_description || 'Estamos aquí para hacer de tu experiencia algo inolvidable',
          contact_page_hero_background_url: data.contact_page_hero_background_url || '',
          reviews_page_hero_description: data.reviews_page_hero_description || 'Lo que nuestros clientes dicen sobre nosotros',
          reviews_page_hero_background_url: data.reviews_page_hero_background_url || '',
          // About content fields (replacing JSONB)
          about_story: data.about_story || '',
          about_chef_info: data.about_chef_info || '',
          about_mission: data.about_mission || '',
          // Stats fields (3 items)
          stats_item1_icon: data.stats_item1_icon || 'Clock',
          stats_item1_number: data.stats_item1_number || '',
          stats_item1_label: data.stats_item1_label || '',
          stats_item2_icon: data.stats_item2_icon || 'Users',
          stats_item2_number: data.stats_item2_number || '',
          stats_item2_label: data.stats_item2_label || '',
          stats_item3_icon: data.stats_item3_icon || 'Award',
          stats_item3_number: data.stats_item3_number || '',
          stats_item3_label: data.stats_item3_label || '',
          // Legacy stats fields
          stats_experience_number: data.stats_experience_number || '',
          stats_experience_label: data.stats_experience_label || '',
          stats_clients_number: data.stats_clients_number || '',
          stats_clients_label: data.stats_clients_label || '',
          stats_awards_number: data.stats_awards_number || '',
          stats_awards_label: data.stats_awards_label || '',
          // Services Cards (3 cards)
          services_card1_icon: data.services_card1_icon || 'Utensils',
          services_card1_title: data.services_card1_title || '',
          services_card1_description: data.services_card1_description || '',
          services_card1_button_text: data.services_card1_button_text || '',
          services_card1_button_link: data.services_card1_button_link || '',
          services_card2_icon: data.services_card2_icon || 'Truck',
          services_card2_title: data.services_card2_title || '',
          services_card2_description: data.services_card2_description || '',
          services_card2_button_text: data.services_card2_button_text || '',
          services_card2_button_link: data.services_card2_button_link || '',
          services_card3_icon: data.services_card3_icon || 'Users',
          services_card3_title: data.services_card3_title || '',
          services_card3_description: data.services_card3_description || '',
          services_card3_button_text: data.services_card3_button_text || '',
          services_card3_button_link: data.services_card3_button_link || '',
          // Services Features (3 features)
          services_feature1_icon: data.services_feature1_icon || 'Clock',
          services_feature1_text: data.services_feature1_text || '',
          services_feature2_icon: data.services_feature2_icon || 'Star',
          services_feature2_text: data.services_feature2_text || '',
          services_feature3_icon: data.services_feature3_icon || 'MapPin',
          services_feature3_text: data.services_feature3_text || '',
          // Footer description
          footer_description: data.footer_description || '',
          // Logo URLs
          header_logo_url: data.header_logo_url || '',
          footer_logo_url: data.footer_logo_url || '',
          // Downloadable menu
          downloadable_menu_url: data.downloadable_menu_url || '',
          // Homepage CTA Section Fields
          homepage_cta_title: data.homepage_cta_title || '',
          homepage_cta_description: data.homepage_cta_description || '',
          homepage_cta_button1_text: data.homepage_cta_button1_text || '',
          homepage_cta_button1_link: data.homepage_cta_button1_link || '',
          homepage_cta_button2_text: data.homepage_cta_button2_text || '',
          homepage_cta_button2_link: data.homepage_cta_button2_link || '',
          // Contact Reservation Section Fields
          contact_reservation_title: data.contact_reservation_title || '',
          contact_reservation_description: data.contact_reservation_description || '',
          // WhatsApp Message Fields
          whatsapp_reservation_message: data.whatsapp_reservation_message || '',
          whatsapp_general_message: data.whatsapp_general_message || '',
          // New Label Fields
          our_story_label: data.our_story_label || '',
          culinary_masterpieces_label: data.culinary_masterpieces_label || '',
          testimonials_label: data.testimonials_label || '',
          our_services_label: data.our_services_label || '',
          contact_us_label: data.contact_us_label || '',
          about_us_label: data.about_us_label || '',
          our_menu_label: data.our_menu_label || '',
          our_team_label: data.our_team_label || '',
          // Section Visibility Toggles
          homepage_about_section_visible: data.homepage_about_section_visible ?? true,
          homepage_about_stats_visible: data.homepage_about_stats_visible ?? true,
          homepage_menu_section_visible: data.homepage_menu_section_visible ?? true,
          homepage_services_section_visible: data.homepage_services_section_visible ?? true,
          homepage_reservations_section_visible: data.homepage_reservations_section_visible ?? true,
          homepage_reviews_section_visible: data.homepage_reviews_section_visible ?? true,
          homepage_contact_section_visible: data.homepage_contact_section_visible ?? true,
          homepage_contact_map_visible: data.homepage_contact_map_visible ?? true,
          homepage_delivery_section_visible: data.homepage_delivery_section_visible ?? true,
          homepage_faq_section_visible: data.homepage_faq_section_visible ?? true,
          about_page_about_section_visible: data.about_page_about_section_visible ?? true,
          about_page_about_stats_visible: data.about_page_about_stats_visible ?? true,
          about_page_stats_section_visible: data.about_page_stats_section_visible ?? true,
          about_page_team_section_visible: data.about_page_team_section_visible ?? true,
          contact_page_contact_section_visible: data.contact_page_contact_section_visible ?? true,
          contact_page_map_visible: data.contact_page_map_visible ?? true
        }));
      }
    } catch (error: any) {
      console.error('Failed to load admin content:', error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        console.log('User role fetched:', data?.role || 'no role');
        setUserRole(data?.role || null);
      } else {
        console.log('No user found');
      }
    } catch (error: any) {
      console.error('Failed to fetch user role:', error);
    }
  };

  const fetchCategories = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('client_id', effectiveClientId)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load categories: " + error.message,
        variant: "destructive"
      });
    }
  };

  const fetchMenuItems = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('menu_items')
        .select('*')
        .eq('client_id', effectiveClientId)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      console.log('Menu items fetched:', Array.isArray(data) ? data.length : 0);
      setMenuItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load menu items: " + error.message,
        variant: "destructive"
      });
    }
  };

  const fetchTeamMembers = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('client_id', effectiveClientId)
        .order('display_order');

      if (error) throw error;
      console.log('Team members fetched for client', effectiveClientId, ':', Array.isArray(data) ? data.length : 0, data);
      setTeamMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load team members: " + error.message,
        variant: "destructive"
      });
    }
  };

  const fetchReviews = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('client_id', effectiveClientId)
        .order('display_order');

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load reviews: " + error.message,
        variant: "destructive"
      });
    }
  };

  const fetchFaqs = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('faqs')
        .select('*')
        .eq('client_id', effectiveClientId)
        .order('display_order');

      if (error) throw error;
      setFaqs((data as FAQ[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load FAQs: " + error.message,
        variant: "destructive"
      });
    }
  };

  const fetchCarouselImages = async () => {
    if (!effectiveClientId) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('carousel_images')
        .select('*')
        .eq('client_id', effectiveClientId)
        .order('display_order');

      if (error) throw error;
      setCarouselImages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes del carousel",
        variant: "destructive",
      });
    }
  };

  const handleCarouselImageUpload = async (imageUrl: string) => {
    if (!effectiveClientId || !imageUrl) return;

    try {
      const maxOrder = Math.max(...carouselImages.map(img => img.display_order), -1);
      
      const { error } = await (supabase as any)
        .from('carousel_images')
        .insert({
          client_id: effectiveClientId,
          image_url: imageUrl,
          display_order: maxOrder + 1,
          is_active: true
        });

      if (error) throw error;
      
      await fetchCarouselImages();
      toast({
        title: "Éxito",
        description: "Imagen agregada al carousel",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo agregar la imagen al carousel",
        variant: "destructive",
      });
    }
  };

  const handleCarouselImageDelete = async (imageId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('carousel_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      await fetchCarouselImages();
      toast({
        title: "Éxito",
        description: "Imagen eliminada del carousel",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen del carousel",
        variant: "destructive",
      });
    }
  };

  // Persist only the carousel fields immediately
  const saveCarouselSetting = async (partial: { carousel_enabled?: boolean; carousel_display_order?: number }) => {
    if (!effectiveClientId) return;
    try {
      const { error } = await (supabase as any)
        .from('admin_content')
        .upsert(
          {
            client_id: effectiveClientId,
            ...partial,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'client_id' }
        );
      if (error) throw error;
      await fetchAdminContent();
      toast({ title: 'Guardado', description: 'Preferencias del carousel actualizadas' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo guardar', variant: 'destructive' });
    }
  };

  const handleSwitchToUser = async () => {
    if (!currentUser || !effectiveClientId) return;
    
    try {
      // Check if already impersonating - if so, switch back to admin
      if (isImpersonating) {
        endImpersonation();
        navigate('/admin/client-management');
        toast({ 
          title: 'Switched back to admin', 
          description: 'You are now viewing as admin' 
        });
      } else {
        // Not impersonating - switch to client view
        await startImpersonation(currentUser.id, effectiveClientId);
        navigate(`/client/dashboard/${effectiveClientId}`);
        toast({ 
          title: 'Switched to client view', 
          description: 'You are now viewing as the client' 
        });
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to switch view',
        variant: 'destructive'
      });
    }
  };

  const handleDeactivationToggle = async (checked: boolean) => {
    if (!clientId) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          is_deactivated: checked,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      setFormData({ ...formData, is_deactivated: checked });
      
      toast({
        title: checked ? 'Sitio Desactivado' : 'Sitio Activado',
        description: checked 
          ? 'El sitio ahora mostrará un aviso de desactivación'
          : 'El sitio está activo nuevamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDashboardDeactivationToggle = async (checked: boolean) => {
    if (!clientId) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          dashboard_is_deactivated: checked,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      setFormData({ ...formData, dashboard_is_deactivated: checked });
      
      toast({
        title: checked ? 'Dashboard Desactivado' : 'Dashboard Activado',
        description: checked 
          ? 'El cliente no podrá acceder al dashboard hasta que lo actives'
          : 'El cliente puede acceder al dashboard nuevamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del dashboard: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleAutoSave = async (fieldName: string, value: boolean) => {
    if (!clientId || !effectiveClientId) return;
    
    try {
      // Determine which table the field belongs to
      const clientSettingsFields = ['hide_whatsapp_button_menu', 'hide_phone_button_menu', 'show_whatsapp_popup'];
      const clientsFields = ['use_coordinates'];
      const premiumFeaturesFields = ['analytics_enabled', 'monthly_reports_enabled', 'premium_support_enabled'];
      
      // Update formData state first
      setFormData({ ...formData, [fieldName]: value });
      
      // Save to appropriate table
      if (clientSettingsFields.includes(fieldName)) {
        const { error } = await supabase
          .from('client_settings')
          .upsert({
            client_id: effectiveClientId,
            [fieldName]: value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'client_id'
          });
        if (error) throw error;
      } else if (clientsFields.includes(fieldName)) {
        const { error } = await supabase
          .from('clients')
          .update({
            [fieldName]: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);
        if (error) throw error;
      } else if (premiumFeaturesFields.includes(fieldName)) {
        const { error } = await supabase
          .from('premium_features')
          .upsert({
            client_id: effectiveClientId,
            [fieldName]: value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'client_id'
          });
        if (error) throw error;
      } else {
        // Default to admin_content for visibility toggles
        const { error } = await supabase
          .from('admin_content')
          .upsert({
            client_id: effectiveClientId,
            [fieldName]: value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'client_id'
          });
        if (error) throw error;
      }
      
      toast({
        title: 'Guardado',
        description: 'Configuración actualizada automáticamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar: ' + error.message,
        variant: 'destructive',
      });
      // Revert the state change on error
      setFormData({ ...formData, [fieldName]: !value });
    }
  };

  const handleSave = async () => {
    if (!clientId) return;
    
    setSaving(true);
    try {
      console.log('Saving opening hours:', formData.opening_hours); // Debug log
      
      // Reorganize opening_hours in correct order (Monday to Sunday)
      const orderedOpeningHours: any = {};
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      dayOrder.forEach(day => {
        if (formData.opening_hours[day]) {
          orderedOpeningHours[day] = normalizeDayHours(formData.opening_hours[day]);
        }
      });

      console.log('Ordered opening hours to save:', orderedOpeningHours); // Debug log

      // Update clients table
      const { data, error } = await supabase
        .from('clients')
        .update({
          restaurant_name: formData.restaurant_name,
          subdomain: formData.subdomain,
          email: formData.email,
          razon_social: formData.razon_social,
          ruc: formData.ruc,
          phone: formData.phone,
          phone_country_code: formData.phone_country_code,
          address: formData.address,
          whatsapp: formData.whatsapp,
          whatsapp_country_code: formData.whatsapp_country_code,
          use_coordinates: formData.use_coordinates,
          coordinates: formData.coordinates,
          theme: formData.theme,
          opening_hours: orderedOpeningHours,
          social_media_links: formData.social_media_links,
          delivery: formData.delivery,
          brand_colors: formData.brand_colors,
          other_customizations: formData.other_customizations,
          template_id: formData.template_id || null,
          timezone: formData.timezone,
          country_code: formData.country_code,
          locale: formData.locale,
          favicon_url: formData.favicon_url,
          is_deactivated: formData.is_deactivated,
          dashboard_is_deactivated: formData.dashboard_is_deactivated,
          site_live_at: formData.site_live_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Update blocked by RLS (no rows updated)');

      // Update brand_colors.primary when primary_color changes
      const updatedBrandColors = {
        ...formData.brand_colors,
        primary: formData.primary_color
      };

      // Update client_settings table
      const { error: settingsError } = await supabase
        .from('client_settings')
        .upsert({
          client_id: effectiveClientId,
          primary_color: formData.primary_color,
          title_font: formData.title_font,
          body_font: formData.body_font,
          title_font_weight: formData.title_font_weight,
          title_size_scale: formData.title_size_scale,
          hero_overlay_opacity: formData.hero_overlay_opacity,
          hide_whatsapp_button_menu: formData.hide_whatsapp_button_menu,
          hide_phone_button_menu: formData.hide_phone_button_menu,
          custom_cta_button_text: formData.custom_cta_button_text,
          custom_cta_button_link: formData.custom_cta_button_link,
          show_whatsapp_popup: formData.show_whatsapp_popup,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'client_id'
        });
        
      // Also update the brand_colors in clients table
      const { error: brandColorsError } = await supabase
        .from('clients')
        .update({
          brand_colors: updatedBrandColors,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (settingsError) throw settingsError;
      if (brandColorsError) throw brandColorsError;

      // Update admin_content table
      const { error: adminContentError } = await (supabase as any)
        .from('admin_content')
        .upsert({
          client_id: effectiveClientId,
          // Two-part titles
          homepage_hero_title_first_line: formData.homepage_hero_title_first_line,
          homepage_hero_title_second_line: formData.homepage_hero_title_second_line,
          homepage_menu_section_title_first_line: formData.homepage_menu_section_title_first_line,
          homepage_menu_section_title_second_line: formData.homepage_menu_section_title_second_line,
          homepage_contact_section_title_first_line: formData.homepage_contact_section_title_first_line,
          homepage_contact_section_title_second_line: formData.homepage_contact_section_title_second_line,
          homepage_services_section_title_first_line: formData.homepage_services_section_title_first_line,
          homepage_services_section_title_second_line: formData.homepage_services_section_title_second_line,
          homepage_about_section_title_first_line: formData.homepage_about_section_title_first_line,
          homepage_about_section_title_second_line: formData.homepage_about_section_title_second_line,
          reviews_section_title_first_line: formData.reviews_section_title_first_line,
          reviews_section_title_second_line: formData.reviews_section_title_second_line,
          reviews_section_description: formData.reviews_section_description,
          about_page_hero_title_first_line: formData.about_page_hero_title_first_line,
          about_page_hero_title_second_line: formData.about_page_hero_title_second_line,
          about_team_section_title_first_line: formData.about_team_section_title_first_line,
          about_team_section_title_second_line: formData.about_team_section_title_second_line,
          contact_page_hero_title_first_line: formData.contact_page_hero_title_first_line,
          contact_page_hero_title_second_line: formData.contact_page_hero_title_second_line,
          menu_page_hero_title_first_line: formData.menu_page_hero_title_first_line,
          menu_page_hero_title_second_line: formData.menu_page_hero_title_second_line,
          reviews_page_hero_title_first_line: formData.reviews_page_hero_title_first_line,
          reviews_page_hero_title_second_line: formData.reviews_page_hero_title_second_line,
          // Other content fields
          homepage_hero_description: formData.homepage_hero_description,
          homepage_hero_background_url: formData.homepage_hero_background_url,
          homepage_hero_right_button_text: formData.homepage_hero_right_button_text,
          homepage_hero_right_button_link: formData.homepage_hero_right_button_link,
          homepage_about_section_description: formData.homepage_about_section_description,
          homepage_about_section_image_url: formData.homepage_about_section_image_url,
          homepage_services_section_description: formData.homepage_services_section_description,
          homepage_menu_section_description: formData.homepage_menu_section_description,
          homepage_contact_section_description: formData.homepage_contact_section_description,
          homepage_delivery_section_title: formData.homepage_delivery_section_title,
          homepage_delivery_section_description: formData.homepage_delivery_section_description,
          homepage_contact_hide_reservation_box: formData.homepage_contact_hide_reservation_box,
          about_page_hero_description: formData.about_page_hero_description,
          about_page_hero_background_url: formData.about_page_hero_background_url,
          about_page_about_section_image_url: formData.about_page_about_section_image_url,
          about_team_section_description: formData.about_team_section_description,
          menu_page_hero_description: formData.menu_page_hero_description,
          menu_page_hero_background_url: formData.menu_page_hero_background_url,
          contact_page_hero_description: formData.contact_page_hero_description,
          contact_page_hero_background_url: formData.contact_page_hero_background_url,
          reviews_page_hero_description: formData.reviews_page_hero_description,
          reviews_page_hero_background_url: formData.reviews_page_hero_background_url,
          // Carousel settings
          carousel_enabled: (adminContent as any)?.carousel_enabled ?? true,
          carousel_display_order: (adminContent as any)?.carousel_display_order ?? 2,
          // About content fields (replacing JSONB)
          about_story: formData.about_story,
          about_chef_info: formData.about_chef_info,
          about_mission: formData.about_mission,
          // Stats fields (3 items)
          stats_item1_icon: formData.stats_item1_icon,
          stats_item1_number: formData.stats_item1_number,
          stats_item1_label: formData.stats_item1_label,
          stats_item2_icon: formData.stats_item2_icon,
          stats_item2_number: formData.stats_item2_number,
          stats_item2_label: formData.stats_item2_label,
          stats_item3_icon: formData.stats_item3_icon,
          stats_item3_number: formData.stats_item3_number,
          stats_item3_label: formData.stats_item3_label,
          // Legacy stats fields
          stats_experience_number: formData.stats_experience_number,
          stats_experience_label: formData.stats_experience_label,
          stats_clients_number: formData.stats_clients_number,
          stats_clients_label: formData.stats_clients_label,
          stats_awards_number: formData.stats_awards_number,
          stats_awards_label: formData.stats_awards_label,
          // Services Cards (3 cards)
          services_card1_icon: formData.services_card1_icon,
          services_card1_title: formData.services_card1_title,
          services_card1_description: formData.services_card1_description,
          services_card1_button_text: formData.services_card1_button_text,
          services_card1_button_link: formData.services_card1_button_link,
          services_card2_icon: formData.services_card2_icon,
          services_card2_title: formData.services_card2_title,
          services_card2_description: formData.services_card2_description,
          services_card2_button_text: formData.services_card2_button_text,
          services_card2_button_link: formData.services_card2_button_link,
          services_card3_icon: formData.services_card3_icon,
          services_card3_title: formData.services_card3_title,
          services_card3_description: formData.services_card3_description,
          services_card3_button_text: formData.services_card3_button_text,
          services_card3_button_link: formData.services_card3_button_link,
          // Services Features (3 features)
          services_feature1_icon: formData.services_feature1_icon,
          services_feature1_text: formData.services_feature1_text,
          services_feature2_icon: formData.services_feature2_icon,
          services_feature2_text: formData.services_feature2_text,
          services_feature3_icon: formData.services_feature3_icon,
          services_feature3_text: formData.services_feature3_text,
          // Footer description
          footer_description: formData.footer_description,
          // Logo URLs
          header_logo_url: formData.header_logo_url,
          footer_logo_url: formData.footer_logo_url,
          // Downloadable menu
          downloadable_menu_url: formData.downloadable_menu_url,
          // Homepage CTA Section Fields
          homepage_cta_title: formData.homepage_cta_title,
          homepage_cta_description: formData.homepage_cta_description,
          homepage_cta_button1_text: formData.homepage_cta_button1_text,
          homepage_cta_button1_link: formData.homepage_cta_button1_link,
          homepage_cta_button2_text: formData.homepage_cta_button2_text,
          homepage_cta_button2_link: formData.homepage_cta_button2_link,
          // Contact Reservation Section Fields
          contact_reservation_title: formData.contact_reservation_title,
          contact_reservation_description: formData.contact_reservation_description,
          // WhatsApp Message Fields
          whatsapp_reservation_message: formData.whatsapp_reservation_message,
          whatsapp_general_message: formData.whatsapp_general_message,
          // Briefing fields
          content_briefing: formData.content_briefing,
          style_briefing: formData.style_briefing,
          contact_delivery_briefing: formData.contact_delivery_briefing,
          // Label Fields
          our_story_label: formData.our_story_label,
          culinary_masterpieces_label: formData.culinary_masterpieces_label,
          testimonials_label: formData.testimonials_label,
          our_services_label: formData.our_services_label,
          contact_us_label: formData.contact_us_label,
          about_us_label: formData.about_us_label,
          our_menu_label: formData.our_menu_label,
          our_team_label: formData.our_team_label,
          // Section Visibility Toggles
          homepage_about_section_visible: formData.homepage_about_section_visible,
          homepage_about_stats_visible: formData.homepage_about_stats_visible,
          homepage_menu_section_visible: formData.homepage_menu_section_visible,
          homepage_services_section_visible: formData.homepage_services_section_visible,
          homepage_reservations_section_visible: formData.homepage_reservations_section_visible,
          homepage_reviews_section_visible: formData.homepage_reviews_section_visible,
          homepage_contact_section_visible: formData.homepage_contact_section_visible,
          homepage_contact_map_visible: formData.homepage_contact_map_visible,
          homepage_delivery_section_visible: formData.homepage_delivery_section_visible,
          homepage_faq_section_visible: formData.homepage_faq_section_visible,
          about_page_about_section_visible: formData.about_page_about_section_visible,
          about_page_about_stats_visible: formData.about_page_about_stats_visible,
          about_page_stats_section_visible: formData.about_page_stats_section_visible,
          about_page_team_section_visible: formData.about_page_team_section_visible,
          contact_page_contact_section_visible: formData.contact_page_contact_section_visible,
          contact_page_map_visible: formData.contact_page_map_visible,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'client_id'
        });

      if (adminContentError) throw adminContentError;

      // Update or create premium features if any premium feature fields have values
      if (formData.google_analytics_id || formData.google_search_console_verification || 
          formData.analytics_enabled || formData.monthly_reports_enabled || formData.premium_support_enabled) {
        const { error: premiumFeaturesError } = await supabase
          .from('premium_features')
          .upsert({
            client_id: clientId,
            google_analytics_id: formData.google_analytics_id,
            google_search_console_verification: formData.google_search_console_verification,
            analytics_enabled: formData.analytics_enabled,
            monthly_reports_enabled: formData.monthly_reports_enabled,
            premium_support_enabled: formData.premium_support_enabled,
            analytics_setup_date: formData.analytics_enabled && formData.google_analytics_id ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'client_id'
          });

        if (premiumFeaturesError) throw premiumFeaturesError;
      }

      console.log('Saved data response:', data); // Debug log
      
      // Update local state with the response data to ensure UI reflects database state
      setClient(data);
      
      // Properly update opening_hours from response with normalization
      if (data.opening_hours && typeof data.opening_hours === 'object' && !Array.isArray(data.opening_hours)) {
        const defaultHours = { open: '09:00', close: '22:00', closed: false };
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const normalizedOpeningHours: any = {};
        
        dayOrder.forEach(day => {
          if ((data.opening_hours as any)[day]) {
            normalizedOpeningHours[day] = normalizeDayHours((data.opening_hours as any)[day]);
          } else {
            normalizedOpeningHours[day] = { ...defaultHours };
          }
        });
        
        console.log('Updated form with normalized opening hours:', normalizedOpeningHours); // Debug log
        
        setFormData(prevData => ({
          ...prevData,
          opening_hours: normalizedOpeningHours
        }));
      }

      toast({
        title: "Success",
        description: "Client settings updated successfully",
      });
      
      // Reset unsaved changes flag and update initial snapshot
      setHasUnsavedChanges(false);
      setInitialFormData({ ...formData });
    } catch (error: any) {
      console.error('Save error:', error); // Debug log
      toast({
        title: "Error",
        description: "Failed to update client: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    console.log('handleSaveCategory called'); // Debug log
    if (!clientId) return;
    
    try {
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id); // Debug log
        const { data, error } = await supabase
          .from('menu_categories')
          .update({ 
            name: categoryForm.name,
            display_order: categoryForm.display_order 
          })
          .eq('id', editingCategory.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Update blocked by RLS');
      } else {
        console.log('Creating new category'); // Debug log
        const { data, error } = await supabase
          .from('menu_categories')
          .insert({
            client_id: effectiveClientId,
            name: categoryForm.name,
            display_order: categoryForm.display_order + 1  // Use 1-based indexing like regular system
          })
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Insert blocked by RLS');
      }
      
      await fetchCategories();
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', display_order: 0 });
      toast({ title: "Success", description: "Category saved successfully" });
    } catch (error: any) {
      console.error('Category save error:', error); // Debug log
      toast({
        title: "Error",
        description: "Failed to save category: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar esta categoría?')) {
      return;
    }

    try {
      // Soft delete - set is_active to false
      const { data, error } = await supabase
        .from('menu_categories')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Delete blocked by RLS');

      // Also deactivate all items in this category
      const category = categories.find(c => c.id === id);
      if (category) {
        const { error: itemsError } = await supabase
          .from('menu_items')
          .update({ is_active: false })
          .eq('client_id', clientId)
          .eq('category_id', id);

        if (itemsError) throw itemsError;
      }

      await fetchCategories();
      await fetchMenuItems();
      toast({ title: "Success", description: "Category and its items deactivated successfully" });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to deactivate category: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleCompleteDeleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    const categoryItems = filteredAndGroupedMenuItems[id] || [];
    
    if (categoryItems.length > 0) {
      toast({
        title: "Error",
        description: "Cannot delete category with items. Delete or move items first.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría permanentemente?')) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      await fetchCategories();
      toast({ title: "Success", description: "Category deleted permanently" });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to delete category: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleCategoryStatus = async (id: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Update blocked by RLS');

      // Update all items in this category
      const { error: itemsError } = await supabase
        .from('menu_items')
        .update({ is_active: isActive })
        .eq('client_id', clientId)
        .eq('category_id', id);

      if (itemsError) throw itemsError;

      await fetchCategories();
      await fetchMenuItems();
      toast({ 
        title: "Success", 
        description: isActive ? "Category and items activated" : "Category and items deactivated"
      });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to update category status: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleItemStatus = async (id: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Update blocked by RLS');

      await fetchMenuItems();
      toast({ 
        title: "Success", 
        description: isActive ? "Item activated" : "Item deactivated"
      });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to update item status: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveMenuItem = async () => {
    if (!clientId) return;
    
    try {
      const selectedCategoryName = categories.find(c => c.id === menuItemForm.category_id)?.name || null;

      if (editingMenuItem) {
        const { data, error } = await supabase
          .from('menu_items')
          .update({
            name: menuItemForm.name,
            description: menuItemForm.description,
            price: menuItemForm.price,
            category_id: menuItemForm.category_id || null,
            category: selectedCategoryName || undefined,
            image_url: menuItemForm.image_url,
            show_on_homepage: menuItemForm.show_on_homepage,
            show_image_menu: menuItemForm.show_image_menu,
            show_image_home: menuItemForm.show_image_home
          })
          .eq('id', editingMenuItem.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Update blocked by RLS');
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert({
            client_id: effectiveClientId,
            name: menuItemForm.name,
            description: menuItemForm.description,
            price: menuItemForm.price,
            category_id: menuItemForm.category_id || null,
            category: selectedCategoryName || undefined,
            image_url: menuItemForm.image_url,
            show_on_homepage: menuItemForm.show_on_homepage,
            show_image_menu: menuItemForm.show_image_menu,
            show_image_home: menuItemForm.show_image_home
          })
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Insert blocked by RLS');
      }
      
      await fetchMenuItems();
      setShowMenuItemDialog(false);
      setEditingMenuItem(null);
      setMenuItemForm({
        name: '', description: '', price: 0, category_id: '', image_url: '',
        show_on_homepage: false, show_image_menu: true, show_image_home: false
      });
      toast({ title: "Success", description: "Menu item saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save menu item: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Delete blocked by RLS');
      await fetchMenuItems();
      toast({ title: "Success", description: "Menu item deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete menu item: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleMoveMenuItemUp = async (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const categoryItems = menuItems.filter(i => i.category_id === item.category_id);
    const sortedItems = [...categoryItems].sort((a, b) => a.display_order - b.display_order);
    const index = sortedItems.findIndex(i => i.id === itemId);
    
    if (index > 0) {
      const swapped = [...sortedItems];
      [swapped[index], swapped[index - 1]] = [swapped[index - 1], swapped[index]];
      
      const updated = swapped.map((item, idx) => ({ 
        ...item, 
        display_order: idx 
      }));
      
      setMenuItems(menuItems.map(i => {
        const updatedItem = updated.find(u => u.id === i.id);
        return updatedItem || i;
      }));
      
      try {
        const updatePromises = updated.map((item) =>
          supabase
            .from('menu_items')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchMenuItems();
      }
    }
  };

  const handleMoveMenuItemDown = async (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const categoryItems = menuItems.filter(i => i.category_id === item.category_id);
    const sortedItems = [...categoryItems].sort((a, b) => a.display_order - b.display_order);
    const index = sortedItems.findIndex(i => i.id === itemId);
    
    if (index < sortedItems.length - 1) {
      const swapped = [...sortedItems];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      
      const updated = swapped.map((item, idx) => ({ 
        ...item, 
        display_order: idx 
      }));
      
      setMenuItems(menuItems.map(i => {
        const updatedItem = updated.find(u => u.id === i.id);
        return updatedItem || i;
      }));
      
      try {
        const updatePromises = updated.map((item) =>
          supabase
            .from('menu_items')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchMenuItems();
      }
    }
  };

  // Team Member CRUD Functions
  const handleSaveTeamMember = async () => {
    if (!clientId) return;
    
    try {
      if (editingTeamMember) {
        const { data, error } = await supabase
          .from('team_members')
          .update({
            name: teamMemberForm.name,
            title: teamMemberForm.title,
            bio: teamMemberForm.bio,
            image_url: teamMemberForm.image_url,
            display_order: teamMemberForm.display_order,
          })
          .eq('id', editingTeamMember.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Update blocked by RLS');
      } else {
        const { data, error } = await supabase
          .from('team_members')
          .insert({
            client_id: effectiveClientId,
            name: teamMemberForm.name,
            title: teamMemberForm.title,
            bio: teamMemberForm.bio,
            image_url: teamMemberForm.image_url,
            display_order: teamMemberForm.display_order,
            is_active: true,
          })
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Insert blocked by RLS');
      }
      
      await fetchTeamMembers();
      setShowTeamMemberDialog(false);
      setEditingTeamMember(null);
      setTeamMemberForm({ name: '', title: '', bio: '', image_url: '', display_order: 0 });
      toast({ title: "Success", description: "Team member saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save team member: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Delete blocked by RLS');
      await fetchTeamMembers();
      toast({ title: "Success", description: "Team member deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete team member: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleMoveTeamMemberUp = async (memberId: string) => {
    const sortedMembers = [...teamMembers].sort((a, b) => a.display_order - b.display_order);
    const index = sortedMembers.findIndex(m => m.id === memberId);
    
    if (index > 0) {
      const swapped = [...sortedMembers];
      [swapped[index], swapped[index - 1]] = [swapped[index - 1], swapped[index]];
      
      const updated = swapped.map((member, idx) => ({ 
        ...member, 
        display_order: idx 
      }));
      
      setTeamMembers(updated);
      
      try {
        const updatePromises = updated.map((item) =>
          supabase
            .from('team_members')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchTeamMembers();
      }
    }
  };

  const handleMoveTeamMemberDown = async (memberId: string) => {
    const sortedMembers = [...teamMembers].sort((a, b) => a.display_order - b.display_order);
    const index = sortedMembers.findIndex(m => m.id === memberId);
    
    if (index < sortedMembers.length - 1) {
      const swapped = [...sortedMembers];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      
      const updated = swapped.map((member, idx) => ({ 
        ...member, 
        display_order: idx 
      }));
      
      setTeamMembers(updated);
      
      try {
        const updatePromises = updated.map((item) =>
          supabase
            .from('team_members')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchTeamMembers();
      }
    }
  };

  // Review CRUD Functions
  const handleSaveReview = async () => {
    if (!clientId) return;
    
    try {
      if (editingReview) {
        const { data, error } = await supabase
          .from('reviews')
          .update({
            reviewer_name: reviewForm.reviewer_name,
            review_text: reviewForm.review_text,
            star_rating: reviewForm.star_rating,
            display_order: reviewForm.display_order,
            review_date: reviewForm.review_date ? format(reviewForm.review_date, 'yyyy-MM-dd') : null,
          })
          .eq('id', editingReview.id);

        if (error) throw error;
        
        setReviews(reviews.map(r => r.id === editingReview.id ? { ...r, ...reviewForm, review_date: reviewForm.review_date ? format(reviewForm.review_date, 'yyyy-MM-dd') : null } : r) as Review[]);
        setEditingReview(null);
      } else {
        const maxOrder = reviews.reduce((max, r) => Math.max(max, r.display_order), 0);
        
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            client_id: effectiveClientId,
            reviewer_name: reviewForm.reviewer_name,
            review_text: reviewForm.review_text,
            star_rating: reviewForm.star_rating,
            display_order: maxOrder + 1,
            is_active: true,
            review_date: reviewForm.review_date ? format(reviewForm.review_date, 'yyyy-MM-dd') : null,
          })
          .select();

        if (error) throw error;
        
        if (data?.[0]) {
          setReviews([...reviews, data[0] as Review]);
        }
      }
      
setReviewForm({ reviewer_name: '', review_text: '', star_rating: 5, display_order: 0, review_date: null });
      setShowReviewDialog(false);
      
      toast({
        title: "Success",
        description: editingReview ? "Review updated successfully" : "Review added successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save review: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReviews(reviews.filter(r => r.id !== id));
      
      toast({
        title: "Success",
        description: "Review deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete review: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleMoveReviewUp = async (reviewId: string) => {
    const sortedReviews = [...reviews].sort((a, b) => a.display_order - b.display_order);
    const index = sortedReviews.findIndex(r => r.id === reviewId);
    
    if (index > 0) {
      const swapped = [...sortedReviews];
      [swapped[index], swapped[index - 1]] = [swapped[index - 1], swapped[index]];
      
      const updated = swapped.map((review, idx) => ({ 
        ...review, 
        display_order: idx 
      }));
      
      setReviews(updated);
      
      try {
        const updatePromises = updated.map((item) =>
          supabase
            .from('reviews')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchReviews();
      }
    }
  };

  const handleMoveReviewDown = async (reviewId: string) => {
    const sortedReviews = [...reviews].sort((a, b) => a.display_order - b.display_order);
    const index = sortedReviews.findIndex(r => r.id === reviewId);
    
    if (index < sortedReviews.length - 1) {
      const swapped = [...sortedReviews];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      
      const updated = swapped.map((review, idx) => ({ 
        ...review, 
        display_order: idx 
      }));
      
      setReviews(updated);
      
      try {
        const updatePromises = updated.map((item) =>
          supabase
            .from('reviews')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchReviews();
      }
    }
  };

  // FAQ CRUD Functions
  const handleSaveFaq = async () => {
    if (!clientId) return;
    
    try {
      if (editingFaq) {
        const { data, error } = await (supabase as any)
          .from('faqs')
          .update({
            question: faqForm.question,
            answer: faqForm.answer,
          })
          .eq('id', editingFaq.id)
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setFaqs(faqs.map(f => f.id === editingFaq.id ? data : f));
        }
      } else {
        // Get the highest display_order and add 1
        const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.display_order)) : -1;
        
        const { data, error } = await (supabase as any)
          .from('faqs')
          .insert({
            client_id: effectiveClientId,
            question: faqForm.question,
            answer: faqForm.answer,
            display_order: maxOrder + 1,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setFaqs([...faqs, data as FAQ]);
        }
      }

      setShowFaqDialog(false);
      setEditingFaq(null);
      setFaqForm({ question: '', answer: '', display_order: 0 });
      
      toast({
        title: "Éxito",
        description: "FAQ guardado exitosamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save FAQ: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try{
      const { error } = await (supabase as any)
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFaqs(faqs.filter(f => f.id !== id));
      
      toast({
        title: "Éxito",
        description: "FAQ eliminado exitosamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete FAQ: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleMoveFaqUp = async (faqId: string) => {
    const sortedFaqs = [...faqs].sort((a, b) => a.display_order - b.display_order);
    const index = sortedFaqs.findIndex(f => f.id === faqId);
    
    if (index > 0) {
      // Swap items
      const swapped = [...sortedFaqs];
      [swapped[index], swapped[index - 1]] = [swapped[index - 1], swapped[index]];

      // Reassign display_order values
      const updated = swapped.map((faq, idx) => ({ 
        ...faq, 
        display_order: idx 
      }));
      
      // Update UI immediately
      setFaqs(updated);
      
      // Update database in background
      try {
        const updatePromises = updated.map((item) =>
          (supabase as any)
            .from('faqs')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchFaqs();
      }
    }
  };

  const handleMoveFaqDown = async (faqId: string) => {
    const sortedFaqs = [...faqs].sort((a, b) => a.display_order - b.display_order);
    const index = sortedFaqs.findIndex(f => f.id === faqId);
    
    if (index < sortedFaqs.length - 1) {
      // Swap items
      const swapped = [...sortedFaqs];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      
      // Reassign display_order values
      const updated = swapped.map((faq, idx) => ({ 
        ...faq, 
        display_order: idx 
      }));
      
      // Update UI immediately
      setFaqs(updated);
      
      // Update database in background
      try {
        const updatePromises = updated.map((item) =>
          (supabase as any)
            .from('faqs')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchFaqs();
      }
    }
  };

  // Three separate generation processes
  const handleGenerateContent = async () => {
    if (!contentBriefing.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el briefing de contenido antes de generar",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Process 1: Content Generation (existing process)
      const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-client-content', {
        body: {
          briefing: contentBriefing,
          clientId,
          restaurantName: client?.restaurant_name,
          address: client?.address
        }
      });

      if (contentError) throw contentError;

      // Process 2: Practical Info Population
      if (contactDeliveryBriefing.trim()) {
        const { data: practicalData, error: practicalError } = await supabase.functions.invoke('populate-practical-info', {
          body: {
            briefing: contactDeliveryBriefing,
            clientId,
          }
        });

        if (practicalError) {
          console.error('Error populating practical info:', practicalError);
        }
      }

      // Process 3: Style/Branding Generation
      if (styleBriefing.trim()) {
        const { data: styleData, error: styleError } = await supabase.functions.invoke('generate-branding', {
          body: {
            briefing: styleBriefing,
            clientId,
            restaurantName: client?.restaurant_name
          }
        });

        if (styleError) {
          console.error('Error generating branding:', styleError);
        }
      }

      toast({
        title: "¡Éxito!",
        description: "Todo el contenido ha sido generado exitosamente. Revisa las pestañas para ver los cambios.",
      });

      // Reload all data to show updates
      fetchClient();
      fetchClientSettings();
      fetchAdminContent();
      
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Error al generar contenido: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const openCategoryDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, display_order: category.display_order });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', display_order: categories.length + 1 }); // Use 1-based indexing
    }
    setShowCategoryDialog(true);
  };

  const openMenuItemDialog = (item?: MenuItem, defaultCategoryId?: string) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuItemForm({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category_id: item.category_id || '',
        image_url: item.image_url || '',
        show_on_homepage: item.show_on_homepage,
        show_image_menu: item.show_image_menu,
        show_image_home: item.show_image_home
      });
    } else {
      setEditingMenuItem(null);
      setMenuItemForm({
        name: '', description: '', price: 0, category_id: defaultCategoryId || '', image_url: '',
        show_on_homepage: false, show_image_menu: true, show_image_home: false
      });
    }
    setShowMenuItemDialog(true);
  };

  // Team Member Drag Handler
  const handleTeamMemberDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = teamMembers.findIndex((item) => item.id === active.id);
      const newIndex = teamMembers.findIndex((item) => item.id === over?.id);

      const reorderedMembers = arrayMove(teamMembers, oldIndex, newIndex);
      
      try {
        for (let i = 0; i < reorderedMembers.length; i++) {
          await supabase
            .from('team_members')
            .update({ display_order: i + 1 })
            .eq('id', reorderedMembers[i].id);
        }
        
        await fetchTeamMembers();
        toast({ title: "Success", description: "Team member order updated" });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update team member order: " + error.message,
          variant: "destructive"
        });
        await fetchTeamMembers();
      }
    }
  };

  // Review Drag Handler
  const handleReviewDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = reviews.findIndex((item) => item.id === active.id);
      const newIndex = reviews.findIndex((item) => item.id === over?.id);

      const reorderedReviews = arrayMove(reviews, oldIndex, newIndex);
      
      try {
        for (let i = 0; i < reorderedReviews.length; i++) {
          await supabase
            .from('reviews')
            .update({ display_order: i + 1 })
            .eq('id', reorderedReviews[i].id);
        }
        
        await fetchReviews();
        toast({ title: "Success", description: "Review order updated" });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update review order: " + error.message,
          variant: "destructive"
        });
        await fetchReviews();
      }
    }
  };

  // Dialog Opening Functions
  const openTeamMemberDialog = (member?: TeamMember) => {
    if (member) {
      setEditingTeamMember(member);
      setTeamMemberForm({
        name: member.name,
        title: member.title,
        bio: member.bio || '',
        image_url: member.image_url || '',
        display_order: member.display_order,
      });
    } else {
      setEditingTeamMember(null);
      setTeamMemberForm({ name: '', title: '', bio: '', image_url: '', display_order: 0 });
    }
    setShowTeamMemberDialog(true);
  };

  const openReviewDialog = (review?: Review) => {
    if (review) {
      setEditingReview(review);
setReviewForm({
        reviewer_name: review.reviewer_name,
        review_text: review.review_text,
        star_rating: review.star_rating,
        display_order: review.display_order,
        review_date: review.review_date ? new Date(review.review_date) : null,
      });
    } else {
      setEditingReview(null);
      setReviewForm({ reviewer_name: '', review_text: '', star_rating: 5, display_order: 0, review_date: null });
    }
    setShowReviewDialog(true);
  };

  const openFaqDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order,
      });
    } else {
      setEditingFaq(null);
      const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.display_order)) : -1;
      setFaqForm({ question: '', answer: '', display_order: maxOrder + 1 });
    }
    setShowFaqDialog(true);
  };

  const handleMoveCategoryUp = async (categoryId: string) => {
    const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);
    const index = sortedCategories.findIndex(c => c.id === categoryId);
    
    if (index > 0) {
      const swapped = [...sortedCategories];
      [swapped[index], swapped[index - 1]] = [swapped[index - 1], swapped[index]];
      
      const updated = swapped.map((cat, idx) => ({ 
        ...cat, 
        display_order: idx 
      }));
      
      setCategories(updated);
      
      try {
        const updatePromises = updated.map((cat) =>
          supabase
            .from('menu_categories')
            .update({ display_order: cat.display_order })
            .eq('id', cat.id)
        );
        
        await Promise.all(updatePromises);
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchCategories();
      }
    }
  };

  const handleMoveCategoryDown = async (categoryId: string) => {
    const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);
    const index = sortedCategories.findIndex(c => c.id === categoryId);
    
    if (index < sortedCategories.length - 1) {
      const swapped = [...sortedCategories];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      
      const updated = swapped.map((cat, idx) => ({ 
        ...cat, 
        display_order: idx 
      }));
      
      setCategories(updated);
      
      try {
        const updatePromises = updated.map((cat) =>
          supabase
            .from('menu_categories')
            .update({ display_order: cat.display_order })
            .eq('id', cat.id)
        );
        
        await Promise.all(updatePromises);
        toast({ title: "Éxito", description: "Orden actualizado" });
      } catch (error: any) {
        toast({ title: "Error", description: "Error al actualizar", variant: "destructive" });
        fetchCategories();
      }
    }
  };

  const handleMenuItemDragEnd = async (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const categoryItems = filteredAndGroupedMenuItems[categoryId] || [];
      const oldIndex = categoryItems.findIndex((item) => item.id === active.id);
      const newIndex = categoryItems.findIndex((item) => item.id === over?.id);

      // Only allow reordering within this category
      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedItems = arrayMove(categoryItems, oldIndex, newIndex);

      // Rebuild menuItems with the reordered items for this category
      const newMenuItems: MenuItem[] = [];
      let idx = 0;
      for (const it of menuItems) {
        if (it.category_id === categoryId) {
          newMenuItems.push(reorderedItems[idx++]);
        } else {
          newMenuItems.push(it);
        }
      }

      setMenuItems(newMenuItems);

      try {
        // Persist display_order in DB for this category
        for (let i = 0; i < reorderedItems.length; i++) {
          await (supabase as any)
            .from('menu_items')
            .update({ display_order: i + 1 })
            .eq('id', reorderedItems[i].id);
        }
        await fetchMenuItems();
        toast({ title: "Success", description: "Item order saved" });
      } catch (error: any) {
        toast({
          title: "Error", 
          description: "Failed to update menu item order: " + error.message,
          variant: "destructive"
        });
        await fetchMenuItems();
      }
    }
  };


  const handleTabChange = (value: string) => {
    // Show warning for non-admin users accessing sensitive tabs
    if (userRole !== 'admin' && (value === 'branding' || value === 'content' || value === 'navigation-visibility') && !userConfirmedWarning) {
      setWarningTabName(
        value === 'branding' ? 'configuración de marca' : 
        value === 'navigation-visibility' ? 'configuración de navegación' : 
        'cambio de contenido'
      );
      setShowWarningOverlay(true);
      return;
    }
  };

  const handleWarningConfirm = () => {
    setUserConfirmedWarning(true);
    setShowWarningOverlay(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {userRole === 'admin' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin/client-management')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              {userRole === 'admin' ? 'Edit Client Settings' : 'Dashboard'}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-muted-foreground truncate">{client.restaurant_name}</p>
              {userRole === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchToUser}
                  className="gap-2 shrink-0"
                >
                  <UserCog className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {location.pathname.startsWith('/client/') ? 'Switch Back to Admin' : 'Switch to User'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!saving && (
            <div className="text-sm flex items-center gap-1.5">
              {hasUnsavedChanges ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="hidden sm:inline text-destructive">Sin guardar</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="hidden sm:inline text-green-600 dark:text-green-400">Guardado</span>
                </>
              )}
            </div>
          )}
          <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-initial">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('common.save')}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={(val) => { setActiveTab(val); handleTabChange(val); }}>
        <div className="mb-4">
          <Select value={activeTab} onValueChange={(val) => { setActiveTab(val); handleTabChange(val); }}>
            <SelectTrigger className="w-full" aria-label="Selecciona sección">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 max-h-[60vh] bg-popover">
              {showTab('basic') && <SelectItem value="basic">{t('nav.general')}</SelectItem>}
              {showTab('domain') && <SelectItem value="domain">Dominio</SelectItem>}
              {showTab('metadata') && <SelectItem value="metadata">SEO Metadata</SelectItem>}
              {showTab('hours') && <SelectItem value="hours">{t('general.openingHours')}</SelectItem>}
              {showTab('social') && <SelectItem value="social">{t('general.socialMedia')}</SelectItem>}
              {showTab('delivery') && <SelectItem value="delivery">{t('general.deliveryInfo')}</SelectItem>}
              {showTab('branding') && <SelectItem value="branding">Marca</SelectItem>}
              {showTab('navigation-visibility') && <SelectItem value="navigation-visibility">Navegación y Visibilidad</SelectItem>}
              {showTab('content') && <SelectItem value="content">Contenido</SelectItem>}
              {showTab('briefing') && <SelectItem value="briefing">{t('nav.briefing')}</SelectItem>}
              {showTab('menu') && <SelectItem value="menu">{t('nav.menu')}</SelectItem>}
              {showTab('team') && <SelectItem value="team">{t('nav.team')}</SelectItem>}
              {showTab('reviews') && <SelectItem value="reviews">{t('nav.reviews')}</SelectItem>}
              {showTab('faqs') && <SelectItem value="faqs">Preguntas Frecuentes</SelectItem>}
              {showTab('carousel') && <SelectItem value="carousel">{t('nav.carousel')}</SelectItem>}
              {showTab('custom-images') && <SelectItem value="custom-images">{t('nav.images')}</SelectItem>}
              {showTab('discounts') && <SelectItem value="discounts">Descuentos</SelectItem>}
              {showTab('advanced') && <SelectItem value="advanced">Avanzado</SelectItem>}
              {showTab('control') && <SelectItem value="control">Control de Sitio</SelectItem>}
            </SelectContent>
          </Select>
        </div>


        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>{t('general.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurant_name">{t('general.restaurantName')}</Label>
                  <Input
                    id="restaurant_name"
                    value={formData.restaurant_name}
                    onChange={(e) => setFormData({...formData, restaurant_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('general.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="razon_social">Razón Social</Label>
                  <Input
                    id="razon_social"
                    value={formData.razon_social || ''}
                    onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ruc">RUC</Label>
                  <Input
                    id="ruc"
                    value={formData.ruc || ''}
                    onChange={(e) => setFormData({...formData, ruc: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t('general.phone')}</Label>
                  <PhoneInput
                    countryCode={formData.phone_country_code}
                    phoneNumber={formData.phone}
                    onCountryCodeChange={(code) => setFormData({...formData, phone_country_code: code})}
                    onPhoneNumberChange={(number) => setFormData({...formData, phone: number})}
                    placeholder={t('general.phonePlaceholder')}
                    maxLength={12}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">{t('general.whatsapp')}</Label>
                  <PhoneInput
                    countryCode={formData.whatsapp_country_code}
                    phoneNumber={formData.whatsapp}
                    onCountryCodeChange={(code) => setFormData({...formData, whatsapp_country_code: code})}
                    onPhoneNumberChange={(number) => setFormData({...formData, whatsapp: number})}
                    placeholder={t('general.whatsappPlaceholder')}
                    maxLength={12}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">{t('general.address')}</Label>
                <MultiLocationInput
                  locations={(() => {
                    const a: any = (formData as any).address;
                    if (Array.isArray(a)) return a.length ? a : [''];
                    if (typeof a === 'string' && a.trim().startsWith('[')) {
                      try {
                        const parsed = JSON.parse(a);
                        return Array.isArray(parsed) && parsed.length ? parsed : [''];
                      } catch {
                        return a ? [a] : [''];
                      }
                    }
                    return a ? [a] : [''];
                  })()}
                  onChange={(locations) => setFormData({ ...formData, address: JSON.stringify(locations) })}
                  placeholder="Av. Principal 123, Distrito, Ciudad"
                  useTextarea={true}
                />
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between p-5 border-2 border-primary/20 rounded-lg bg-primary/5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-1 flex-1 pr-4">
                    <Label htmlFor="use_coordinates" className="text-base font-semibold text-foreground">
                      Usar Coordenadas Específicas
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Activar para usar coordenadas exactas en lugar de la dirección para los mapas
                    </p>
                  </div>
                  <Switch
                    id="use_coordinates"
                    checked={formData.use_coordinates}
                    onCheckedChange={(checked) => handleToggleAutoSave('use_coordinates', checked)}
                  />
                </div>
              </div>

              {formData.use_coordinates && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="latitude">Latitud del Mapa</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.coordinates.lat || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          coordinates: {
                            ...formData.coordinates,
                            lat: e.target.value
                          }
                        })}
                        placeholder="-12.0464"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitud del Mapa</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.coordinates.lng || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          coordinates: {
                            ...formData.coordinates,
                            lng: e.target.value
                          }
                        })}
                        placeholder="-77.0428"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Para encontrar las coordenadas, abre Google Maps, haz clic derecho en la ubicación deseada y copia las coordenadas (primero latitud, luego longitud).
                  </p>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="country_code">País</Label>
                  <Select
                    value={formData.country_code || 'PE'}
                    onValueChange={(value) => {
                      const selectedCountry = countries.find(c => c.code === value);
                      setFormData({ 
                        ...formData, 
                        country_code: value,
                        locale: selectedCountry?.locale || 'es-PE'
                      });
                    }}
                  >
                    <SelectTrigger id="country_code">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Usado para SEO y configuración regional del sitio
                  </p>
                </div>

                <div>
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select
                    value={formData.timezone || 'America/Lima'}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Asegura que las reservas y horarios se muestren correctamente
                  </p>
                </div>

                <div>
                  <Label htmlFor="currency">{t('branding.currency')}</Label>
                  <Input
                    id="currency"
                    value={formData.other_customizations.currency}
                    onChange={(e) => setFormData({
                      ...formData, 
                      other_customizations: {
                        ...formData.other_customizations,
                        currency: e.target.value
                      }
                    })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Símbolo de moneda que se muestra en los precios del menú
                  </p>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <div className="space-y-6">
            {/* Subdomain and Cloudflare Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Subdominio</CardTitle>
                <CardDescription>
                  Gestiona el subdominio y la configuración de hosting para este cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subdomain">{t('general.subdomain')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="subdomain"
                      value={formData.subdomain}
                      onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                      placeholder={t('general.subdomainPlaceholder')}
                    />
                    <span className="text-sm text-muted-foreground">.mirestaurante.online</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usado para hosting en nuestro subdominio: clientname.mirestaurante.online
                  </p>
                </div>

              </CardContent>
            </Card>

            {/* Custom Domain Management moved to dedicated page */}
            {userRole === 'admin' && (
              <div className="pt-4 border-t">
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    La gestión de dominios personalizados se ha movido a la <strong>página de Custom Domains</strong> en el menú de administración.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metadata">
          <PageMetadataManager clientId={effectiveClientId!} />
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>{t('general.openingHours')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const hours = formData.opening_hours[day] || { closed: true, open: '09:00', close: '17:00' };
                return (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg">
                  <div className="min-w-[100px]">
                    <Label className="text-sm font-medium">{t(`general.${day}`)}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        opening_hours: {
                          ...formData.opening_hours,
                          [day]: { ...hours, closed: !checked }
                        }
                      })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {hours.closed ? t('general.closed') : t('general.open')}
                    </span>
                  </div>
                  {!hours.closed && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">{t('general.opens')}:</Label>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setFormData({
                            ...formData,
                            opening_hours: {
                              ...formData.opening_hours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          })}
                          className="w-full sm:w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">{t('general.closes')}:</Label>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setFormData({
                            ...formData,
                            opening_hours: {
                              ...formData.opening_hours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          })}
                          className="w-full sm:w-32"
                        />
                      </div>
                    </div>
                  )}
                 </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.social_media_links.facebook}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        facebook: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.social_media_links.instagram}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        instagram: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="x">X (Twitter)</Label>
                  <Input
                    id="x"
                    value={formData.social_media_links.x}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        x: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.social_media_links.tiktok}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        tiktok: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.social_media_links.youtube}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        youtube: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.social_media_links.linkedin}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        linkedin: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation-visibility" className="relative">
          {userRole !== 'admin' && showWarningOverlay && warningTabName === 'configuración de navegación' && (
            <UserWarningOverlay
              isOpen={true}
              onConfirm={handleWarningConfirm}
              tabName={warningTabName}
            />
          )}
          <div className="space-y-6">
            {/* NAVIGATION CONTROLS */}
            <Card>
              <CardHeader>
                <CardTitle>Controles de Navegación y Botones</CardTitle>
                <CardDescription>Configura la visibilidad y comportamiento de los botones en el menú de navegación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hide_whatsapp_button_menu">{t('general.hideWhatsAppButton')}</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hide_whatsapp_button_menu"
                        checked={formData.hide_whatsapp_button_menu}
                        onCheckedChange={(checked) => handleToggleAutoSave('hide_whatsapp_button_menu', checked)}
                      />
                      <Label htmlFor="hide_whatsapp_button_menu" className="text-sm text-muted-foreground">
                        {formData.hide_whatsapp_button_menu ? t('general.hidden') : t('general.visible')}
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hide_phone_button_menu">{t('general.hidePhoneButton')}</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hide_phone_button_menu"
                        checked={formData.hide_phone_button_menu}
                        onCheckedChange={(checked) => handleToggleAutoSave('hide_phone_button_menu', checked)}
                      />
                      <Label htmlFor="hide_phone_button_menu" className="text-sm text-muted-foreground">
                        {formData.hide_phone_button_menu ? t('general.hidden') : t('general.visible')}
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="show_whatsapp_popup">{t('general.showWhatsAppPopup')}</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show_whatsapp_popup"
                        checked={formData.show_whatsapp_popup}
                        onCheckedChange={(checked) => handleToggleAutoSave('show_whatsapp_popup', checked)}
                      />
                      <Label htmlFor="show_whatsapp_popup" className="text-sm text-muted-foreground">
                        {formData.show_whatsapp_popup ? t('general.enabled') : t('general.disabled')}
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="custom_cta_button_text">Texto del Botón CTA Personalizado</Label>
                    <Input
                      id="custom_cta_button_text"
                      value={formData.custom_cta_button_text}
                      onChange={(e) => setFormData({...formData, custom_cta_button_text: e.target.value})}
                      placeholder={t('general.ctaButtonPlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom_cta_button_link">Enlace del Botón CTA Personalizado</Label>
                    <Input
                      id="custom_cta_button_link"
                      value={formData.custom_cta_button_link}
                      onChange={(e) => setFormData({...formData, custom_cta_button_link: e.target.value})}
                      placeholder={t('general.ctaLinkPlaceholder')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION VISIBILITY CONTROLS */}
            <Card>
              <CardHeader>
                <CardTitle>Controles de Visibilidad de Secciones</CardTitle>
                <CardDescription>Controla qué secciones se muestran en cada página de tu sitio web</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Homepage Toggles */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-base border-b pb-2">Página de Inicio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_about_section_visible" className="flex-1">Mostrar Sección Acerca de Nosotros</Label>
                      <Switch
                        id="homepage_about_section_visible"
                        checked={formData.homepage_about_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_about_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_about_stats_visible" className="flex-1">Mostrar Estadísticas en Sección Acerca</Label>
                      <Switch
                        id="homepage_about_stats_visible"
                        checked={formData.homepage_about_stats_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_about_stats_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_menu_section_visible" className="flex-1">Mostrar Sección de Menú</Label>
                      <Switch
                        id="homepage_menu_section_visible"
                        checked={formData.homepage_menu_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_menu_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_services_section_visible" className="flex-1">Mostrar Sección de Servicios</Label>
                      <Switch
                        id="homepage_services_section_visible"
                        checked={formData.homepage_services_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_services_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_reservations_section_visible" className="flex-1">Mostrar Sección de Reservaciones</Label>
                      <Switch
                        id="homepage_reservations_section_visible"
                        checked={formData.homepage_reservations_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_reservations_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_reviews_section_visible" className="flex-1">Mostrar Sección de Reseñas</Label>
                      <Switch
                        id="homepage_reviews_section_visible"
                        checked={formData.homepage_reviews_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_reviews_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_contact_section_visible" className="flex-1">Mostrar Sección de Contacto</Label>
                      <Switch
                        id="homepage_contact_section_visible"
                        checked={formData.homepage_contact_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_contact_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_contact_map_visible" className="flex-1">Mostrar Mapa en Sección de Contacto</Label>
                      <Switch
                        id="homepage_contact_map_visible"
                        checked={formData.homepage_contact_map_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_contact_map_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_delivery_section_visible" className="flex-1">Mostrar sección de Delivery en página principal</Label>
                      <Switch
                        id="homepage_delivery_section_visible"
                        checked={formData.homepage_delivery_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_delivery_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_faq_section_visible" className="flex-1">Mostrar sección de FAQ en página principal</Label>
                      <Switch
                        id="homepage_faq_section_visible"
                        checked={formData.homepage_faq_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_faq_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="homepage_contact_hide_reservation_box" className="flex-1">Mostrar Caja de Reserva en Sección de Contacto y Footer</Label>
                      <Switch
                        id="homepage_contact_hide_reservation_box"
                        checked={!formData.homepage_contact_hide_reservation_box}
                        onCheckedChange={(checked) => handleToggleAutoSave('homepage_contact_hide_reservation_box', !checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* About Page Toggles */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-base border-b pb-2">Página Acerca de Nosotros</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="about_page_about_section_visible" className="flex-1">Mostrar Sección Acerca de</Label>
                      <Switch
                        id="about_page_about_section_visible"
                        checked={formData.about_page_about_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('about_page_about_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="about_page_about_stats_visible" className="flex-1">Mostrar Estadísticas en Texto</Label>
                      <Switch
                        id="about_page_about_stats_visible"
                        checked={formData.about_page_about_stats_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('about_page_about_stats_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="about_page_stats_section_visible" className="flex-1">Mostrar Sección de Estadísticas</Label>
                      <Switch
                        id="about_page_stats_section_visible"
                        checked={formData.about_page_stats_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('about_page_stats_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="about_page_team_section_visible" className="flex-1">Mostrar Sección de Equipo</Label>
                      <Switch
                        id="about_page_team_section_visible"
                        checked={formData.about_page_team_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('about_page_team_section_visible', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Page Toggles */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-base border-b pb-2">Página de Contacto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="contact_page_contact_section_visible" className="flex-1">Mostrar Formulario de Contacto</Label>
                      <Switch
                        id="contact_page_contact_section_visible"
                        checked={formData.contact_page_contact_section_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('contact_page_contact_section_visible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="contact_page_map_visible" className="flex-1">Mostrar Mapa</Label>
                      <Switch
                        id="contact_page_map_visible"
                        checked={formData.contact_page_map_visible}
                        onCheckedChange={(checked) => handleToggleAutoSave('contact_page_map_visible', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Platform Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rappi">Rappi</Label>
                <Input
                  id="rappi"
                  value={(() => {
                    const delivery = formData.delivery as any;
                    if (delivery?.rappi) {
                      if (typeof delivery.rappi === 'object' && delivery.rappi.url) {
                        return delivery.rappi.url;
                      }
                      if (typeof delivery.rappi === 'string') {
                        return delivery.rappi;
                      }
                    }
                    return '';
                  })()}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      rappi: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="pedidos_ya">PedidosYa</Label>
                <Input
                  id="pedidos_ya"
                  value={(() => {
                    const delivery = formData.delivery as any;
                    if (delivery?.pedidos_ya) {
                      if (typeof delivery.pedidos_ya === 'object' && delivery.pedidos_ya.url) {
                        return delivery.pedidos_ya.url;
                      }
                      if (typeof delivery.pedidos_ya === 'string') {
                        return delivery.pedidos_ya;
                      }
                    }
                    if (delivery?.pedidosya) {
                      if (typeof delivery.pedidosya === 'object' && delivery.pedidosya.url) {
                        return delivery.pedidosya.url;
                      }
                      if (typeof delivery.pedidosya === 'string') {
                        return delivery.pedidosya;
                      }
                    }
                    return '';
                  })()}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      pedidos_ya: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="didi_food">DiDi Food</Label>
                <Input
                  id="didi_food"
                  value={(() => {
                    const delivery = formData.delivery as any;
                    if (delivery?.didi_food) {
                      if (typeof delivery.didi_food === 'object' && delivery.didi_food.url) {
                        return delivery.didi_food.url;
                      }
                      if (typeof delivery.didi_food === 'string') {
                        return delivery.didi_food;
                      }
                    }
                    if (delivery?.didi) {
                      if (typeof delivery.didi === 'object' && delivery.didi.url) {
                        return delivery.didi.url;
                      }
                      if (typeof delivery.didi === 'string') {
                        return delivery.didi;
                      }
                    }
                    return '';
                  })()}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      didi_food: e.target.value
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="relative">
          
          {userRole !== 'admin' && showWarningOverlay && warningTabName === 'configuración de marca' && (
            <UserWarningOverlay
              isOpen={true}
              onConfirm={handleWarningConfirm}
              tabName={warningTabName}
            />
          )}
          <Card>
            <CardHeader>
              <CardTitle>{t('branding.title')}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Primary Color and Header Background side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primary_color">{t('branding.primaryColor')}</Label>
                  <div className="mt-1">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.brand_colors?.primary || formData.primary_color || '#FFD700'}
                      onChange={(e) => setFormData({
                        ...formData, 
                        primary_color: e.target.value,
                        brand_colors: {
                          ...formData.brand_colors,
                          primary: e.target.value
                        }
                      })}
                      className="h-12 w-24"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Color principal que define la identidad visual de su sitio
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-lg font-medium">{t('branding.themeSettings')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">{t('branding.theme')}</Label>
                    <Select value={formData.theme || 'dark'} onValueChange={(value) => setFormData({...formData, theme: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bright">{t('branding.bright')}</SelectItem>
                        <SelectItem value="dark">{t('branding.dark')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tema visual general de su sitio web (claro u oscuro)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="hero_overlay_opacity">Opacidad de Superposición del Hero</Label>
                    <Select 
                      value={String(formData.hero_overlay_opacity ?? 70)} 
                      onValueChange={(value) => setFormData({...formData, hero_overlay_opacity: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-md z-50">
                        <SelectItem value="0">0% (Transparente)</SelectItem>
                        <SelectItem value="10">10%</SelectItem>
                        <SelectItem value="20">20%</SelectItem>
                        <SelectItem value="30">30%</SelectItem>
                        <SelectItem value="40">40%</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="60">60%</SelectItem>
                        <SelectItem value="70">70% (Predeterminado)</SelectItem>
                        <SelectItem value="80">80%</SelectItem>
                        <SelectItem value="90">90%</SelectItem>
                        <SelectItem value="100">100% (Negro Sólido)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controla la oscuridad de la capa sobre la imagen de fondo del hero
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Selection - Only show if templates table exists and has data */}
              {Array.isArray(templates) && templates.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-lg font-medium">Plantilla del Sitio</h4>
                  <div>
                    <Label htmlFor="template_id">Plantilla Actual</Label>
                    <Select 
                      value={formData.template_id ? String(formData.template_id) : 'none'} 
                      onValueChange={(value) => setFormData({...formData, template_id: value === 'none' ? null : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin plantilla</SelectItem>
                        {templates.map((template: any) => {
                          // Convert template name to proper Spanish display name
                          const displayName = template.name
                            .replace(/-/g, ' ')
                            .split(' ')
                            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                          
                          return (
                            <SelectItem key={template.id} value={template.id}>
                              {displayName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      La plantilla controla el diseño y estructura de su sitio web
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-lg font-medium">{t('branding.logoSettings')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <ImageUpload
                      label={t('branding.headerLogo')}
                      value={formData.header_logo_url || ''}
                      onChange={(url) => setFormData({...formData, header_logo_url: url})}
                      clientId={clientId!}
                      context="logo"
                      description="restaurant header logo"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Logo que aparece en la parte superior de su sitio
                    </p>
                  </div>
                  <div>
                    <ImageUpload
                      label={t('branding.footerLogo')}
                      value={formData.footer_logo_url || ''}
                      onChange={(url) => setFormData({...formData, footer_logo_url: url})}
                      clientId={clientId!}
                      context="logo"
                      description="restaurant footer logo"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Logo que aparece en el pie de página de su sitio
                    </p>
                  </div>
                  <div>
                    <ImageUpload
                      label="Favicon"
                      value={formData.favicon_url || 'https://storage.googleapis.com/gpt-engineer-file-uploads/OiOFvHbbnNe6vX3A3rn8oURdWx83/uploads/1759266175780-Mi Restaurante Online Favicon.png'}
                      onChange={(url) => setFormData({...formData, favicon_url: url})}
                      clientId={clientId!}
                      context="favicon"
                      description={`favicon for ${formData.restaurant_name || 'restaurant'} website`}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Icono pequeño que aparece en la pestaña del navegador (PNG/ICO, 32x32 o 512x512px)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-lg font-medium">{t('branding.typography')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title_font">{t('branding.titleFont')}</Label>
                    <Select
                      value={formData.title_font || 'Cormorant Garamond'}
                      onValueChange={(value) => setFormData({...formData, title_font: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-md z-50 max-h-60">
                        <SelectItem value="Cormorant Garamond">Cormorant Garamond</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                        <SelectItem value="Merriweather">Merriweather</SelectItem>
                        <SelectItem value="Lora">Lora</SelectItem>
                        <SelectItem value="Crimson Text">Crimson Text</SelectItem>
                        <SelectItem value="Bitter">Bitter</SelectItem>
                        <SelectItem value="PT Serif">PT Serif</SelectItem>
                        <SelectItem value="Libre Baskerville">Libre Baskerville</SelectItem>
                        <SelectItem value="Source Serif Pro">Source Serif Pro</SelectItem>
                        <SelectItem value="Abril Fatface">Abril Fatface</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Oswald">Oswald</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Nunito">Nunito</SelectItem>
                        <SelectItem value="Raleway">Raleway</SelectItem>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                        <SelectItem value="Great Vibes">Great Vibes</SelectItem>
                        <SelectItem value="Lobster">Lobster</SelectItem>
                        <SelectItem value="Pacifico">Pacifico</SelectItem>
                        <SelectItem value="Satisfy">Satisfy</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tipografía utilizada para todos los títulos de su sitio
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="title_font_weight">{t('branding.titleFontWeight')}</Label>
                    <Select
                      value={formData.title_font_weight || '400'}
                      onValueChange={(value) => setFormData({...formData, title_font_weight: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-md z-50">
                        <SelectItem value="100">100 - Thin</SelectItem>
                        <SelectItem value="200">200 - Extra Light</SelectItem>
                        <SelectItem value="300">300 - Light</SelectItem>
                        <SelectItem value="400">400 - Normal</SelectItem>
                        <SelectItem value="500">500 - Medium</SelectItem>
                        <SelectItem value="600">600 - Semi Bold</SelectItem>
                        <SelectItem value="700">700 - Bold</SelectItem>
                        <SelectItem value="800">800 - Extra Bold</SelectItem>
                        <SelectItem value="900">900 - Black</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Grosor de la fuente para los títulos (más alto = más grueso)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="body_font">{t('branding.bodyFont')}</Label>
                    <Select
                      value={formData.body_font || 'Inter'}
                      onValueChange={(value) => setFormData({...formData, body_font: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-md z-50 max-h-60">
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Nunito">Nunito</SelectItem>
                        <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                        <SelectItem value="Raleway">Raleway</SelectItem>
                        <SelectItem value="PT Sans">PT Sans</SelectItem>
                        <SelectItem value="Fira Sans">Fira Sans</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Work Sans">Work Sans</SelectItem>
                        <SelectItem value="Noto Sans">Noto Sans</SelectItem>
                        <SelectItem value="Rubik">Rubik</SelectItem>
                        <SelectItem value="DM Sans">DM Sans</SelectItem>
                        <SelectItem value="Merriweather">Merriweather</SelectItem>
                        <SelectItem value="Lora">Lora</SelectItem>
                        <SelectItem value="Crimson Text">Crimson Text</SelectItem>
                        <SelectItem value="PT Serif">PT Serif</SelectItem>
                        <SelectItem value="Libre Baskerville">Libre Baskerville</SelectItem>
                        <SelectItem value="Source Serif Pro">Source Serif Pro</SelectItem>
                        <SelectItem value="Cormorant Garamond">Cormorant Garamond</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tipografía para el texto del cuerpo de su sitio
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="title_size_scale">Escala de Tamaño de Títulos</Label>
                    <Select
                      value={String(formData.title_size_scale ?? 0)}
                      onValueChange={(value) => setFormData({...formData, title_size_scale: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-md z-50">
                        <SelectItem value="-50">50% más pequeño</SelectItem>
                        <SelectItem value="-25">25% más pequeño</SelectItem>
                        <SelectItem value="-10">10% más pequeño</SelectItem>
                        <SelectItem value="0">Tamaño normal (predeterminado)</SelectItem>
                        <SelectItem value="10">10% más grande</SelectItem>
                        <SelectItem value="25">25% más grande</SelectItem>
                        <SelectItem value="50">50% más grande</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ajusta el tamaño de todos los títulos proporcionalmente
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="relative">
          {userRole !== 'admin' && showWarningOverlay && warningTabName === 'cambio de contenido' && (
            <UserWarningOverlay
              isOpen={true}
              onConfirm={handleWarningConfirm}
              tabName={warningTabName}
            />
          )}
          <div className="space-y-6">
            {/* PAGE SELECTOR */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-primary/60 to-primary/40 backdrop-blur-md border-2 border-primary/30 rounded-lg shadow-lg">
              <div className="p-4 bg-background/90 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <Label htmlFor="content-page-select" className="text-base font-semibold text-primary">Seleccionar Página:</Label>
                  </div>
                  <Select value={selectedContentPage} onValueChange={setSelectedContentPage}>
                    <SelectTrigger id="content-page-select" className="w-full sm:flex-1 border-primary/50 bg-background hover:bg-muted/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-md z-50">
                      <SelectItem value="homepage">🏠 Página Principal</SelectItem>
                      <SelectItem value="about">ℹ️ Página Acerca de</SelectItem>
                      <SelectItem value="menu">🍽️ Página Menú</SelectItem>
                      <SelectItem value="contact">📞 Página Contacto</SelectItem>
                      <SelectItem value="reviews">⭐ Página de Reseñas</SelectItem>
                      <SelectItem value="services">🛎️ Contenido de Servicios</SelectItem>
                      <SelectItem value="stats">📊 Contenido de Estadísticas</SelectItem>
                      <SelectItem value="footer">📄 Footer</SelectItem>
                      <SelectItem value="whatsapp">💬 Mensajes de WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
              
              {/* HOMEPAGE SECTION */}
              {selectedContentPage === "homepage" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.homepage')}</h3>
                
                {/* Hero Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.heroSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage_hero_title_first_line">{t('content.firstLineHeroTitle')}</Label>
                        <Input
                          id="homepage_hero_title_first_line"
                          value={formData.homepage_hero_title_first_line}
                          onChange={(e) => setFormData({...formData, homepage_hero_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage_hero_title_second_line">{t('content.secondLineHeroTitle')}</Label>
                        <Input
                          id="homepage_hero_title_second_line"
                          value={formData.homepage_hero_title_second_line}
                          onChange={(e) => setFormData({...formData, homepage_hero_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="homepage_hero_description">{t('content.heroSubtitle')}</Label>
                      <Textarea
                        id="homepage_hero_description"
                        value={formData.homepage_hero_description}
                        onChange={(e) => setFormData({...formData, homepage_hero_description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label={t('content.heroBackgroundImage')}
                        value={formData.homepage_hero_background_url}
                        onChange={(url) => setFormData({...formData, homepage_hero_background_url: url})}
                        clientId={clientId!}
                        context="hero-background"
                        description="homepage hero background image"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage_hero_right_button_text">{t('content.rightHeroButtonText')}</Label>
                        <Input
                          id="homepage_hero_right_button_text"
                          value={formData.homepage_hero_right_button_text}
                          onChange={(e) => setFormData({...formData, homepage_hero_right_button_text: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage_hero_right_button_link">{t('content.rightHeroButtonLink')}</Label>
                        <Input
                          id="homepage_hero_right_button_link"
                          value={formData.homepage_hero_right_button_link}
                          onChange={(e) => setFormData({...formData, homepage_hero_right_button_link: e.target.value})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.aboutSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="our_story_label">{t('content.ourStoryLabel')}</Label>
                      <Input
                        id="our_story_label"
                        value={formData.our_story_label}
                        onChange={(e) => setFormData({...formData, our_story_label: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage_about_section_title_first_line">{t('content.firstLineAboutTitle')}</Label>
                        <Input
                          id="homepage_about_section_title_first_line"
                          value={formData.homepage_about_section_title_first_line}
                          onChange={(e) => setFormData({...formData, homepage_about_section_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage_about_section_title_second_line">{t('content.secondLineAboutTitle')}</Label>
                        <Input
                          id="homepage_about_section_title_second_line"
                          value={formData.homepage_about_section_title_second_line}
                          onChange={(e) => setFormData({...formData, homepage_about_section_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="homepage_about_section_description">{t('content.aboutSectionDescription')}</Label>
                      <Textarea
                        id="homepage_about_section_description"
                        value={formData.homepage_about_section_description}
                        onChange={(e) => setFormData({...formData, homepage_about_section_description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label={t('content.aboutSectionImage')}
                        value={formData.homepage_about_section_image_url || ''}
                        onChange={(url) => setFormData({...formData, homepage_about_section_image_url: url})}
                        clientId={clientId!}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Menu Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.menuSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="culinary_masterpieces_label">{t('content.culinaryMasterpiecesLabel')}</Label>
                      <Input
                        id="culinary_masterpieces_label"
                        value={formData.culinary_masterpieces_label}
                        onChange={(e) => setFormData({...formData, culinary_masterpieces_label: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage_menu_section_title_first_line">{t('content.firstLineMenuTitle')}</Label>
                        <Input
                          id="homepage_menu_section_title_first_line"
                          value={formData.homepage_menu_section_title_first_line}
                          onChange={(e) => setFormData({...formData, homepage_menu_section_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage_menu_section_title_second_line">{t('content.secondLineMenuTitle')}</Label>
                        <Input
                          id="homepage_menu_section_title_second_line"
                          value={formData.homepage_menu_section_title_second_line}
                          onChange={(e) => setFormData({...formData, homepage_menu_section_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="homepage_menu_section_description">{t('content.menuSectionDescription')}</Label>
                      <Textarea
                        id="homepage_menu_section_description"
                        value={formData.homepage_menu_section_description}
                        onChange={(e) => setFormData({...formData, homepage_menu_section_description: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Services Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.servicesSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="our_services_label">{t('content.ourServicesLabel')}</Label>
                      <Input
                        id="our_services_label"
                        value={formData.our_services_label}
                        onChange={(e) => setFormData({...formData, our_services_label: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage_services_section_title_first_line">{t('content.firstLineServicesTitle')}</Label>
                        <Input
                          id="homepage_services_section_title_first_line"
                          value={formData.homepage_services_section_title_first_line}
                          onChange={(e) => setFormData({...formData, homepage_services_section_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage_services_section_title_second_line">{t('content.secondLineServicesTitle')}</Label>
                        <Input
                          id="homepage_services_section_title_second_line"
                          value={formData.homepage_services_section_title_second_line}
                          onChange={(e) => setFormData({...formData, homepage_services_section_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="homepage_services_section_description">{t('content.servicesSectionDescription')}</Label>
                      <Textarea
                        id="homepage_services_section_description"
                        value={formData.homepage_services_section_description}
                        onChange={(e) => setFormData({...formData, homepage_services_section_description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.reviewsSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="testimonials_label">{t('content.testimonialsLabel')}</Label>
                      <Input
                        id="testimonials_label"
                        value={formData.testimonials_label}
                        onChange={(e) => setFormData({...formData, testimonials_label: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reviews_section_title_first_line">{t('content.firstLineReviewsTitle')}</Label>
                        <Input
                          id="reviews_section_title_first_line"
                          value={formData.reviews_section_title_first_line}
                          onChange={(e) => setFormData({...formData, reviews_section_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reviews_section_title_second_line">{t('content.secondLineReviewsTitle')}</Label>
                        <Input
                          id="reviews_section_title_second_line"
                          value={formData.reviews_section_title_second_line}
                          onChange={(e) => setFormData({...formData, reviews_section_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reviews_section_description">{t('content.reviewsSectionDescription')}</Label>
                      <Textarea
                        id="reviews_section_description"
                        value={formData.reviews_section_description}
                        onChange={(e) => setFormData({...formData, reviews_section_description: e.target.value})}
                        placeholder="Cada opinión refleja nuestro compromiso con la excelencia culinaria y el servicio excepcional."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.deliverySection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="homepage_delivery_section_title">{t('content.deliverySectionTitle')}</Label>
                      <Input
                        id="homepage_delivery_section_title"
                        value={formData.homepage_delivery_section_title}
                        onChange={(e) => setFormData({...formData, homepage_delivery_section_title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepage_delivery_section_description">{t('content.deliverySectionDescription')}</Label>
                      <Textarea
                        id="homepage_delivery_section_description"
                        value={formData.homepage_delivery_section_description}
                        onChange={(e) => setFormData({...formData, homepage_delivery_section_description: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.contactSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="contact_us_label">{t('content.contactUsLabel')}</Label>
                      <Input
                        id="contact_us_label"
                        value={formData.contact_us_label}
                        onChange={(e) => setFormData({...formData, contact_us_label: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage_contact_section_title_first_line">{t('content.firstLineContactTitle')}</Label>
                        <Input
                          id="homepage_contact_section_title_first_line"
                          value={formData.homepage_contact_section_title_first_line}
                          onChange={(e) => setFormData({...formData, homepage_contact_section_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage_contact_section_title_second_line">{t('content.secondLineContactTitle')}</Label>
                        <Input
                          id="homepage_contact_section_title_second_line"
                          value={formData.homepage_contact_section_title_second_line}
                          onChange={(e) => setFormData({...formData, homepage_contact_section_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="homepage_contact_section_description">{t('content.contactSectionDescription')}</Label>
                      <Textarea
                        id="homepage_contact_section_description"
                        value={formData.homepage_contact_section_description}
                        onChange={(e) => setFormData({...formData, homepage_contact_section_description: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.ctaSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="homepage_cta_title">{t('content.ctaSectionTitle')}</Label>
                      <Input
                        id="homepage_cta_title"
                        value={formData.homepage_cta_title}
                        onChange={(e) => setFormData({...formData, homepage_cta_title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepage_cta_description">{t('content.ctaSectionDescription')}</Label>
                      <Textarea
                        id="homepage_cta_description"
                        value={formData.homepage_cta_description}
                        onChange={(e) => setFormData({...formData, homepage_cta_description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage_cta_button1_text">{t('content.firstCtaButtonText')}</Label>
                        <Input
                          id="homepage_cta_button1_text"
                          value={formData.homepage_cta_button1_text}
                          onChange={(e) => setFormData({...formData, homepage_cta_button1_text: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage_cta_button1_link">{t('content.firstCtaButtonLink')}</Label>
                        <Input
                          id="homepage_cta_button1_link"
                          value={formData.homepage_cta_button1_link}
                          onChange={(e) => setFormData({...formData, homepage_cta_button1_link: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="homepage_cta_button2_text">{t('content.secondCtaButtonText')}</Label>
                        <Input
                          id="homepage_cta_button2_text"
                          value={formData.homepage_cta_button2_text}
                          onChange={(e) => setFormData({...formData, homepage_cta_button2_text: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="homepage_cta_button2_link">{t('content.secondCtaButtonLink')}</Label>
                        <Input
                          id="homepage_cta_button2_link"
                          value={formData.homepage_cta_button2_link}
                          onChange={(e) => setFormData({...formData, homepage_cta_button2_link: e.target.value})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* ABOUT PAGE SECTION */}
              {selectedContentPage === "about" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.aboutPage')}</h3>
                
                {/* Hero Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.heroSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="about_page_hero_title_first_line">{t('content.aboutPageHeroFirstLine')}</Label>
                        <Input
                          id="about_page_hero_title_first_line"
                          value={formData.about_page_hero_title_first_line}
                          onChange={(e) => setFormData({...formData, about_page_hero_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="about_page_hero_title_second_line">{t('content.aboutPageHeroSecondLine')}</Label>
                        <Input
                          id="about_page_hero_title_second_line"
                          value={formData.about_page_hero_title_second_line}
                          onChange={(e) => setFormData({...formData, about_page_hero_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="about_page_hero_description">{t('content.aboutPageHeroDescription')}</Label>
                      <Textarea
                        id="about_page_hero_description"
                        value={formData.about_page_hero_description}
                        onChange={(e) => setFormData({...formData, about_page_hero_description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label={t('content.aboutPageHeroBackgroundImage')}
                        value={formData.about_page_hero_background_url}
                        onChange={(url) => setFormData({...formData, about_page_hero_background_url: url})}
                        clientId={clientId!}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* About Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.aboutContent')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="about_us_label">{t('content.aboutUsLabel')}</Label>
                      <Input
                        id="about_us_label"
                        value={formData.about_us_label}
                        onChange={(e) => setFormData({...formData, about_us_label: e.target.value})}
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label={t('content.aboutSectionImage')}
                        value={formData.about_page_about_section_image_url || ''}
                        onChange={(url) => setFormData({...formData, about_page_about_section_image_url: url})}
                        clientId={clientId!}
                      />
                    </div>
                    <div>
                      <Label htmlFor="about_story">{t('content.restaurantStoryText')}</Label>
                      <Textarea
                        id="about_story"
                        value={formData.about_story}
                        onChange={(e) => setFormData({...formData, about_story: e.target.value})}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="about_chef_info">{t('content.chefInformationText')}</Label>
                      <Textarea
                        id="about_chef_info"
                        value={formData.about_chef_info}
                        onChange={(e) => setFormData({...formData, about_chef_info: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="about_mission">{t('content.missionStatementText')}</Label>
                      <Textarea
                        id="about_mission"
                        value={formData.about_mission}
                        onChange={(e) => setFormData({...formData, about_mission: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Team Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.teamSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="our_team_label">{t('content.ourTeamLabel')}</Label>
                      <Input
                        id="our_team_label"
                        value={formData.our_team_label}
                        onChange={(e) => setFormData({...formData, our_team_label: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="about_team_section_title_first_line">{t('content.firstLineTeamTitle')}</Label>
                        <Input
                          id="about_team_section_title_first_line"
                          value={formData.about_team_section_title_first_line}
                          onChange={(e) => setFormData({...formData, about_team_section_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="about_team_section_title_second_line">{t('content.secondLineTeamTitle')}</Label>
                        <Input
                          id="about_team_section_title_second_line"
                          value={formData.about_team_section_title_second_line}
                          onChange={(e) => setFormData({...formData, about_team_section_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="about_team_section_description">{t('content.teamSectionDescription')}</Label>
                      <Textarea
                        id="about_team_section_description"
                        value={formData.about_team_section_description}
                        onChange={(e) => setFormData({...formData, about_team_section_description: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* MENU PAGE SECTION */}
              {selectedContentPage === "menu" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.menuPage')}</h3>
                
                {/* Hero Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.heroSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="our_menu_label">{t('content.ourMenuLabel')}</Label>
                      <Input
                        id="our_menu_label"
                        value={formData.our_menu_label}
                        onChange={(e) => setFormData({...formData, our_menu_label: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="menu_page_hero_title_first_line">{t('content.menuPageHeroFirstLine')}</Label>
                        <Input
                          id="menu_page_hero_title_first_line"
                          value={formData.menu_page_hero_title_first_line}
                          onChange={(e) => setFormData({...formData, menu_page_hero_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="menu_page_hero_title_second_line">{t('content.menuPageHeroSecondLine')}</Label>
                        <Input
                          id="menu_page_hero_title_second_line"
                          value={formData.menu_page_hero_title_second_line}
                          onChange={(e) => setFormData({...formData, menu_page_hero_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="menu_page_hero_description">{t('content.menuPageHeroDescription')}</Label>
                      <Textarea
                        id="menu_page_hero_description"
                        value={formData.menu_page_hero_description}
                        onChange={(e) => setFormData({...formData, menu_page_hero_description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label={t('content.menuPageHeroBackgroundImage')}
                        value={formData.menu_page_hero_background_url}
                        onChange={(url) => setFormData({...formData, menu_page_hero_background_url: url})}
                        clientId={clientId!}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* CONTACT PAGE SECTION */}
              {selectedContentPage === "contact" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.contactPage')}</h3>
                
                {/* Hero Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.heroSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_page_hero_title_first_line">{t('content.contactPageHeroFirstLine')}</Label>
                        <Input
                          id="contact_page_hero_title_first_line"
                          value={formData.contact_page_hero_title_first_line}
                          onChange={(e) => setFormData({...formData, contact_page_hero_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_page_hero_title_second_line">{t('content.contactPageHeroSecondLine')}</Label>
                        <Input
                          id="contact_page_hero_title_second_line"
                          value={formData.contact_page_hero_title_second_line}
                          onChange={(e) => setFormData({...formData, contact_page_hero_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contact_page_hero_description">{t('content.contactPageHeroDescription')}</Label>
                      <Textarea
                        id="contact_page_hero_description"
                        value={formData.contact_page_hero_description}
                        onChange={(e) => setFormData({...formData, contact_page_hero_description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label={t('content.contactPageHeroBackgroundImage')}
                        value={formData.contact_page_hero_background_url}
                        onChange={(url) => setFormData({...formData, contact_page_hero_background_url: url})}
                        clientId={clientId!}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.contactContent')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="contact_reservation_title">{t('content.reservationBoxTitle')}</Label>
                      <Input
                        id="contact_reservation_title"
                        value={formData.contact_reservation_title}
                        onChange={(e) => setFormData({...formData, contact_reservation_title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_reservation_description">{t('content.reservationBoxDescription')}</Label>
                      <Textarea
                        id="contact_reservation_description"
                        value={formData.contact_reservation_description}
                        onChange={(e) => setFormData({...formData, contact_reservation_description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* REVIEWS PAGE SECTION */}
              {selectedContentPage === "reviews" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.reviewsPage')}</h3>
                
                {/* Hero Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.heroSection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reviews_page_hero_title_first_line">{t('content.reviewsPageHeroFirstLine')}</Label>
                        <Input
                          id="reviews_page_hero_title_first_line"
                          value={formData.reviews_page_hero_title_first_line}
                          onChange={(e) => setFormData({...formData, reviews_page_hero_title_first_line: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reviews_page_hero_title_second_line">{t('content.reviewsPageHeroSecondLine')}</Label>
                        <Input
                          id="reviews_page_hero_title_second_line"
                          value={formData.reviews_page_hero_title_second_line}
                          onChange={(e) => setFormData({...formData, reviews_page_hero_title_second_line: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reviews_page_hero_description">{t('content.reviewsPageHeroDescription')}</Label>
                      <Textarea
                        id="reviews_page_hero_description"
                        value={formData.reviews_page_hero_description}
                        onChange={(e) => setFormData({...formData, reviews_page_hero_description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label={t('content.reviewsPageHeroBackgroundImage')}
                        value={formData.reviews_page_hero_background_url}
                        onChange={(url) => setFormData({...formData, reviews_page_hero_background_url: url})}
                        clientId={clientId!}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* SERVICES CONTENT SECTION */}
              {selectedContentPage === "services" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.servicesContent')}</h3>
                
                {/* Service Cards */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.serviceCards')}</CardTitle>
                    <CardDescription>Configura las tres tarjetas de servicio principales</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Service Card 1 */}
                    <Card className="border-2 border-primary/20 bg-muted/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Tarjeta 1</Badge>
                          <CardTitle className="text-base">{t('content.firstServiceCard')}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="services_card1_icon">{t('content.firstServiceCardIcon')}</Label>
                            <Select value={formData.services_card1_icon} onValueChange={(value) => setFormData({...formData, services_card1_icon: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('content.selectIcon')} />
                              </SelectTrigger>
                              <SelectContent className="bg-background border border-border shadow-md z-50">
                                {iconOptions.map((icon) => {
                                  const IconComponent = getIconComponent(icon.value);
                                  return (
                                    <SelectItem key={icon.value} value={icon.value}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        <span>{icon.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="services_card1_title">{t('content.firstServiceCardTitle')}</Label>
                            <Input
                              id="services_card1_title"
                              value={formData.services_card1_title}
                              onChange={(e) => setFormData({...formData, services_card1_title: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="services_card1_description">{t('content.firstServiceCardDescription')}</Label>
                          <Textarea
                            id="services_card1_description"
                            value={formData.services_card1_description}
                            onChange={(e) => setFormData({...formData, services_card1_description: e.target.value})}
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="services_card1_button_text">{t('content.firstServiceCardButton')}</Label>
                            <Input
                              id="services_card1_button_text"
                              value={formData.services_card1_button_text}
                              onChange={(e) => setFormData({...formData, services_card1_button_text: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="services_card1_button_link">{t('content.firstServiceCardLink')}</Label>
                            <Input
                              id="services_card1_button_link"
                              value={formData.services_card1_button_link}
                              onChange={(e) => setFormData({...formData, services_card1_button_link: e.target.value})}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Service Card 2 */}
                    <Card className="border-2 border-primary/20 bg-muted/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Tarjeta 2</Badge>
                          <CardTitle className="text-base">{t('content.secondServiceCard')}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="services_card2_icon">{t('content.secondServiceCardIcon')}</Label>
                            <Select value={formData.services_card2_icon} onValueChange={(value) => setFormData({...formData, services_card2_icon: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('content.selectIcon')} />
                              </SelectTrigger>
                              <SelectContent className="bg-background border border-border shadow-md z-50">
                                {iconOptions.map((icon) => {
                                  const IconComponent = getIconComponent(icon.value);
                                  return (
                                    <SelectItem key={icon.value} value={icon.value}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        <span>{icon.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="services_card2_title">{t('content.secondServiceCardTitle')}</Label>
                            <Input
                              id="services_card2_title"
                              value={formData.services_card2_title}
                              onChange={(e) => setFormData({...formData, services_card2_title: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="services_card2_description">{t('content.secondServiceCardDescription')}</Label>
                          <Textarea
                            id="services_card2_description"
                            value={formData.services_card2_description}
                            onChange={(e) => setFormData({...formData, services_card2_description: e.target.value})}
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="services_card2_button_text">{t('content.secondServiceCardButton')}</Label>
                            <Input
                              id="services_card2_button_text"
                              value={formData.services_card2_button_text}
                              onChange={(e) => setFormData({...formData, services_card2_button_text: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="services_card2_button_link">{t('content.secondServiceCardLink')}</Label>
                            <Input
                              id="services_card2_button_link"
                              value={formData.services_card2_button_link}
                              onChange={(e) => setFormData({...formData, services_card2_button_link: e.target.value})}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Service Card 3 */}
                    <Card className="border-2 border-primary/20 bg-muted/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Tarjeta 3</Badge>
                          <CardTitle className="text-base">{t('content.thirdServiceCard')}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="services_card3_icon">{t('content.thirdServiceCardIcon')}</Label>
                            <Select value={formData.services_card3_icon} onValueChange={(value) => setFormData({...formData, services_card3_icon: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('content.selectIcon')} />
                              </SelectTrigger>
                              <SelectContent className="bg-background border border-border shadow-md z-50">
                                {iconOptions.map((icon) => {
                                  const IconComponent = getIconComponent(icon.value);
                                  return (
                                    <SelectItem key={icon.value} value={icon.value}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        <span>{icon.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="services_card3_title">{t('content.thirdServiceCardTitle')}</Label>
                            <Input
                              id="services_card3_title"
                              value={formData.services_card3_title}
                              onChange={(e) => setFormData({...formData, services_card3_title: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="services_card3_description">{t('content.thirdServiceCardDescription')}</Label>
                          <Textarea
                            id="services_card3_description"
                            value={formData.services_card3_description}
                            onChange={(e) => setFormData({...formData, services_card3_description: e.target.value})}
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="services_card3_button_text">{t('content.thirdServiceCardButton')}</Label>
                            <Input
                              id="services_card3_button_text"
                              value={formData.services_card3_button_text}
                              onChange={(e) => setFormData({...formData, services_card3_button_text: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="services_card3_button_link">{t('content.thirdServiceCardLink')}</Label>
                            <Input
                              id="services_card3_button_link"
                              value={formData.services_card3_button_link}
                              onChange={(e) => setFormData({...formData, services_card3_button_link: e.target.value})}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {/* Service Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.serviceFeatures')}</CardTitle>
                    <CardDescription>Configura las características adicionales del servicio</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Feature 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="services_feature1_icon">{t('content.firstFeatureIcon')}</Label>
                        <Select value={formData.services_feature1_icon} onValueChange={(value) => setFormData({...formData, services_feature1_icon: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('content.selectIcon')} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-md z-50">
                            {iconOptions.map((icon) => {
                              const IconComponent = getIconComponent(icon.value);
                              return (
                                <SelectItem key={icon.value} value={icon.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span>{icon.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="services_feature1_text">{t('content.firstFeatureText')}</Label>
                        <Input
                          id="services_feature1_text"
                          value={formData.services_feature1_text}
                          onChange={(e) => setFormData({...formData, services_feature1_text: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="services_feature2_icon">{t('content.secondFeatureIcon')}</Label>
                        <Select value={formData.services_feature2_icon} onValueChange={(value) => setFormData({...formData, services_feature2_icon: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('content.selectIcon')} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-md z-50">
                            {iconOptions.map((icon) => {
                              const IconComponent = getIconComponent(icon.value);
                              return (
                                <SelectItem key={icon.value} value={icon.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span>{icon.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="services_feature2_text">{t('content.secondFeatureText')}</Label>
                        <Input
                          id="services_feature2_text"
                          value={formData.services_feature2_text}
                          onChange={(e) => setFormData({...formData, services_feature2_text: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="services_feature3_icon">{t('content.thirdFeatureIcon')}</Label>
                        <Select value={formData.services_feature3_icon} onValueChange={(value) => setFormData({...formData, services_feature3_icon: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('content.selectIcon')} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-md z-50">
                            {iconOptions.map((icon) => {
                              const IconComponent = getIconComponent(icon.value);
                              return (
                                <SelectItem key={icon.value} value={icon.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span>{icon.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="services_feature3_text">{t('content.thirdFeatureText')}</Label>
                        <Input
                          id="services_feature3_text"
                          value={formData.services_feature3_text}
                          onChange={(e) => setFormData({...formData, services_feature3_text: e.target.value})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* STATS CONTENT SECTION */}
              {selectedContentPage === "stats" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.statsContent')}</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.statistics')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Stat 1 */}
                    <div className="border-l-4 border-primary/30 pl-4 space-y-4">
                      <h4 className="font-medium text-primary">{t('content.firstStat')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="stats_item1_icon">{t('content.firstStatIcon')}</Label>
                          <Select value={formData.stats_item1_icon} onValueChange={(value) => setFormData({...formData, stats_item1_icon: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('content.selectIcon')} />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-md z-50">
                              {iconOptions.map((icon) => {
                                const IconComponent = getIconComponent(icon.value);
                                return (
                                  <SelectItem key={icon.value} value={icon.value}>
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="h-4 w-4" />
                                      <span>{icon.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="stats_item1_number">{t('content.firstStatNumber')}</Label>
                          <Input
                            id="stats_item1_number"
                            value={formData.stats_item1_number}
                            onChange={(e) => setFormData({...formData, stats_item1_number: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stats_item1_label">{t('content.firstStatLabel')}</Label>
                          <Input
                            id="stats_item1_label"
                            value={formData.stats_item1_label}
                            onChange={(e) => setFormData({...formData, stats_item1_label: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="border-l-4 border-primary/30 pl-4 space-y-4">
                      <h4 className="font-medium text-primary">{t('content.secondStat')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="stats_item2_icon">{t('content.secondStatIcon')}</Label>
                          <Select value={formData.stats_item2_icon} onValueChange={(value) => setFormData({...formData, stats_item2_icon: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('content.selectIcon')} />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-md z-50">
                              {iconOptions.map((icon) => {
                                const IconComponent = getIconComponent(icon.value);
                                return (
                                  <SelectItem key={icon.value} value={icon.value}>
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="h-4 w-4" />
                                      <span>{icon.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="stats_item2_number">{t('content.secondStatNumber')}</Label>
                          <Input
                            id="stats_item2_number"
                            value={formData.stats_item2_number}
                            onChange={(e) => setFormData({...formData, stats_item2_number: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stats_item2_label">{t('content.secondStatLabel')}</Label>
                          <Input
                            id="stats_item2_label"
                            value={formData.stats_item2_label}
                            onChange={(e) => setFormData({...formData, stats_item2_label: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="border-l-4 border-primary/30 pl-4 space-y-4">
                      <h4 className="font-medium text-primary">{t('content.thirdStat')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="stats_item3_icon">{t('content.thirdStatIcon')}</Label>
                          <Select value={formData.stats_item3_icon} onValueChange={(value) => setFormData({...formData, stats_item3_icon: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('content.selectIcon')} />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-md z-50">
                              {iconOptions.map((icon) => {
                                const IconComponent = getIconComponent(icon.value);
                                return (
                                  <SelectItem key={icon.value} value={icon.value}>
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="h-4 w-4" />
                                      <span>{icon.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="stats_item3_number">{t('content.thirdStatNumber')}</Label>
                          <Input
                            id="stats_item3_number"
                            value={formData.stats_item3_number}
                            onChange={(e) => setFormData({...formData, stats_item3_number: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stats_item3_label">{t('content.thirdStatLabel')}</Label>
                          <Input
                            id="stats_item3_label"
                            value={formData.stats_item3_label}
                            onChange={(e) => setFormData({...formData, stats_item3_label: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* FOOTER SECTION */}
              {selectedContentPage === "footer" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.footer')}</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.footerContent')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="footer_description">{t('content.footerDescriptionText')}</Label>
                      <Textarea
                        id="footer_description"
                        value={formData.footer_description}
                        onChange={(e) => setFormData({...formData, footer_description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* WHATSAPP MESSAGES SECTION */}
              {selectedContentPage === "whatsapp" && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b pb-2">{t('content.whatsappMessages')}</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('content.whatsappMessages')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="whatsapp_reservation_message">{t('content.whatsappReservationTemplate')}</Label>
                      <Textarea
                        id="whatsapp_reservation_message"
                        value={formData.whatsapp_reservation_message}
                        onChange={(e) => setFormData({...formData, whatsapp_reservation_message: e.target.value})}
                        rows={2}
                        placeholder="Hola, me gustaría hacer una reserva para [fecha] a las [hora] para [número de personas] personas."
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp_general_message">{t('content.whatsappGeneralMessage')}</Label>
                      <Input
                        id="whatsapp_general_message"
                        value={formData.whatsapp_general_message}
                        onChange={(e) => setFormData({...formData, whatsapp_general_message: e.target.value})}
                        placeholder="Hola, me gustaría hacer una reserva"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}
            </div>
          </TabsContent>

        <TabsContent value="menu">
          {/* Downloadable Menu Upload Section */}
          <Card className="mb-6 border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Menú Descargable
              </CardTitle>
              <CardDescription>
                Sube un PDF/imagen de tu menú o pega un enlace. Esto se mostrará en tu sitio web con un botón de descarga.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Menu Preview */}
                {formData.downloadable_menu_url && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">Archivo de menú actual</span>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={formData.downloadable_menu_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Ver Archivo
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({...formData, downloadable_menu_url: ''})}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Subir Archivo</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('menu-file-input')?.click()}
                        disabled={saving}
                        className="flex-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {saving ? 'Subiendo...' : 'Elegir Archivo'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Soporta PDF, JPG, PNG (máx 10MB)
                    </p>
                    <Input
                      id="menu-file-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            toast({
                              title: "Error",
                              description: "File size must be less than 10MB",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          setSaving(true);
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${clientId}/menu/menu-${Date.now()}.${fileExt}`;
                            
                            const { error: uploadError } = await supabase.storage
                              .from('client-assets')
                              .upload(fileName, file, { upsert: true });

                            if (uploadError) throw uploadError;

                            const { data } = supabase.storage
                              .from('client-assets')
                              .getPublicUrl(fileName);

                            setFormData({...formData, downloadable_menu_url: data.publicUrl});
                            toast({
                              title: "Success",
                              description: "Menu file uploaded successfully",
                            });
                          } catch (error: any) {
                            toast({
                              title: "Error",
                              description: "Failed to upload menu: " + error.message,
                              variant: "destructive"
                            });
                          } finally {
                            setSaving(false);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* URL Input */}
                  <div className="space-y-2">
                    <Label>O Pega una URL</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://ejemplo.com/menu.pdf"
                        value={formData.downloadable_menu_url || ''}
                        onChange={(e) => setFormData({...formData, downloadable_menu_url: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enlace a tu menú alojado externamente
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('menu.saveMenu')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Management Section */}
          <Card>
            <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <span className="text-xl">{t('menu.title')}</span>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => openCategoryDialog()} size="sm" className="flex-1 sm:flex-initial">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Nueva Categoría</span>
                  </Button>
                  <Button onClick={() => openMenuItemDialog()} size="sm" className="flex-1 sm:flex-initial">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Nuevo Producto</span>
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {t('menu.manageDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search Bar - More Prominent */}
              <div className="mb-6 bg-muted/30 p-4 rounded-lg border-2 border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                  <Input
                    placeholder={t('menu.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {searchTerm && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {Object.values(filteredAndGroupedMenuItems).flat().length} resultados
                    </span>
                  )}
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <FolderPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">{t('menu.noCategoriesFound')}</h3>
                    <p className="text-sm mb-4">{t('menu.createFirstCategory')}</p>
                    <Button onClick={() => openCategoryDialog()}>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      {t('menu.createFirstCategoryButton')}
                    </Button>
                  </div>
                </div>
              ) : (
                    <div className="space-y-4">
                      {[...categories].sort((a, b) => a.display_order - b.display_order).map((category, index, sortedCategories) => {
                        const categoryItems = filteredAndGroupedMenuItems[category.id] || [];
                        const hasMatchingItems = searchTerm ? categoryItems.length > 0 : true;
                        
                        if (!hasMatchingItems) return null;

                        return (
                          <SortableCategoryCard
                            key={category.id}
                            category={category}
                            categoryItems={categoryItems}
                            searchTerm={searchTerm}
                            filteredAndGroupedMenuItems={filteredAndGroupedMenuItems}
                            openMenuItemDialog={openMenuItemDialog}
                            openCategoryDialog={openCategoryDialog}
                            handleDeleteCategory={handleDeleteCategory}
                            handleCompleteDeleteCategory={handleCompleteDeleteCategory}
                            handleToggleCategoryStatus={handleToggleCategoryStatus}
                            formData={formData}
                            handleDeleteMenuItem={handleDeleteMenuItem}
                            handleToggleItemStatus={handleToggleItemStatus}
                            onItemDragEnd={handleMenuItemDragEnd}
                            handleMoveMenuItemUp={handleMoveMenuItemUp}
                            handleMoveMenuItemDown={handleMoveMenuItemDown}
                            handleMoveCategoryUp={handleMoveCategoryUp}
                            handleMoveCategoryDown={handleMoveCategoryDown}
                            isFirst={index === 0}
                            isLast={index === sortedCategories.length - 1}
                          />
                        );
                      })}
                    </div>
              )}
            </CardContent>
          </Card>
      </TabsContent>

      {/* Team Members Tab */}
      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <span className="text-xl">{t('team.teamMembers')}</span>
              <Button onClick={() => openTeamMemberDialog()} size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t('team.addTeamMember')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamMembers.length > 0 ? (
                [...teamMembers].sort((a, b) => a.display_order - b.display_order).map((member, index) => (
                  <SortableTeamMember
                    key={member.id}
                    member={member}
                    onEdit={openTeamMemberDialog}
                    onDelete={handleDeleteTeamMember}
                    onMoveUp={handleMoveTeamMemberUp}
                    onMoveDown={handleMoveTeamMemberDown}
                    isFirst={index === 0}
                    isLast={index === teamMembers.length - 1}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">{t('team.noTeamMembers')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Reviews Tab */}
      <TabsContent value="reviews">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <span className="text-xl">{t('reviews.title')}</span>
              <Button onClick={() => openReviewDialog()} size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t('reviews.addReview')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviews.length > 0 ? (
                [...reviews].sort((a, b) => a.display_order - b.display_order).map((review, index) => (
                  <SortableReview
                    key={review.id}
                    review={review}
                    onEdit={openReviewDialog}
                    onDelete={handleDeleteReview}
                    onMoveUp={handleMoveReviewUp}
                    onMoveDown={handleMoveReviewDown}
                    isFirst={index === 0}
                    isLast={index === reviews.length - 1}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">{t('reviews.noReviewsFound')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* FAQs Tab */}
      <TabsContent value="faqs">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <span className="text-xl">Preguntas Frecuentes</span>
              <Button onClick={() => openFaqDialog()} size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Agregar FAQ
              </Button>
            </CardTitle>
            <CardDescription>
              Gestiona las preguntas frecuentes que se mostrarán en tu sitio web
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {faqs.length > 0 ? (
                [...faqs].sort((a, b) => a.display_order - b.display_order).map((faq, index) => (
                  <div key={faq.id} className="flex flex-col gap-3 p-4 border-2 border-border rounded-lg bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
                    <div className="flex flex-col gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <h4 className="font-semibold text-base flex-1">{faq.question}</h4>
                          <Badge variant={faq.is_active ? "default" : "secondary"} className="shrink-0">
                            {faq.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveFaqUp(faq.id)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveFaqDown(faq.id)}
                        disabled={index === faqs.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFaqDialog(faq)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay preguntas frecuentes. Agrega una para comenzar.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Carousel Tab */}
      <TabsContent value="carousel">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Carousel</CardTitle>
              <CardDescription>
                Configura las opciones de visualización del carousel de imágenes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="carousel-enabled">Mostrar Carousel</Label>
                    <p className="text-sm text-muted-foreground">
                      Activa o desactiva el carousel en la página principal
                    </p>
                  </div>
                  <Switch
                    id="carousel-enabled"
                    checked={adminContent?.carousel_enabled ?? true}
                    onCheckedChange={async (checked) => {
                      const next = { ...adminContent, carousel_enabled: checked } as any;
                      setAdminContent(next);
                      await saveCarouselSetting({ carousel_enabled: checked });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carousel-order">{t('carousel.position')}</Label>
                <Select
                  value={adminContent?.carousel_display_order ? adminContent.carousel_display_order.toString() : undefined}
                  onValueChange={async (value) => {
                    const val = parseInt(value);
                    const next = { ...adminContent, carousel_display_order: val } as any;
                    setAdminContent(next);
                    await saveCarouselSetting({ carousel_display_order: val });
                  }}
                >
                    <SelectTrigger>
                      <SelectValue placeholder={t('carousel.position1')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">{t('carousel.position1')}</SelectItem>
                      <SelectItem value="4">{t('carousel.position2')}</SelectItem>
                      <SelectItem value="5">{t('carousel.position3')}</SelectItem>
                      <SelectItem value="6">{t('carousel.position4')}</SelectItem>
                      <SelectItem value="7">{t('carousel.position5')}</SelectItem>
                      <SelectItem value="8">{t('carousel.position6')}</SelectItem>
                      <SelectItem value="9">{t('carousel.position7')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imágenes del Carousel</CardTitle>
              <CardDescription>
                Sube y gestiona las imágenes que aparecerán en el carousel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ImageUpload
                  label="Agregar Imagen al Carousel"
                  value=""
                  onChange={(imageUrl) => handleCarouselImageUpload(imageUrl)}
                  clientId={effectiveClientId}
                  context="carousel"
                  description="carousel showcase image for restaurant homepage"
                />
                
                {carouselImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {carouselImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={image.image_url}
                            alt={image.alt_text || "Imagen del carousel"}
                            className="w-full h-full object-cover rounded-lg border"
                          />
                        </AspectRatio>
                        <button
                          onClick={() => handleCarouselImageDelete(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? t('menu.editCategory') : t('menu.addCategory')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category_name">{t('common.name')}</Label>
              <Input
                id="category_name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="display_order">{t('menu.displayOrder')}</Label>
              <Input
                id="display_order"
                type="number"
                value={categoryForm.display_order}
                onChange={(e) => setCategoryForm({...categoryForm, display_order: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={() => handleSaveCategory()}>{t('common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={showMenuItemDialog} onOpenChange={setShowMenuItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? t('menu.editMenuItem') : t('menu.addMenuItem')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_name">{t('common.name')}</Label>
                <Input
                  id="item_name"
                  value={menuItemForm.name}
                  onChange={(e) => setMenuItemForm({...menuItemForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="item_price">{t('menu.price')}</Label>
                <Input
                  id="item_price"
                  type="number"
                  step="0.01"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({...menuItemForm, price: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="item_description">{t('common.description')}</Label>
              <Textarea
                id="item_description"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({...menuItemForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_category">{t('menu.category')}</Label>
                <Select value={menuItemForm.category_id} onValueChange={(value) => setMenuItemForm({...menuItemForm, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('menu.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <ImageUpload
                  label={t('menu.imageUrl')}
                  value={menuItemForm.image_url}
                  onChange={(url) => setMenuItemForm({...menuItemForm, image_url: url})}
                  clientId={clientId || ''}
                  context="menu-item"
                  description={`menu item photo - ${menuItemForm.name || 'dish'}`}
                />
              </div>
            </div>
            
            {/* Visibility Options */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <Label>{t('menu.showOnHomepage')}</Label>
                  <p className="text-sm text-muted-foreground">{t('menu.showOnHomepageDesc')}</p>
                </div>
                <Switch
                  checked={menuItemForm.show_on_homepage || false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_on_homepage: checked})}
                  className="self-start sm:self-auto"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <Label>{t('menu.showImageHome')}</Label>
                  <p className="text-sm text-muted-foreground">{t('menu.showImageHomeDesc')}</p>
                </div>
                <Switch
                  checked={menuItemForm.show_image_home || false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_image_home: checked})}
                  className="self-start sm:self-auto"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <Label>{t('menu.showImageMenu')}</Label>
                  <p className="text-sm text-muted-foreground">{t('menu.showImageMenuDesc')}</p>
                </div>
                <Switch
                  checked={menuItemForm.show_image_menu !== false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_image_menu: checked})}
                  className="self-start sm:self-auto"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMenuItemDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSaveMenuItem}>{t('common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Member Dialog */}
      <Dialog open={showTeamMemberDialog} onOpenChange={setShowTeamMemberDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTeamMember ? t('team.editTeamMember') : t('team.addTeamMember')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('common.name')}</Label>
                <Input
                  value={teamMemberForm.name}
                  onChange={(e) => setTeamMemberForm({...teamMemberForm, name: e.target.value})}
                  placeholder={t('team.namePlaceholder')}
                />
              </div>
              <div>
                <Label>{t('team.jobTitle')}</Label>
                <Input
                  value={teamMemberForm.title}
                  onChange={(e) => setTeamMemberForm({...teamMemberForm, title: e.target.value})}
                  placeholder={t('team.titlePlaceholder')}
                />
              </div>
            </div>
            
            <div>
              <Label>{t('team.bio')}</Label>
              <Textarea
                value={teamMemberForm.bio}
                onChange={(e) => setTeamMemberForm({...teamMemberForm, bio: e.target.value})}
                placeholder={t('team.bioPlaceholder')}
                rows={3}
              />
            </div>
            
            <div>
              <Label>{t('team.profileImage')}</Label>
              <ImageUpload
                label={t('team.profileImage')}
                value={teamMemberForm.image_url}
                onChange={(url) => setTeamMemberForm({...teamMemberForm, image_url: url})}
                clientId={clientId || ''}
                context="team-member"
                description={teamMemberForm.name || ''}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTeamMemberDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSaveTeamMember}>{t('common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingReview ? t('reviews.editReview') : t('reviews.addNewReview')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('reviews.reviewerName')}</Label>
                <Input
                  value={reviewForm.reviewer_name}
                  onChange={(e) => setReviewForm({...reviewForm, reviewer_name: e.target.value})}
                  placeholder={t('reviews.customerNamePlaceholder')}
                />
              </div>
              <div>
                <Label>{t('reviews.starRating')}</Label>
                <Select 
                  value={reviewForm.star_rating.toString()} 
                  onValueChange={(value) => setReviewForm({...reviewForm, star_rating: parseFloat(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5 {t('reviews.stars')}</SelectItem>
                    <SelectItem value="1">1 {t('reviews.star')}</SelectItem>
                    <SelectItem value="1.5">1.5 {t('reviews.stars')}</SelectItem>
                    <SelectItem value="2">2 {t('reviews.stars')}</SelectItem>
                    <SelectItem value="2.5">2.5 {t('reviews.stars')}</SelectItem>
                    <SelectItem value="3">3 {t('reviews.stars')}</SelectItem>
                    <SelectItem value="3.5">3.5 {t('reviews.stars')}</SelectItem>
                    <SelectItem value="4">4 {t('reviews.stars')}</SelectItem>
                    <SelectItem value="4.5">4.5 {t('reviews.stars')}</SelectItem>
                    <SelectItem value="5">5 {t('reviews.stars')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>{t('reviews.reviewText')}</Label>
              <Textarea
                value={reviewForm.review_text}
                onChange={(e) => setReviewForm({...reviewForm, review_text: e.target.value})}
                placeholder={t('reviews.customerReview')}
                rows={4}
              />
            </div>
            
            <div>
              <Label>{t('reviews.reviewDate')}</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-current-date-admin"
                    checked={!!reviewForm.review_date && format(reviewForm.review_date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                    onCheckedChange={(checked) => {
                      if (checked === true) {
                        setReviewForm({ ...reviewForm, review_date: new Date() });
                      }
                    }}
                  />
                  <label
                    htmlFor="use-current-date-admin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('reviews.useCurrentDate')} ({format(new Date(), 'dd/MM/yyyy')})
                  </label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reviewForm.review_date && "text-muted-foreground"
                      )}
                    >
                      {reviewForm.review_date ? (
                        format(reviewForm.review_date, "dd/MM/yyyy")
                      ) : (
                        <span>{t('reviews.selectDate')}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reviewForm.review_date ?? undefined}
                      onSelect={(d) => setReviewForm({ ...reviewForm, review_date: d ?? null })}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSaveReview}>{t('common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={showFaqDialog} onOpenChange={setShowFaqDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Editar FAQ' : 'Agregar FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pregunta</Label>
              <Input
                value={faqForm.question}
                onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                placeholder="¿Cuál es tu pregunta?"
              />
            </div>
            <div>
              <Label>Respuesta</Label>
              <Textarea
                value={faqForm.answer}
                onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                placeholder="Escribe la respuesta aquí..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFaqDialog(false)}>Cancelar</Button>
              <Button onClick={handleSaveFaq}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Briefing Tab */}
      <TabsContent value="briefing">
        <Card>
          <CardHeader>
            <CardTitle>{t('briefing.title')}</CardTitle>
            <CardDescription>
            <CardDescription>
              Estos briefings se utilizan para regenerar contenido cuando sea necesario. Solo administradores pueden ver y usar esta función.
            </CardDescription>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Briefing */}
            <div>
              <Label htmlFor="content-briefing" className="text-base font-semibold">
                {t('briefing.contentTitle')}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe tu restaurante, tipo de comida, ambiente, ubicación y audiencia objetivo
              </p>
              <Textarea
                id="content-briefing"
                value={contentBriefing}
                onChange={(e) => setContentBriefing(e.target.value)}
                placeholder="Ejemplo: Somos un restaurante de comida peruana contemporánea ubicado en Miraflores. Nos especializamos en fusión nikkei con ingredientes frescos del mar peruano. Nuestro ambiente es moderno y elegante, dirigido a profesionales de 25-45 años que buscan experiencias gastronómicas únicas..."
                rows={6}
                className="mt-2"
              />
            </div>

            {/* Style Briefing */}
            <div>
              <Label htmlFor="style-briefing" className="text-base font-semibold">
                {t('briefing.styleTitle')}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Especifica preferencias de estilo, colores, fuentes y diseño para el sitio web
              </p>
              <Textarea
                id="style-briefing"
                value={styleBriefing}
                onChange={(e) => setStyleBriefing(e.target.value)}
                placeholder="Ejemplo: Queremos un diseño elegante y moderno con colores oscuros (negro, dorado). Fuentes serif para títulos, sans-serif para texto. Estilo minimalista pero sofisticado. Logo ya disponible en formato PNG..."
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Contact/Delivery/Social Media Briefing */}
            <div>
              <Label htmlFor="contact-delivery-briefing" className="text-base font-semibold">
                Contact/Delivery/Social Media Details
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Información práctica del negocio: contacto, delivery, redes sociales, horarios
              </p>
              <Textarea
                id="contact-delivery-briefing"
                value={contactDeliveryBriefing}
                onChange={(e) => setContactDeliveryBriefing(e.target.value)}
                placeholder="Ejemplo: Teléfono: +51 987 654 321, WhatsApp: +51 987 654 321, Email: info@mirestaurante.com, Dirección: Av. Larco 123, Miraflores, Delivery: Rappi, PedidosYa, Instagram: @mirestaurante, Facebook: Mi Restaurante, Horarios: Lu-Vi 12pm-10pm, Sa-Do 11am-11pm..."
                rows={4}
                className="mt-2"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateContent}
                disabled={isGenerating || !contentBriefing.trim()}
                className="min-w-32"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerando...
                  </>
                ) : (
                  'Regenerar Todo el Contenido'
                )}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>¿Qué hace esta herramienta?</strong></p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong>Content Briefing:</strong> Regenera contenido, títulos, descripciones y textos optimizados para SEO</li>
                <li><strong>Style Briefing:</strong> Actualiza colores, fuentes, logos y elementos de branding</li>
                <li><strong>Contact/Delivery/Social:</strong> Actualiza información práctica como teléfonos, direcciones, redes sociales</li>
                <li>Regenera imágenes profesionales que coinciden con tu marca</li>
                <li>Todo el contenido se actualiza en español y se optimiza para Lima, Perú</li>
              </ul>
              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertDescription className="text-sm text-amber-800">
                  <strong>Nota:</strong> Esta función solo está disponible para administradores. El contenido se genera automáticamente durante el registro.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Discounts Tab */}
      <TabsContent value="discounts">
        <ClientDiscountAssignments clientId={effectiveClientId} />
      </TabsContent>

      {/* Advanced Tab */}
      <TabsContent value="advanced">
        <Card>
          <CardHeader>
            <CardTitle>Configuración Avanzada</CardTitle>
            <CardDescription>
              Configuración de analíticas y herramientas avanzadas para usuarios premium.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Analytics Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">Google Analytics 4</h3>
                <Switch
                  checked={formData.analytics_enabled}
                  onCheckedChange={(checked) => handleToggleAutoSave('analytics_enabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="google_analytics_id">ID de Google Analytics (GA4)</Label>
                <Input
                  id="google_analytics_id"
                  value={formData.google_analytics_id}
                  onChange={(e) => setFormData({...formData, google_analytics_id: e.target.value})}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  <strong>Cómo obtenerlo:</strong><br />
                  1. Ve a <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Analytics</a><br />
                  2. Selecciona tu propiedad → Administración → Configuración de la propiedad<br />
                  3. Copia el ID de medición (formato: G-XXXXXXXXXX)
                </p>
              </div>
            </div>

            {/* Google Search Console Section */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Google Search Console</h3>
              
              <div className="space-y-2">
                <Label htmlFor="google_search_console_verification">Código de verificación GSC</Label>
                <Input
                  id="google_search_console_verification"
                  value={formData.google_search_console_verification}
                  onChange={(e) => setFormData({...formData, google_search_console_verification: e.target.value})}
                  placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  <strong>Cómo obtenerlo:</strong><br />
                  1. Ve a <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Search Console</a><br />
                  2. Agrega una propiedad nueva con el dominio del cliente<br />
                  3. Selecciona "Etiqueta HTML" como método de verificación<br />
                  4. Copia solo el valor del atributo content (sin las comillas)
                </p>
              </div>
            </div>

            {/* Premium Features Section */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Funciones Premium</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthly_reports_enabled">Reportes Mensuales</Label>
                    <p className="text-sm text-muted-foreground">Genera reportes automáticos de rendimiento</p>
                  </div>
                  <Switch
                    id="monthly_reports_enabled"
                    checked={formData.monthly_reports_enabled}
                    onCheckedChange={(checked) => handleToggleAutoSave('monthly_reports_enabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="premium_support_enabled">Soporte Premium</Label>
                    <p className="text-sm text-muted-foreground">Acceso a soporte prioritario y personalizado</p>
                  </div>
                  <Switch
                    id="premium_support_enabled"
                    checked={formData.premium_support_enabled}
                    onCheckedChange={(checked) => handleToggleAutoSave('premium_support_enabled', checked)}
                  />
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </TabsContent>

        {/* Client Images Tab */}
        <TabsContent value="custom-images">
          <Card>
            <CardHeader>
              <CardTitle>{t('images.title')}</CardTitle>
              <CardDescription>{t('images.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {effectiveClientId ? (
                <CustomImagesManager selectedClientId={effectiveClientId} />
              ) : (
                <p className="text-sm text-muted-foreground">{t('images.selectClient')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Control de Sitio Tab - Admin Only */}
        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Control de Sitio</CardTitle>
              <CardDescription>
                Gestiona el estado de activación del sitio y el acceso al dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Site Live Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="site_live" className="text-base font-semibold">
                      Sitio en Vivo
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activa esta opción cuando el sitio esté completamente desplegado y en funcionamiento
                    </p>
                  </div>
                  <Switch
                    id="site_live"
                    checked={!!formData.site_live_at}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        site_live_at: checked ? new Date().toISOString() : null
                      });
                    }}
                  />
                </div>

                {formData.site_live_at && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Fecha de activación:</span>{' '}
                      {new Date(formData.site_live_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Site Deactivation Section */}
              <div className="space-y-4 pt-6 border-t">
                <Alert variant="destructive">
                  <AlertDescription>
                    Cuando el sitio está desactivado, se mostrará un aviso en todas las páginas del cliente informando que el sitio no está disponible.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <Label htmlFor="is_deactivated" className="text-base font-semibold">
                        Sitio Desactivado
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Se activa automáticamente cuando la suscripción es cancelada por falta de pago
                      </p>
                      {client?.subscription_status && (
                        <div className="flex gap-2 mt-2">
                          <Badge variant={client.subscription_status === 'active' ? 'default' : 'destructive'}>
                            Estado: {client.subscription_status}
                          </Badge>
                          {client.payment_status && (
                            <Badge variant={client.payment_status === 'paid' ? 'default' : 'secondary'}>
                              Pago: {client.payment_status}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Switch
                      id="is_deactivated"
                      checked={formData.is_deactivated}
                      onCheckedChange={handleDeactivationToggle}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <Label htmlFor="dashboard_is_deactivated" className="text-base font-semibold">
                        Dashboard Desactivado
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Controla el acceso del cliente al dashboard durante el período de revisión manual
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Útil para mantener bloqueado el acceso mientras revisas la configuración inicial del sitio
                      </p>
                    </div>
                    <Switch
                      id="dashboard_is_deactivated"
                      checked={formData.dashboard_is_deactivated}
                      onCheckedChange={handleDashboardDeactivationToggle}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
  </div>
);
}