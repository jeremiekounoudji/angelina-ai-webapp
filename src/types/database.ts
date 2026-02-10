export type CompanyType = 'restaurant' | 'retail' | 'service' | 'other'
export type UserRole = 'customer' | 'manager' | 'staff' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'trial'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'completed' | 'cancelled'
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
export type BillingInterval = 'monthly' | 'yearly'
export type WhatsAppInstanceStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface Company {
  id: string
  user_id: string
  owner_id?: string
  name: string
  type: CompanyType
  address?: string
  phone?: string
  email?: string
  description?: string
  policy?: string
  avatar_url?: string
  subscription_id?: string
  subscription_status?: SubscriptionStatus
  created_at: string
}

export interface User {
  id: string
  company_id?: string
  full_name?: string
  email?: string
  phone: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Product {
  id: string
  company_id: string
  name: string
  description?: string
  is_price_fixed: boolean
  price?: number
  min_price?: number
  max_price?: number
  stock_quantity: number
  image_url?: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  company_id?: string
  status: OrderStatus
  total_amount: number
  special_instructions?: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id?: string
  product_id?: string
  quantity: number
  price_each: number
  total_price: number
}

export interface Complaint {
  id: string
  user_id?: string
  order_id?: string
  company_id?: string
  complaint_text: string
  status?: ComplaintStatus
  created_at: string
  resolved_at?: string
}

export interface SubscriptionPlan {
  id: string
  title: string
  description: string
  price_monthly: number
  yearly_discount_percent: number
  token_allowance_monthly: number
  max_users: number
  max_products: number
  support_type: string
  has_dashboard: boolean
  estimated_chats: number
  can_buy_extra_tokens: boolean
  is_popular: boolean
  created_at: string
  features?: SubscriptionFeature[]
}

export interface SubscriptionFeature {
  id: string
  plan_id?: string
  feature: string
}

export interface Payment {
  id: string
  company_id?: string
  plan_id?: string
  amount: number
  currency: string
  payment_status: string
  provider?: string
  transaction_id?: string
  created_at: string
  plan?: SubscriptionPlan
}

export interface DataSchema {
  id: string
  created_at: string
  table_name: string
  schema: string
}

export interface TokenUsage {
  id: string
  company_id: string
  tokens_used: number
  tokens_purchased: number
  tokens_remaining: number
  usage_month: number
  usage_year: number
  created_at: string
  updated_at: string
}

export interface TokenPurchase {
  id: string
  company_id: string
  tokens_purchased: number
  amount_paid: number
  currency: string
  payment_status: string
  transaction_id?: string
  created_at: string
}

export interface Metrics {
  id: string
  company_id: string
  messages_sent_total: number
  messages_allowed_total: number
  products_created_total: number
  products_allowed_total: number
  users_created_total: number
  users_allowed_total: number
  prospects_contacted_total: number
  prospects_allowed_total: number
  tokens_used_current_month: number
  tokens_allowance_monthly: number
  tokens_purchased_total: number
  created_at: string
  updated_at: string
}

export interface WhatsAppInstance {
  id: string
  company_id: string
  instance_name: string
  instance_id?: string
  phone_number: string
  status: WhatsAppInstanceStatus
  pairing_code?: string
  qr_code?: string
  api_key?: string
  webhook_url?: string
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  max_users: number;
  max_products: number;
  current_users: number;
  current_products: number;
  can_add_users: boolean;
  can_add_products: boolean;
}

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at'>
        Update: Partial<Omit<Company, 'id' | 'created_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id'>
        Update: Partial<Omit<OrderItem, 'id'>>
      }
      complaints: {
        Row: Complaint
        Insert: Omit<Complaint, 'id' | 'created_at'>
        Update: Partial<Omit<Complaint, 'id' | 'created_at'>>
      }
      subscription_plans: {
        Row: SubscriptionPlan
        Insert: Omit<SubscriptionPlan, 'id' | 'created_at'>
        Update: Partial<Omit<SubscriptionPlan, 'id' | 'created_at'>>
      }
      subscription_features: {
        Row: SubscriptionFeature
        Insert: Omit<SubscriptionFeature, 'id'>
        Update: Partial<Omit<SubscriptionFeature, 'id'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
      }
      data_schema: {
        Row: DataSchema
        Insert: Omit<DataSchema, 'id' | 'created_at'>
        Update: Partial<Omit<DataSchema, 'id' | 'created_at'>>
      }
      token_usage: {
        Row: TokenUsage
        Insert: Omit<TokenUsage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TokenUsage, 'id' | 'created_at' | 'updated_at'>>
      }
      token_purchases: {
        Row: TokenPurchase
        Insert: Omit<TokenPurchase, 'id' | 'created_at'>
        Update: Partial<Omit<TokenPurchase, 'id' | 'created_at'>>
      }
      metrics: {
        Row: Metrics
        Insert: Omit<Metrics, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Metrics, 'id' | 'created_at' | 'updated_at'>>
      }
      whatsapp_instances: {
        Row: WhatsAppInstance
        Insert: Omit<WhatsAppInstance, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WhatsAppInstance, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}