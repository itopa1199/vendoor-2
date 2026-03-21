import { client, BASE_URL, ECOM_URL, VENDOR_URL } from './axios'
import type {
  SignInResponse, SignUpResponse, OtpVerifyResponse, AccountType,
  VendorDashboardStats, VendorProduct, IncomingOrder, VendorAnalytic, ChatMessage,
} from '@/types'

const ecom = (body: Record<string, unknown>) => client.post('/ecommerce', body)
const vcom = (body: Record<string, unknown>) => client.post('/vendor-commerce', body)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signUp: (d: { name: string; email: string; phone: string; password: string; account_type: AccountType }) =>
    client.post<SignUpResponse>('/signup', d),

  signIn: (d: { email?: string; phone?: string; password: string; device_info?: string }) =>
    client.post<SignInResponse>('/signin', { ...d, version: 2 }),

  sendOtp: (email: string) => client.post('/send-otp', { email }),

  verifyOtp: (d: { otp: string; otp_uuid?: string; email?: string }) =>
    client.post<OtpVerifyResponse>('/verify-otp', d),

  forgotPassword: (email: string) => client.post('/forgot-password', { email }),

  resetPassword: (d: { token: string; password: string }) =>
    client.post('/reset-password', d),
}

export const profileApi = {
  update: (d: { name?: string; email?: string; phone?: string }) =>
    client.post('/update-profile', d),

  uploadImage: (image: string) =>
    client.post<{ status: boolean; imagePath: string }>('/upload-image', { image }),
}

// ── Buyer / Ecommerce ─────────────────────────────────────────────────────────
export const productsApi = {
  fetch: (p: { vendor_uuid?: string; category?: string; limit?: number; offset?: number }) =>
    ecom({ action: 'fetch_products', ...p }) as Promise<{ data: { status: boolean; products: import('@/types').Product[] } }>,

  view: (product_uuid: string) =>
    ecom({ action: 'view_product', product_uuid }) as Promise<{ data: { status: boolean; product: import('@/types').Product } }>,

  search: (query: string) =>
    ecom({ action: 'search', query }) as Promise<{ data: { status: boolean; products: import('@/types').Product[]; vendors: import('@/types').Vendor[] } }>,
}

export const vendorsApi = {
  browse: () => ecom({ action: 'browse_vendors' }) as Promise<{ data: { status: boolean; vendors: import('@/types').Vendor[] } }>,
  view: (vendor_uuid: string) => ecom({ action: 'view_vendor', vendor_uuid }) as Promise<{ data: { status: boolean; vendor: import('@/types').Vendor } }>,
}

export const cartApi = {
  get: () => ecom({ action: 'get_cart' }) as Promise<{ data: { status: boolean; cart: import('@/types').CartItem[] } }>,
  add: (product_uuid: string, quantity: number) => ecom({ action: 'add_to_cart', product_uuid, quantity }),
  update: (product_uuid: string, quantity: number) => ecom({ action: 'update_cart', product_uuid, quantity }),
  remove: (product_uuid: string) => ecom({ action: 'remove_from_cart', product_uuid }),
}

export const billingApi = {
  save: (billing_address: string) => ecom({ action: 'save_billing', billing_address }),
  get: () => ecom({ action: 'get_billing' }),
}

export const orderApi = {
  checkout: (payment_txn: string) =>
    ecom({ action: 'checkout', payment_txn }) as Promise<{ data: { status: boolean; message: string; order_uuid: string } }>,
  history: () => ecom({ action: 'order_history' }),
}

export const reviewsApi = {
  get: (product_uuid: string) =>
    ecom({ action: 'get_reviews', product_uuid }) as Promise<{ data: { status: boolean; reviews: import('@/types').Review[] } }>,
  leave: (d: { product_uuid: string; rating: number; review: string }) =>
    ecom({ action: 'leave_review', ...d }),
}

// ── Vendor-Commerce ───────────────────────────────────────────────────────────
export const vendorApi = {
  dashboard: () => vcom({ action: 'dashboard' }) as Promise<{ data: VendorDashboardStats & { status: boolean } }>,
  myProducts: () => vcom({ action: 'my_products' }) as Promise<{ data: { status: boolean; products: VendorProduct[] } }>,

  addProduct: (d: { name: string; description: string; price: number; stock: number; images: string[]; categories: string[] }) =>
    vcom({ action: 'add_product', ...d }) as Promise<{ data: { status: boolean; product_uuid: string } }>,

  editProduct: (d: { product_uuid: string; name?: string; description?: string; price?: number; stock?: number }) =>
    vcom({ action: 'edit_product', ...d }),

  deleteProduct: (product_uuid: string) => vcom({ action: 'delete_product', product_uuid }),

  incomingOrders: () => vcom({ action: 'incoming_orders' }) as Promise<{ data: { status: boolean; orders: IncomingOrder[] } }>,
  acceptOrder: (order_uuid: string) => vcom({ action: 'accept_order', order_uuid }),
  rejectOrder: (order_uuid: string) => vcom({ action: 'reject_order', order_uuid }),
  updateDelivery: (order_uuid: string, status: string) => vcom({ action: 'update_delivery', order_uuid, status }),

  analytics: () => vcom({ action: 'sales_analytics' }) as Promise<{ data: { status: boolean; analytics: VendorAnalytic[] } }>,
  earnings: () => vcom({ action: 'earnings' }) as Promise<{ data: { status: boolean; earnings: number } }>,
  withdraw: (amount: number) => vcom({ action: 'withdraw', amount }),

  updateStore: (d: { store_name?: string; store_description?: string; business_hours?: string }) =>
    vcom({ action: 'update_store', ...d }),

  submitVerification: (d: { business_name: string; business_category: string; document_url: string }) =>
    vcom({ action: 'submit_verification', ...d }),

  getChat: (order_uuid: string) => vcom({ action: 'get_chat', order_uuid }) as Promise<{ data: { status: boolean; messages: ChatMessage[] } }>,
  recentChats: () => vcom({ action: 'recent_chats' }) as Promise<{ data: { status: boolean; messages: ChatMessage[] } }>,
  sendMessage: (d: { order_uuid: string; receiver_uuid: string; sender_uuid: string; message: string }) =>
    vcom({ action: 'send_message', ...d }),
}
