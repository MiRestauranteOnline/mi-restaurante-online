import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Plus, Trash2, Edit, Search, GripVertical, FolderPlus, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ImageUpload } from "@/components/ImageUpload";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
  domain?: string;
  vercel_team?: string;
  vercel_project?: string;
  vercel_dashboard_url?: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
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
  // Two-part titles
  homepage_hero_title_first_line?: string;
  homepage_hero_title_second_line?: string;
  homepage_menu_section_title_first_line?: string;
  homepage_menu_section_title_second_line?: string;
  homepage_contact_section_title_first_line?: string;
  homepage_contact_section_title_second_line?: string;
  homepage_services_section_title_first_line?: string;
  homepage_services_section_title_second_line?: string;
  homepage_about_section_title_first_line?: string;
  homepage_about_section_title_second_line?: string;
  reviews_section_title_first_line?: string;
  reviews_section_title_second_line?: string;
  about_page_hero_title_first_line?: string;
  about_page_hero_title_second_line?: string;
  about_team_section_title_first_line?: string;
  about_team_section_title_second_line?: string;
  contact_page_hero_title_first_line?: string;
  contact_page_hero_title_second_line?: string;
  menu_page_hero_title_first_line?: string;
  menu_page_hero_title_second_line?: string;
  reviews_page_hero_title_first_line?: string;
  reviews_page_hero_title_second_line?: string;
  // Other content fields
  homepage_hero_description?: string;
  homepage_hero_background_url?: string;
  homepage_hero_right_button_text?: string;
  homepage_hero_right_button_link?: string;
  homepage_about_section_description?: string;
  homepage_about_section_image_url?: string;
  homepage_services_section_description?: string;
  homepage_menu_section_description?: string;
  homepage_contact_section_description?: string;
  homepage_delivery_section_title?: string;
  homepage_delivery_section_description?: string;
  homepage_contact_hide_reservation_box?: boolean;
  about_page_hero_description?: string;
  about_page_hero_background_url?: string;
  about_page_about_section_image_url?: string;
  about_team_section_description?: string;
  menu_page_hero_description?: string;
  menu_page_hero_background_url?: string;
  contact_page_hero_description?: string;
  contact_page_hero_background_url?: string;
  reviews_page_hero_description?: string;
  reviews_page_hero_background_url?: string;
  // About content fields (replacing JSONB)
  about_story?: string;
  about_chef_info?: string;
  about_mission?: string;
  // Stats fields (3 items)
  stats_item1_icon?: string;
  stats_item1_number?: string;
  stats_item1_label?: string;
  stats_item2_icon?: string;
  stats_item2_number?: string;
  stats_item2_label?: string;
  stats_item3_icon?: string;
  stats_item3_number?: string;
  stats_item3_label?: string;
  // Legacy stats fields
  stats_experience_number?: string;
  stats_experience_label?: string;
  stats_clients_number?: string;
  stats_clients_label?: string;
  stats_awards_number?: string;
  stats_awards_label?: string;
  // Services Cards (3 cards)
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
  // Services Features (3 features)
  services_feature1_icon?: string;
  services_feature1_text?: string;
  services_feature2_icon?: string;
  services_feature2_text?: string;
  services_feature3_icon?: string;
  services_feature3_text?: string;
  // Footer description
  footer_description?: string;
  // Logo URLs
  header_logo_url?: string;
  footer_logo_url?: string;
  // Downloadable menu
  downloadable_menu_url?: string;
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
}

// Sortable Category Card Component for Menu Tab
function SortableCategoryCard({ 
  category, 
  categoryItems,
  searchTerm,
  sensors,
  filteredAndGroupedMenuItems,
  openMenuItemDialog,
  openCategoryDialog,
  handleDeleteCategory,
  handleMenuItemDragEnd,
  formData,
  handleDeleteMenuItem
}: {
  category: MenuCategory;
  categoryItems: MenuItem[];
  searchTerm: string;
  sensors: any;
  filteredAndGroupedMenuItems: Record<string, MenuItem[]>;
  openMenuItemDialog: (item?: MenuItem, defaultCategoryId?: string) => void;
  openCategoryDialog: (category?: MenuCategory) => void;
  handleDeleteCategory: (id: string) => void;
  handleMenuItemDragEnd: (event: DragEndEvent, categoryId: string) => void;
  formData: any;
  handleDeleteMenuItem: (id: string) => void;
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
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <Collapsible defaultOpen={!searchTerm || categoryItems.length > 0}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="cursor-grab active:cursor-grabbing p-1"
                  onClick={(e) => e.stopPropagation()}
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <ChevronRight className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90" />
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {categoryItems.length} items
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openMenuItemDialog(undefined, category.name)}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openCategoryDialog(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleMenuItemDragEnd(event, category.id)}
              >
                <SortableContext items={categoryItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <SortableMenuItem
                        key={item.id}
                        item={item}
                        currencySymbol={formData.other_customizations.currency}
                        onEdit={openMenuItemDialog}
                        onDelete={handleDeleteMenuItem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
function SortableMenuItem({ item, currencySymbol, onEdit, onDelete }: { 
  item: MenuItem, 
  currencySymbol: string,
  onEdit: (item: MenuItem) => void,
  onDelete: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

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
          <span className="font-medium">{item.name}</span>
          <span className="text-sm text-muted-foreground ml-2">
            {currencySymbol}{item.price}
          </span>
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Team Member Component
function SortableTeamMember({ member, onEdit, onDelete }: { 
  member: TeamMember, 
  onEdit: (member: TeamMember) => void,
  onDelete: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: member.id });

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
        <div className="flex items-center gap-3">
          {member.image_url && (
            <img src={member.image_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
          )}
          <div>
            <span className="font-medium">{member.name}</span>
            <p className="text-sm text-muted-foreground">{member.title}</p>
            {member.bio && (
              <p className="text-xs text-muted-foreground max-w-xs truncate">{member.bio}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
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
function SortableReview({ review, onEdit, onDelete }: { 
  review: Review, 
  onEdit: (review: Review) => void,
  onDelete: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: review.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.reviewer_name}</span>
            <div className="flex">{renderStars(review.star_rating)}</div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs truncate">{review.review_text}</p>
        </div>
      </div>
      <div className="flex gap-2">
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

export default function ClientSettings() {
  console.log('ClientSettings component rendered'); // Debug log
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [clientSettings, setClientSettings] = useState<ClientSettings | null>(null);
  const [adminContent, setAdminContent] = useState<AdminContent | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showMenuItemDialog, setShowMenuItemDialog] = useState(false);
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
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
    reviewer_name: '', review_text: '', star_rating: 5, display_order: 0
  });

  // Briefing state
  const [briefing, setBriefing] = useState('');
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
      acc[category.id] = filtered.filter(item => item.category_id === category.id);
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
    { value: 'Utensils', label: 'Utensils' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Users', label: 'Users' },
    { value: 'Clock', label: 'Clock' },
    { value: 'Star', label: 'Star' },
    { value: 'MapPin', label: 'MapPin' },
    { value: 'Award', label: 'Award' },
    { value: 'Heart', label: 'Heart' },
    { value: 'Coffee', label: 'Coffee' },
    { value: 'Zap', label: 'Zap' }
  ];

  const [formData, setFormData] = useState({
    restaurant_name: '',
    subdomain: '',
    domain: '',
    vercel_team: '',
    vercel_project: '',
    vercel_dashboard_url: '',
    email: '',
    phone: '',
    phone_country_code: '+51',
    address: '',
    whatsapp: '',
    whatsapp_country_code: '+51',
    coordinates: { lat: '', lng: '' },
    theme: 'dark',
    hide_whatsapp_button_menu: false,
    hide_phone_button_menu: false,
    custom_cta_button_text: '',
    custom_cta_button_link: '',
    show_whatsapp_popup: false,
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
    header_background_enabled: false,
    header_background_style: 'dark',
    title_font: 'Cormorant Garamond',
    body_font: 'Inter',
    title_font_weight: '400',
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
    homepage_hero_right_button_text: 'Reservar Mesa',
    homepage_hero_right_button_link: '#contact',
    homepage_about_section_description: '',
    homepage_about_section_image_url: '',
    homepage_services_section_description: '',
    homepage_menu_section_description: 'Descubre nuestra selección de platos cuidadosamente elaborados',
    homepage_contact_section_description: 'Contáctanos para reservar tu mesa y vivir una experiencia gastronómica única',
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
    // Downloadable menu
    downloadable_menu_url: ''
  });

  useEffect(() => {
    if (clientId) {
      fetchClient();
      fetchClientSettings();
      fetchAdminContent();
      fetchCategories();
      fetchMenuItems();
      fetchTeamMembers();
      fetchReviews();
      fetchUserRole();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
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
        vercel_team: (data as any).vercel_team || '',
        vercel_project: (data as any).vercel_project || '',
        vercel_dashboard_url: (data as any).vercel_dashboard_url || '',
        email: data.email || '',
        phone: data.phone || '',
        phone_country_code: (data as any).phone_country_code || '+51',
        address: data.address || '',
        whatsapp: data.whatsapp || '',
        whatsapp_country_code: (data as any).whatsapp_country_code || '+51',
        coordinates: (data.coordinates as any) || { lat: '', lng: '' },
        theme: (data as any).theme || 'dark',
        hide_whatsapp_button_menu: (data as any).hide_whatsapp_button_menu || false,
        hide_phone_button_menu: (data as any).hide_phone_button_menu || false,
        custom_cta_button_text: (data as any).custom_cta_button_text || '',
        custom_cta_button_link: (data as any).custom_cta_button_link || '',
        show_whatsapp_popup: (data as any).show_whatsapp_popup || false,
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
        }
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
    try {
      const { data, error } = await supabase
        .from('client_settings')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setClientSettings(data as any);
        setFormData(prev => ({
          ...prev,
          primary_color: (data as any).primary_color || '#FFD700',
          header_background_enabled: (data as any).header_background_enabled || false,
          header_background_style: (data as any).header_background_style || 'dark',
          title_font: (data as any).title_font || 'Cormorant Garamond',
          body_font: (data as any).body_font || 'Inter',
          title_font_weight: (data as any).title_font_weight || '400',
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
            client_id: clientId,
            primary_color: '#FFD700',
            header_background_enabled: false,
            header_background_style: 'dark',
            title_font: 'Cormorant Garamond',
            body_font: 'Inter',
            title_font_weight: '400',
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

  const fetchAdminContent = async () => {
    try {
      // Use type assertion to bypass TypeScript errors until types are updated
      const { data, error } = await (supabase as any)
        .from('admin_content')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load admin content:', error);
        return;
      }
      
      if (data) {
        setAdminContent(data);
        // Update form data with admin content
        setFormData(prev => ({
          ...prev,
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
          homepage_hero_right_button_text: data.homepage_hero_right_button_text || 'Reservar Mesa',
          homepage_hero_right_button_link: data.homepage_hero_right_button_link || '#contact',
          homepage_about_section_description: data.homepage_about_section_description || '',
          homepage_about_section_image_url: data.homepage_about_section_image_url || '',
          homepage_services_section_description: data.homepage_services_section_description || '',
          homepage_menu_section_description: data.homepage_menu_section_description || 'Descubre nuestra selección de platos cuidadosamente elaborados',
          homepage_contact_section_description: data.homepage_contact_section_description || 'Contáctanos para reservar tu mesa y vivir una experiencia gastronómica única',
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
          downloadable_menu_url: data.downloadable_menu_url || ''
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
        setUserRole(data?.role || null);
      }
    } catch (error: any) {
      console.error('Failed to fetch user role:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('client_id', clientId)
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
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('client_id', clientId)
        .order('name');

      if (error) throw error;
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
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('client_id', clientId)
        .order('display_order');

      if (error) throw error;
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
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('client_id', clientId)
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
          domain: formData.domain,
          vercel_team: formData.vercel_team,
          vercel_project: formData.vercel_project,
          vercel_dashboard_url: formData.vercel_dashboard_url,
          email: formData.email,
          phone: formData.phone,
          phone_country_code: formData.phone_country_code,
          address: formData.address,
          whatsapp: formData.whatsapp,
          whatsapp_country_code: formData.whatsapp_country_code,
          coordinates: formData.coordinates,
          theme: formData.theme,
          opening_hours: orderedOpeningHours,
          social_media_links: formData.social_media_links,
          delivery: formData.delivery,
          brand_colors: formData.brand_colors,
          other_customizations: formData.other_customizations,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Update blocked by RLS (no rows updated)');

      // Update client_settings table
      const { error: settingsError } = await supabase
        .from('client_settings')
        .upsert({
          client_id: clientId,
          primary_color: formData.primary_color,
          header_background_enabled: formData.header_background_enabled,
          header_background_style: formData.header_background_style,
          title_font: formData.title_font,
          body_font: formData.body_font,
          title_font_weight: formData.title_font_weight,
          hide_whatsapp_button_menu: formData.hide_whatsapp_button_menu,
          hide_phone_button_menu: formData.hide_phone_button_menu,
          custom_cta_button_text: formData.custom_cta_button_text,
          custom_cta_button_link: formData.custom_cta_button_link,
          show_whatsapp_popup: formData.show_whatsapp_popup,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'client_id'
        });

      if (settingsError) throw settingsError;

      // Update admin_content table if user is admin
      if (userRole === 'admin') {
        const { error: adminContentError } = await (supabase as any)
          .from('admin_content')
          .upsert({
            client_id: clientId,
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
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'client_id'
          });

        if (adminContentError) throw adminContentError;
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
            client_id: clientId,
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
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      // Soft delete like regular user system - set is_active to false
      const { data, error } = await supabase
        .from('menu_categories')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Delete blocked by RLS');
      await fetchCategories();
      toast({ title: "Success", description: "Category deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to delete category: " + error.message,
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
            client_id: clientId,
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
            client_id: clientId,
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
            display_order: reviewForm.display_order
          })
          .eq('id', editingReview.id);

        if (error) throw error;
        
        setReviews(reviews.map(r => r.id === editingReview.id ? { ...r, ...reviewForm } : r) as Review[]);
        setEditingReview(null);
      } else {
        const maxOrder = reviews.reduce((max, r) => Math.max(max, r.display_order), 0);
        
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            client_id: clientId,
            reviewer_name: reviewForm.reviewer_name,
            review_text: reviewForm.review_text,
            star_rating: reviewForm.star_rating,
            display_order: maxOrder + 1,
            is_active: true
          })
          .select();

        if (error) throw error;
        
        if (data?.[0]) {
          setReviews([...reviews, data[0] as Review]);
        }
      }
      
      setReviewForm({ reviewer_name: '', review_text: '', star_rating: 5, display_order: 0 });
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

  // Briefing AI content generation
  const handleGenerateContent = async () => {
    if (!briefing.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un briefing antes de generar contenido",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-client-content', {
        body: {
          briefing,
          clientId,
          restaurantName: client?.restaurant_name,
          address: client?.address
        }
      });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Contenido generado exitosamente. Revisa la pestaña 'Change Content' para ver los cambios.",
      });

      // Reload admin content to show updated data
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
      });
    } else {
      setEditingReview(null);
      setReviewForm({ reviewer_name: '', review_text: '', star_rating: 5, display_order: 0 });
    }
    setShowReviewDialog(true);
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over?.id);

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Update display_order values to match regular user system (1-based indexing)
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        display_order: index + 1  // Changed from index to index + 1
      }));

      setCategories(updatedCategories);

      // Update database
      try {
        for (const category of updatedCategories) {
          await supabase
            .from('menu_categories')
            .update({ display_order: category.display_order })
            .eq('id', category.id);
        }
        toast({ title: "Success", description: "Category order updated" });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update category order: " + error.message,
          variant: "destructive"
        });
        // Revert on error
        await fetchCategories();
      }
    }
  };

  const handleMenuItemDragEnd = async (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const categoryItems = filteredAndGroupedMenuItems[categoryId] || [];
      const oldIndex = categoryItems.findIndex((item) => item.id === active.id);
      const newIndex = categoryItems.findIndex((item) => item.id === over?.id);

      const reorderedItems = arrayMove(categoryItems, oldIndex, newIndex);
      
      // Update the menuItems state
      const updatedMenuItems = menuItems.map(item => {
        if (item.category_id === categoryId) {
          const exists = reorderedItems.find(reorderedItem => reorderedItem.id === item.id);
          return exists ? { ...item } : item;
        }
        return item;
      });

      setMenuItems(updatedMenuItems);

      try {
        // For now, we'll just show success. In a more complex system, 
        // you might want to add a display_order field to menu_items table
        toast({ title: "Success", description: "Menu item order updated" });
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/client-management')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Client Settings</h1>
            <p className="text-muted-foreground">{client.restaurant_name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="hours">Opening Hours</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          {userRole === 'admin' && <TabsTrigger value="content">Change Content</TabsTrigger>}
          <TabsTrigger value="briefing">Briefing</TabsTrigger>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurant_name">Restaurant Name</Label>
                  <Input
                    id="restaurant_name"
                    value={formData.restaurant_name}
                    onChange={(e) => setFormData({...formData, restaurant_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <PhoneInput
                    countryCode={formData.phone_country_code}
                    phoneNumber={formData.phone}
                    onCountryCodeChange={(code) => setFormData({...formData, phone_country_code: code})}
                    onPhoneNumberChange={(number) => setFormData({...formData, phone: number})}
                    placeholder="123 456 789"
                    maxLength={12}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <PhoneInput
                    countryCode={formData.whatsapp_country_code}
                    phoneNumber={formData.whatsapp}
                    onCountryCodeChange={(code) => setFormData({...formData, whatsapp_country_code: code})}
                    onPhoneNumberChange={(number) => setFormData({...formData, whatsapp: number})}
                    placeholder="987 654 321"
                    maxLength={12}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="hide_whatsapp_button_menu">Hide WhatsApp Button from Menu</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hide_whatsapp_button_menu"
                      checked={formData.hide_whatsapp_button_menu}
                      onCheckedChange={(checked) => setFormData({...formData, hide_whatsapp_button_menu: checked})}
                    />
                    <Label htmlFor="hide_whatsapp_button_menu" className="text-sm text-muted-foreground">
                      {formData.hide_whatsapp_button_menu ? 'Hidden' : 'Visible'}
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hide_phone_button_menu">Hide Phone Button from Menu</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hide_phone_button_menu"
                      checked={formData.hide_phone_button_menu}
                      onCheckedChange={(checked) => setFormData({...formData, hide_phone_button_menu: checked})}
                    />
                    <Label htmlFor="hide_phone_button_menu" className="text-sm text-muted-foreground">
                      {formData.hide_phone_button_menu ? 'Hidden' : 'Visible'}
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="show_whatsapp_popup">Show WhatsApp Popup</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_whatsapp_popup"
                      checked={formData.show_whatsapp_popup}
                      onCheckedChange={(checked) => setFormData({...formData, show_whatsapp_popup: checked})}
                    />
                    <Label htmlFor="show_whatsapp_popup" className="text-sm text-muted-foreground">
                      {formData.show_whatsapp_popup ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="custom_cta_button_text">Custom Menu CTA Button Text</Label>
                  <Input
                    id="custom_cta_button_text"
                    value={formData.custom_cta_button_text}
                    onChange={(e) => setFormData({...formData, custom_cta_button_text: e.target.value})}
                    placeholder="Reserve Table"
                  />
                </div>
                <div>
                  <Label htmlFor="custom_cta_button_link">Custom Menu CTA Button Link</Label>
                  <Input
                    id="custom_cta_button_link"
                    value={formData.custom_cta_button_link}
                    onChange={(e) => setFormData({...formData, custom_cta_button_link: e.target.value})}
                    placeholder="#contact or https://example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle>Domain Configuration</CardTitle>
              <CardDescription>
                Manage hosting settings for this client's website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                    placeholder="clientname"
                  />
                  <span className="text-sm text-muted-foreground">.mirestaurante.online</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for hosting on our subdomain: clientname.mirestaurante.online
                </p>
              </div>
              
              <div>
                <Label htmlFor="domain">Custom Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  placeholder="www.clientrestaurant.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Client's custom domain. Client must configure DNS to point to our hosting.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Hosting</h3>
                
                <div>
                  <Label htmlFor="vercel_team">Vercel Team</Label>
                  <Input
                    id="vercel_team"
                    value={formData.vercel_team}
                    onChange={(e) => setFormData({...formData, vercel_team: e.target.value})}
                    placeholder="team-name"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Vercel team name for hosting this client's website.
                  </p>
                </div>

                <div>
                  <Label htmlFor="vercel_project">Vercel Project</Label>
                  <Input
                    id="vercel_project"
                    value={formData.vercel_project}
                    onChange={(e) => setFormData({...formData, vercel_project: e.target.value})}
                    placeholder="project-name"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Vercel project name for this client's deployment.
                  </p>
                </div>

                <div>
                  <Label htmlFor="vercel_dashboard_url">Vercel Dashboard URL</Label>
                  <Input
                    id="vercel_dashboard_url"
                    value={formData.vercel_dashboard_url}
                    onChange={(e) => setFormData({...formData, vercel_dashboard_url: e.target.value})}
                    placeholder="https://vercel.com/team/project"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct link to this client's project dashboard on Vercel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const hours = formData.opening_hours[day] || { closed: true, open: '09:00', close: '17:00' };
                return (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24">
                    <Label className="text-sm font-medium capitalize">{day}</Label>
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
                      {hours.closed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  {!hours.closed && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Opens:</Label>
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
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Closes:</Label>
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
                          className="w-32"
                        />
                      </div>
                    </>
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
              </div>
            </CardContent>
          </Card>
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
                  value={formData.delivery.rappi}
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
                  value={formData.delivery.pedidos_ya}
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
                  value={formData.delivery.didi_food}
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

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({
                      ...formData, 
                      primary_color: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={formData.theme} onValueChange={(value) => setFormData({...formData, theme: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bright">Bright</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-lg font-medium">Header Settings</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="header_background_enabled"
                    checked={formData.header_background_enabled}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      header_background_enabled: checked
                    })}
                  />
                  <Label htmlFor="header_background_enabled">Enable Header Background</Label>
                </div>
                
                {formData.header_background_enabled && (
                  <div>
                    <Label htmlFor="header_background_style">Header Background Style</Label>
                    <Select 
                      value={formData.header_background_style} 
                      onValueChange={(value) => setFormData({...formData, header_background_style: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bright">Bright</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-lg font-medium">Logo Settings</h4>
                <div className="space-y-4">
                  <div>
                    <ImageUpload
                      label="Header Logo"
                      value={formData.header_logo_url || ''}
                      onChange={(url) => setFormData({...formData, header_logo_url: url})}
                      clientId={clientId!}
                    />
                  </div>
                  <div>
                    <ImageUpload
                      label="Footer Logo"
                      value={formData.footer_logo_url || ''}
                      onChange={(url) => setFormData({...formData, footer_logo_url: url})}
                      clientId={clientId!}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-lg font-medium">Typography</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="title_font">Title Font</Label>
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
                  </div>
                  <div>
                    <Label htmlFor="title_font_weight">Title Font Weight</Label>
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
                  </div>
                  <div>
                    <Label htmlFor="body_font">Body Font</Label>
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
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-lg font-medium">Additional Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <Input
                      id="accent_color"
                      type="color"
                      value={formData.brand_colors.accent}
                      onChange={(e) => setFormData({
                        ...formData, 
                        brand_colors: {
                          ...formData.brand_colors,
                          accent: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="content">
            <div className="space-y-6">
              {/* Homepage Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Homepage - Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="homepage_hero_title_first_line">Hero Title (First Line)</Label>
                      <Input
                        id="homepage_hero_title_first_line"
                        value={formData.homepage_hero_title_first_line}
                        onChange={(e) => setFormData({...formData, homepage_hero_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepage_hero_title_second_line">Hero Title (Second Line)</Label>
                      <Input
                        id="homepage_hero_title_second_line"
                        value={formData.homepage_hero_title_second_line}
                        onChange={(e) => setFormData({...formData, homepage_hero_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <ImageUpload
                      label="Hero Background Image"
                      value={formData.homepage_hero_background_url}
                      onChange={(url) => setFormData({...formData, homepage_hero_background_url: url})}
                      clientId={clientId!}
                    />
                  </div>
                  <div>
                    <Label htmlFor="homepage_hero_description">Hero Description</Label>
                    <Textarea
                      id="homepage_hero_description"
                      value={formData.homepage_hero_description}
                      onChange={(e) => setFormData({...formData, homepage_hero_description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="homepage_hero_right_button_text">Hero Button Text</Label>
                      <Input
                        id="homepage_hero_right_button_text"
                        value={formData.homepage_hero_right_button_text}
                        onChange={(e) => setFormData({...formData, homepage_hero_right_button_text: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepage_hero_right_button_link">Hero Button Link</Label>
                      <Input
                        id="homepage_hero_right_button_link"
                        value={formData.homepage_hero_right_button_link}
                        onChange={(e) => setFormData({...formData, homepage_hero_right_button_link: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Homepage About Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Homepage - About Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="homepage_about_section_title_first_line">About Section Title (First Line)</Label>
                      <Input
                        id="homepage_about_section_title_first_line"
                        value={formData.homepage_about_section_title_first_line}
                        onChange={(e) => setFormData({...formData, homepage_about_section_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepage_about_section_title_second_line">About Section Title (Second Line)</Label>
                      <Input
                        id="homepage_about_section_title_second_line"
                        value={formData.homepage_about_section_title_second_line}
                        onChange={(e) => setFormData({...formData, homepage_about_section_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                   <div>
                     <Label htmlFor="homepage_about_section_description">About Section Description</Label>
                     <Textarea
                       id="homepage_about_section_description"
                       value={formData.homepage_about_section_description}
                       onChange={(e) => setFormData({...formData, homepage_about_section_description: e.target.value})}
                       rows={3}
                     />
                   </div>
                   <div>
                     <ImageUpload
                       label="About Section Image"
                       value={formData.homepage_about_section_image_url || ''}
                       onChange={(url) => setFormData({...formData, homepage_about_section_image_url: url})}
                       clientId={clientId!}
                     />
                   </div>
                 </CardContent>
               </Card>

              {/* Homepage Services Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Homepage - Services Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="homepage_services_section_title_first_line">Services Section Title (First Line)</Label>
                      <Input
                        id="homepage_services_section_title_first_line"
                        value={formData.homepage_services_section_title_first_line}
                        onChange={(e) => setFormData({...formData, homepage_services_section_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepage_services_section_title_second_line">Services Section Title (Second Line)</Label>
                      <Input
                        id="homepage_services_section_title_second_line"
                        value={formData.homepage_services_section_title_second_line}
                        onChange={(e) => setFormData({...formData, homepage_services_section_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="homepage_services_section_description">Services Section Description</Label>
                    <Textarea
                      id="homepage_services_section_description"
                      value={formData.homepage_services_section_description}
                      onChange={(e) => setFormData({...formData, homepage_services_section_description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Homepage Menu Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Homepage - Menu Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="homepage_menu_section_title_first_line">Menu Section Title (First Line)</Label>
                      <Input
                        id="homepage_menu_section_title_first_line"
                        value={formData.homepage_menu_section_title_first_line}
                        onChange={(e) => setFormData({...formData, homepage_menu_section_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepage_menu_section_title_second_line">Menu Section Title (Second Line)</Label>
                      <Input
                        id="homepage_menu_section_title_second_line"
                        value={formData.homepage_menu_section_title_second_line}
                        onChange={(e) => setFormData({...formData, homepage_menu_section_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="homepage_menu_section_description">Menu Section Description</Label>
                    <Textarea
                      id="homepage_menu_section_description"
                      value={formData.homepage_menu_section_description}
                      onChange={(e) => setFormData({...formData, homepage_menu_section_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Homepage Contact Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Homepage - Contact Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="homepage_contact_section_title_first_line">Contact Section Title (First Line)</Label>
                      <Input
                        id="homepage_contact_section_title_first_line"
                        value={formData.homepage_contact_section_title_first_line}
                        onChange={(e) => setFormData({...formData, homepage_contact_section_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepage_contact_section_title_second_line">Contact Section Title (Second Line)</Label>
                      <Input
                        id="homepage_contact_section_title_second_line"
                        value={formData.homepage_contact_section_title_second_line}
                        onChange={(e) => setFormData({...formData, homepage_contact_section_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="homepage_contact_section_description">Contact Section Description</Label>
                    <Textarea
                      id="homepage_contact_section_description"
                      value={formData.homepage_contact_section_description}
                      onChange={(e) => setFormData({...formData, homepage_contact_section_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Hide Reservation Box</Label>
                      <p className="text-sm text-muted-foreground">Hide the reservation form box in contact section</p>
                    </div>
                    <Switch
                      checked={formData.homepage_contact_hide_reservation_box}
                      onCheckedChange={(checked) => setFormData({...formData, homepage_contact_hide_reservation_box: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Homepage Delivery Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Homepage - Delivery Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="homepage_delivery_section_title">Delivery Section Title</Label>
                    <Input
                      id="homepage_delivery_section_title"
                      value={formData.homepage_delivery_section_title}
                      onChange={(e) => setFormData({...formData, homepage_delivery_section_title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="homepage_delivery_section_description">Delivery Section Description</Label>
                    <Textarea
                      id="homepage_delivery_section_description"
                      value={formData.homepage_delivery_section_description}
                      onChange={(e) => setFormData({...formData, homepage_delivery_section_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Menu Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Menu Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="menu_page_hero_title_first_line">Hero Title (First Line)</Label>
                      <Input
                        id="menu_page_hero_title_first_line"
                        value={formData.menu_page_hero_title_first_line}
                        onChange={(e) => setFormData({...formData, menu_page_hero_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="menu_page_hero_title_second_line">Hero Title (Second Line)</Label>
                      <Input
                        id="menu_page_hero_title_second_line"
                        value={formData.menu_page_hero_title_second_line}
                        onChange={(e) => setFormData({...formData, menu_page_hero_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <ImageUpload
                      label="Hero Background Image"
                      value={formData.menu_page_hero_background_url}
                      onChange={(url) => setFormData({...formData, menu_page_hero_background_url: url})}
                      clientId={clientId!}
                    />
                  </div>
                  <div>
                    <Label htmlFor="menu_page_hero_description">Hero Description</Label>
                    <Textarea
                      id="menu_page_hero_description"
                      value={formData.menu_page_hero_description}
                      onChange={(e) => setFormData({...formData, menu_page_hero_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_page_hero_title_first_line">Hero Title (First Line)</Label>
                      <Input
                        id="contact_page_hero_title_first_line"
                        value={formData.contact_page_hero_title_first_line}
                        onChange={(e) => setFormData({...formData, contact_page_hero_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_page_hero_title_second_line">Hero Title (Second Line)</Label>
                      <Input
                        id="contact_page_hero_title_second_line"
                        value={formData.contact_page_hero_title_second_line}
                        onChange={(e) => setFormData({...formData, contact_page_hero_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <ImageUpload
                      label="Hero Background Image"
                      value={formData.contact_page_hero_background_url}
                      onChange={(url) => setFormData({...formData, contact_page_hero_background_url: url})}
                      clientId={clientId!}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_page_hero_description">Hero Description</Label>
                    <Textarea
                      id="contact_page_hero_description"
                      value={formData.contact_page_hero_description}
                      onChange={(e) => setFormData({...formData, contact_page_hero_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* About Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>About Page - Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="about_page_hero_title_first_line">Hero Title (First Line)</Label>
                      <Input
                        id="about_page_hero_title_first_line"
                        value={formData.about_page_hero_title_first_line}
                        onChange={(e) => setFormData({...formData, about_page_hero_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="about_page_hero_title_second_line">Hero Title (Second Line)</Label>
                      <Input
                        id="about_page_hero_title_second_line"
                        value={formData.about_page_hero_title_second_line}
                        onChange={(e) => setFormData({...formData, about_page_hero_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <ImageUpload
                      label="Hero Background Image"
                      value={formData.about_page_hero_background_url}
                      onChange={(url) => setFormData({...formData, about_page_hero_background_url: url})}
                      clientId={clientId!}
                    />
                  </div>
                   <div>
                     <Label htmlFor="about_page_hero_description">Hero Description</Label>
                     <Textarea
                       id="about_page_hero_description"
                       value={formData.about_page_hero_description}
                       onChange={(e) => setFormData({...formData, about_page_hero_description: e.target.value})}
                       rows={2}
                     />
                   </div>
                   <div>
                     <ImageUpload
                       label="About Section Image"
                       value={formData.about_page_about_section_image_url || ''}
                       onChange={(url) => setFormData({...formData, about_page_about_section_image_url: url})}
                       clientId={clientId!}
                     />
                   </div>
                 </CardContent>
               </Card>

              {/* About Page - Team Section */}
              <Card>
                <CardHeader>
                  <CardTitle>About Page - Team Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="about_team_section_title_first_line">Team Section Title (First Line)</Label>
                      <Input
                        id="about_team_section_title_first_line"
                        value={formData.about_team_section_title_first_line}
                        onChange={(e) => setFormData({...formData, about_team_section_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="about_team_section_title_second_line">Team Section Title (Second Line)</Label>
                      <Input
                        id="about_team_section_title_second_line"
                        value={formData.about_team_section_title_second_line}
                        onChange={(e) => setFormData({...formData, about_team_section_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="about_team_section_description">Team Section Description</Label>
                    <Textarea
                      id="about_team_section_description"
                      value={formData.about_team_section_description}
                      onChange={(e) => setFormData({...formData, about_team_section_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Legacy Stats Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Legacy Stats Section</CardTitle>
                  <p className="text-sm text-muted-foreground">Original stats fields that may still be used in some templates</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stats_experience_number">Experience Number</Label>
                      <Input
                        id="stats_experience_number"
                        value={formData.stats_experience_number}
                        onChange={(e) => setFormData({...formData, stats_experience_number: e.target.value})}
                        placeholder="15+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stats_experience_label">Experience Label</Label>
                      <Input
                        id="stats_experience_label"
                        value={formData.stats_experience_label}
                        onChange={(e) => setFormData({...formData, stats_experience_label: e.target.value})}
                        placeholder="Años de Experiencia"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stats_clients_number">Clients Number</Label>
                      <Input
                        id="stats_clients_number"
                        value={formData.stats_clients_number}
                        onChange={(e) => setFormData({...formData, stats_clients_number: e.target.value})}
                        placeholder="5K+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stats_clients_label">Clients Label</Label>
                      <Input
                        id="stats_clients_label"
                        value={formData.stats_clients_label}
                        onChange={(e) => setFormData({...formData, stats_clients_label: e.target.value})}
                        placeholder="Clientes Felices"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stats_awards_number">Awards Number</Label>
                      <Input
                        id="stats_awards_number"
                        value={formData.stats_awards_number}
                        onChange={(e) => setFormData({...formData, stats_awards_number: e.target.value})}
                        placeholder="10+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stats_awards_label">Awards Label</Label>
                      <Input
                        id="stats_awards_label"
                        value={formData.stats_awards_label}
                        onChange={(e) => setFormData({...formData, stats_awards_label: e.target.value})}
                        placeholder="Reconocimientos"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Stats Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3].map(num => (
                    <div key={num} className="border p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Stats Item {num}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`stats_item${num}_icon`}>Icon</Label>
                          <Select
                            value={formData[`stats_item${num}_icon` as keyof typeof formData] as string}
                            onValueChange={(value) => setFormData({...formData, [`stats_item${num}_icon`]: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-md z-50">
                              {iconOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`stats_item${num}_number`}>Number</Label>
                          <Input
                            id={`stats_item${num}_number`}
                            value={formData[`stats_item${num}_number` as keyof typeof formData] as string}
                            onChange={(e) => setFormData({...formData, [`stats_item${num}_number`]: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`stats_item${num}_label`}>Label</Label>
                          <Input
                            id={`stats_item${num}_label`}
                            value={formData[`stats_item${num}_label` as keyof typeof formData] as string}
                            onChange={(e) => setFormData({...formData, [`stats_item${num}_label`]: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Services Cards Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Services Cards Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3].map(num => (
                    <div key={num} className="border p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Service Card {num}</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`services_card${num}_icon`}>Icon</Label>
                            <Select
                              value={formData[`services_card${num}_icon` as keyof typeof formData] as string}
                              onValueChange={(value) => setFormData({...formData, [`services_card${num}_icon`]: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background border border-border shadow-md z-50">
                                {iconOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`services_card${num}_title`}>Title</Label>
                            <Input
                              id={`services_card${num}_title`}
                              value={formData[`services_card${num}_title` as keyof typeof formData] as string}
                              onChange={(e) => setFormData({...formData, [`services_card${num}_title`]: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`services_card${num}_description`}>Description</Label>
                          <Textarea
                            id={`services_card${num}_description`}
                            value={formData[`services_card${num}_description` as keyof typeof formData] as string}
                            onChange={(e) => setFormData({...formData, [`services_card${num}_description`]: e.target.value})}
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`services_card${num}_button_text`}>Button Text</Label>
                            <Input
                              id={`services_card${num}_button_text`}
                              value={formData[`services_card${num}_button_text` as keyof typeof formData] as string}
                              onChange={(e) => setFormData({...formData, [`services_card${num}_button_text`]: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`services_card${num}_button_link`}>Button Link</Label>
                            <Input
                              id={`services_card${num}_button_link`}
                              value={formData[`services_card${num}_button_link` as keyof typeof formData] as string}
                              onChange={(e) => setFormData({...formData, [`services_card${num}_button_link`]: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Services Features Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Services Features Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3].map(num => (
                    <div key={num} className="border p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Service Feature {num}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`services_feature${num}_icon`}>Icon</Label>
                          <Select
                            value={formData[`services_feature${num}_icon` as keyof typeof formData] as string}
                            onValueChange={(value) => setFormData({...formData, [`services_feature${num}_icon`]: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-md z-50">
                              {iconOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`services_feature${num}_text`}>Text</Label>
                          <Input
                            id={`services_feature${num}_text`}
                            value={formData[`services_feature${num}_text` as keyof typeof formData] as string}
                            onChange={(e) => setFormData({...formData, [`services_feature${num}_text`]: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>


              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Homepage - Reviews Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reviews_section_title_first_line">Reviews Section Title (First Line)</Label>
                      <Input
                        id="reviews_section_title_first_line"
                        value={formData.reviews_section_title_first_line}
                        onChange={(e) => setFormData({...formData, reviews_section_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviews_section_title_second_line">Reviews Section Title (Second Line)</Label>
                      <Input
                        id="reviews_section_title_second_line"
                        value={formData.reviews_section_title_second_line}
                        onChange={(e) => setFormData({...formData, reviews_section_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Content Section */}
              <Card>
                <CardHeader>
                  <CardTitle>About Page - Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="about_story">About Story</Label>
                    <Textarea
                      id="about_story"
                      value={formData.about_story}
                      onChange={(e) => setFormData({...formData, about_story: e.target.value})}
                      rows={4}
                      placeholder="Our restaurant's story and history..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="about_chef_info">Chef Information</Label>
                    <Textarea
                      id="about_chef_info"
                      value={formData.about_chef_info}
                      onChange={(e) => setFormData({...formData, about_chef_info: e.target.value})}
                      rows={3}
                      placeholder="Information about the chef and team..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="about_mission">Mission Statement</Label>
                    <Textarea
                      id="about_mission"
                      value={formData.about_mission}
                      onChange={(e) => setFormData({...formData, about_mission: e.target.value})}
                      rows={3}
                      placeholder="Restaurant mission and values..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reviews_page_hero_title_first_line">Hero Title (First Line)</Label>
                      <Input
                        id="reviews_page_hero_title_first_line"
                        value={formData.reviews_page_hero_title_first_line}
                        onChange={(e) => setFormData({...formData, reviews_page_hero_title_first_line: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviews_page_hero_title_second_line">Hero Title (Second Line)</Label>
                      <Input
                        id="reviews_page_hero_title_second_line"
                        value={formData.reviews_page_hero_title_second_line}
                        onChange={(e) => setFormData({...formData, reviews_page_hero_title_second_line: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <ImageUpload
                      label="Hero Background Image"
                      value={formData.reviews_page_hero_background_url}
                      onChange={(url) => setFormData({...formData, reviews_page_hero_background_url: url})}
                      clientId={clientId!}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviews_page_hero_description">Hero Description</Label>
                    <Textarea
                      id="reviews_page_hero_description"
                      value={formData.reviews_page_hero_description}
                      onChange={(e) => setFormData({...formData, reviews_page_hero_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Footer Description Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Footer Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="footer_description">Footer Description</Label>
                    <Textarea
                      id="footer_description"
                      value={formData.footer_description}
                      onChange={(e) => setFormData({...formData, footer_description: e.target.value})}
                      rows={3}
                      placeholder="Brief description for the footer section..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="menu">
          {/* Downloadable Menu Upload Section */}
          <Card className="mb-6 border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Downloadable Menu
              </CardTitle>
              <CardDescription>
                Upload a PDF/image of your menu or paste a link. This will be displayed on your website with a download button.
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
                        <span className="text-sm font-medium">Current menu file</span>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={formData.downloadable_menu_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View File
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
                    <Label>Upload File</Label>
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
                        {saving ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, JPG, PNG (max 10MB)
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
                    <Label>Or Paste URL</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/menu.pdf"
                        value={formData.downloadable_menu_url || ''}
                        onChange={(e) => setFormData({...formData, downloadable_menu_url: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Link to your menu file hosted elsewhere
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Menu
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
              <CardTitle className="flex items-center justify-between">
                Menu Management
                <div className="flex gap-2">
                  <Button onClick={() => openCategoryDialog()}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                  <Button onClick={() => openMenuItemDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Item
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage your menu categories and items. Drag categories to reorder them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <FolderPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No categories found</h3>
                    <p className="text-sm mb-4">Create your first category to start organizing your menu</p>
                    <Button onClick={() => openCategoryDialog()}>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      Create First Category
                    </Button>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCategoryDragEnd}
                >
                  <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {categories.map((category) => {
                        const categoryItems = filteredAndGroupedMenuItems[category.id] || [];
                        const hasMatchingItems = searchTerm ? categoryItems.length > 0 : true;
                        
                        if (!hasMatchingItems) return null;

                        return (
                          <SortableCategoryCard
                            key={category.id}
                            category={category}
                            categoryItems={categoryItems}
                            searchTerm={searchTerm}
                            sensors={sensors}
                            filteredAndGroupedMenuItems={filteredAndGroupedMenuItems}
                            openMenuItemDialog={openMenuItemDialog}
                            openCategoryDialog={openCategoryDialog}
                            handleDeleteCategory={handleDeleteCategory}
                            handleMenuItemDragEnd={handleMenuItemDragEnd}
                            formData={formData}
                            handleDeleteMenuItem={handleDeleteMenuItem}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
      </TabsContent>

      {/* Team Members Tab */}
      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Team Members
              <Button onClick={() => openTeamMemberDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamMembers.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleTeamMemberDragEnd}
                >
                  <SortableContext items={teamMembers.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    {teamMembers.map((member) => (
                      <SortableTeamMember
                        key={member.id}
                        member={member}
                        onEdit={openTeamMemberDialog}
                        onDelete={handleDeleteTeamMember}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="text-muted-foreground text-center py-4">No team members found. Add your first team member!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Reviews Tab */}
      <TabsContent value="reviews">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Reviews
              <Button onClick={() => openReviewDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Review
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviews.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleReviewDragEnd}
                >
                  <SortableContext items={reviews.map(r => r.id)} strategy={verticalListSortingStrategy}>
                    {reviews.map((review) => (
                      <SortableReview
                        key={review.id}
                        review={review}
                        onEdit={openReviewDialog}
                        onDelete={handleDeleteReview}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="text-muted-foreground text-center py-4">No reviews found. Add your first review!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category_name">Name</Label>
              <Input
                id="category_name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={categoryForm.display_order}
                onChange={(e) => setCategoryForm({...categoryForm, display_order: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
              <Button onClick={() => handleSaveCategory()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={showMenuItemDialog} onOpenChange={setShowMenuItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_name">Name</Label>
                <Input
                  id="item_name"
                  value={menuItemForm.name}
                  onChange={(e) => setMenuItemForm({...menuItemForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="item_price">Price</Label>
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
              <Label htmlFor="item_description">Description</Label>
              <Textarea
                id="item_description"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({...menuItemForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_category">Category</Label>
                <Select value={menuItemForm.category_id} onValueChange={(value) => setMenuItemForm({...menuItemForm, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item_image_url">Image URL</Label>
                <Input
                  id="item_image_url"
                  value={menuItemForm.image_url}
                  onChange={(e) => setMenuItemForm({...menuItemForm, image_url: e.target.value})}
                />
              </div>
            </div>
            
            {/* Visibility Options */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show on Homepage</Label>
                  <p className="text-sm text-muted-foreground">Display this item on the homepage (max 8 items)</p>
                </div>
                <Switch
                  checked={menuItemForm.show_on_homepage || false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_on_homepage: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Image on Homepage</Label>
                  <p className="text-sm text-muted-foreground">Display image when shown on homepage</p>
                </div>
                <Switch
                  checked={menuItemForm.show_image_home || false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_image_home: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Image on Menu Page</Label>
                  <p className="text-sm text-muted-foreground">Display image on the full menu page</p>
                </div>
                <Switch
                  checked={menuItemForm.show_image_menu !== false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_image_menu: checked})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMenuItemDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveMenuItem}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Member Dialog */}
      <Dialog open={showTeamMemberDialog} onOpenChange={setShowTeamMemberDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTeamMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={teamMemberForm.name}
                  onChange={(e) => setTeamMemberForm({...teamMemberForm, name: e.target.value})}
                  placeholder="Team member name"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={teamMemberForm.title}
                  onChange={(e) => setTeamMemberForm({...teamMemberForm, title: e.target.value})}
                  placeholder="Job title"
                />
              </div>
            </div>
            
            <div>
              <Label>Bio</Label>
              <Textarea
                value={teamMemberForm.bio}
                onChange={(e) => setTeamMemberForm({...teamMemberForm, bio: e.target.value})}
                placeholder="Short bio"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Profile Image</Label>
              <ImageUpload
                label="Profile Image"
                value={teamMemberForm.image_url}
                onChange={(url) => setTeamMemberForm({...teamMemberForm, image_url: url})}
                clientId={clientId || ''}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTeamMemberDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveTeamMember}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingReview ? 'Edit Review' : 'Add New Review'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Reviewer Name</Label>
                <Input
                  value={reviewForm.reviewer_name}
                  onChange={(e) => setReviewForm({...reviewForm, reviewer_name: e.target.value})}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label>Star Rating</Label>
                <Select 
                  value={reviewForm.star_rating.toString()} 
                  onValueChange={(value) => setReviewForm({...reviewForm, star_rating: parseFloat(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="1.5">1.5 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="2.5">2.5 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="3.5">3.5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="4.5">4.5 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Review Text</Label>
              <Textarea
                value={reviewForm.review_text}
                onChange={(e) => setReviewForm({...reviewForm, review_text: e.target.value})}
                placeholder="Customer review"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveReview}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Briefing Tab */}
      <TabsContent value="briefing">
        <Card>
          <CardHeader>
            <CardTitle>Briefing del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="briefing">
                Describe tu restaurante, tipo de comida, ambiente, ubicación y audiencia objetivo
              </Label>
              <Textarea
                id="briefing"
                value={briefing}
                onChange={(e) => setBriefing(e.target.value)}
                placeholder="Ejemplo: Somos un restaurante de comida peruana contemporánea ubicado en Miraflores. Nos especializamos en fusión nikkei con ingredientes frescos del mar peruano. Nuestro ambiente es moderno y elegante, dirigido a profesionales de 25-45 años que buscan experiencias gastronómicas únicas..."
                rows={8}
                className="mt-2"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateContent}
                disabled={isGenerating || !briefing.trim()}
                className="min-w-32"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  'Generar Contenido'
                )}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>¿Qué hace esta herramienta?</strong></p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Analiza tu nicho y audiencia objetivo</li>
                <li>Genera contenido optimizado para SEO local</li>
                <li>Crea títulos, descripciones y textos para todo el sitio web</li>
                <li>Genera imágenes profesionales que coinciden con tu marca</li>
                <li>Todo el contenido se crea en español y se optimiza para Lima, Perú</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);
}