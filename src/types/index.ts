export type AccountType = 'user' | 'vendor'

export interface AuthUser {
  uuid: string
  name: string
  email: string
  phone: string
  account_type: AccountType
}

export interface SignInResponse {
  status: boolean
  message: string
  data: AuthUser
  jwt_token: string
  jwt_expiry: number
  jwt_refresh: string
  jwt_refresh_exp: number
}

export interface SignUpResponse {
  status: boolean
  message: string
  otp_uuid?: string
  email_verification_uuid?: string
}

export interface OtpVerifyResponse {
  status: boolean
  message: string
  jwt_token?: string
  jwt_expiry?: number
  jwt_refresh?: string
  data?: AuthUser
}

export interface Product {
  product_uuid: string
  name: string
  price: number
  description: string
  images: string
  vendor_name: string
  vendor_photo: string
  vendor_uuid?: string
  category?: string
  stock?: number
}

export interface CartItem {
  product_uuid: string
  name: string
  price: number
  quantity: number
  images: string
  vendor_uuid: string
  vendor_name: string
  vendor_photo: string
}

export interface Vendor {
  uuid: string
  name: string
  email: string
  phone: string
  profile_photo: string
  address?: string
}

export interface Order {
  order_uuid: string
  status?: string
  created_at?: string
  total?: number
}

export interface Review {
  user_name: string
  rating: number
  review: string
  created_at?: string
}

export interface VendorProduct {
  product_uuid: string
  name: string
  price: number
  stock: number
  images?: string[]
  categories?: string[]
  description?: string
  created_at?: string
}

export interface IncomingOrder {
  order_uuid: string
  status: string
  created_at: string
  customer_name: string
  product_uuid: string
  quantity: number
  price: number
}

export interface VendorDashboardStats {
  orders: number
  revenue: number
  products: number
}

export interface VendorAnalytic {
  date: string
  revenue: number
}

export interface ChatMessage {
  id?: number
  order_uuid: string
  sender_uuid: string
  receiver_uuid: string
  message: string
  created_at: string
}
