// Type definitions for Closet Worthy

export interface Brand {
  id: string
  name: string
  website?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  body_area?: 'Top' | 'Bottom' | 'Footwear' | 'Accessory'
  created_at: string
}

export interface Subcategory {
  id: string
  name: string
  category_id?: string
  created_at: string
}

export interface Condition {
  id: string
  label: string
  score: number
  notes?: string
  created_at: string
}

export interface ClosetItem {
  id: string
  item_name: string
  brand_id?: string
  category_id?: string
  subcategory_id?: string
  condition_id?: string
  size?: string
  colour?: string
  purchase_price_cad?: number
  purchase_date?: string
  currency?: string
  brand_override_text?: string
  model_style_text?: string
  ai_item_recognition?: string
  ai_retail_price_raw?: string
  ai_resale_price_raw?: string
  retail_price_cad?: number
  resale_price_cad?: number
  estimated_resale_value_cad?: number
  ai_listing_description?: string
  ai_listing_title?: string
  status?: 'Keep' | 'Sell' | 'Donate'
  for_sale?: boolean
  sell_platforms?: string[]
  photo_urls?: string[]
  created_at: string
  updated_at: string
  
  // Joined data (when fetching with relations)
  brand?: Brand
  category?: Category
  subcategory?: Subcategory
  condition?: Condition
}

export interface ClosetItemWithRelations extends ClosetItem {
  brand: Brand
  category: Category
  subcategory: Subcategory
  condition: Condition
}

export interface DashboardMetrics {
  totalItems: number
  totalRetailValue: number
  totalResaleValue: number
  itemsToSell: number
  itemsToPhotograph: number
  itemsToPrice: number
}

export interface AIRecognitionResult {
  brand?: string
  itemType: string
  category: string
  subcategory?: string
  colour?: string
  fabric?: string
  gender?: string
  details?: string
}

export interface AIPricingResult {
  retailPrice: number
  resalePrice: number
}

export interface AIListingResult {
  title: string
  description: string
}
