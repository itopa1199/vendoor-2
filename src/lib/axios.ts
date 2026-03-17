import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

// All requests proxied through Next.js → zero CORS issues
// next.config.js: /vd-api/* → https://vendoor.ng/store/api/*
export const BASE_URL = '/vd-api'
export const ECOM_URL = '/vd-api/ecommerce'
export const VENDOR_URL = '/vd-api/vendor-commerce'

export const getToken = () => Cookies.get('vd_jwt') ?? null
export const getRefreshToken = () => Cookies.get('vd_refresh') ?? null
export const getExpiry = () => parseInt(Cookies.get('vd_expiry') ?? '0', 10)
export const getUserUuid = () => Cookies.get('vd_uuid') ?? null

export const saveTokens = (jwt: string, expiry: number, refresh: string, uuid: string) => {
  Cookies.set('vd_jwt', jwt, { expires: 7, sameSite: 'lax' })
  Cookies.set('vd_expiry', String(expiry), { expires: 7, sameSite: 'lax' })
  Cookies.set('vd_refresh', refresh, { expires: 30, sameSite: 'lax' })
  Cookies.set('vd_uuid', uuid, { expires: 30, sameSite: 'lax' })
}

export const clearTokens = () => {
  ['vd_jwt', 'vd_expiry', 'vd_refresh', 'vd_uuid'].forEach((k) => Cookies.remove(k))
}

let _refreshing: Promise<{ jwt_token: string; jwt_expiry: number } | null> | null = null

export async function refreshJwtToken() {
  const uuid = getUserUuid()
  const refresh = getRefreshToken()
  if (!uuid || !refresh) return null
  if (_refreshing) return _refreshing
  _refreshing = axios
    .post(`${BASE_URL}/refresh-jwt`, { uuid }, {
      headers: { Authorization: `Bearer ${refresh}`, 'Content-Type': 'application/json' },
    })
    .then((r) => {
      const { jwt_token, jwt_expiry } = r.data.data
      Cookies.set('vd_jwt', jwt_token, { expires: 7, sameSite: 'lax' })
      Cookies.set('vd_expiry', String(jwt_expiry), { expires: 7, sameSite: 'lax' })
      return { jwt_token, jwt_expiry } as { jwt_token: string; jwt_expiry: number }
    })
    .catch(() => null)
    .finally(() => { _refreshing = null })
  return _refreshing
}

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
  const expiry = getExpiry()
  const now = Math.floor(Date.now() / 1000)
  let token = getToken()
  if (expiry > 0 && expiry - now < 300 && token) {
    const fresh = await refreshJwtToken()
    if (fresh) token = fresh.jwt_token
  }
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

client.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const fresh = await refreshJwtToken()
      if (fresh) { orig.headers.Authorization = `Bearer ${fresh.jwt_token}`; return client(orig) }
      clearTokens()
    }
    return Promise.reject(err)
  }
)

export { client }
