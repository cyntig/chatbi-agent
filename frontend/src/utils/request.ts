// HTTP request wrapper with error handling and interceptors

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// Define ApiResponse locally to avoid circular imports
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

class RequestClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status
          switch (status) {
            case 401:
              // Unauthorized - redirect to login
              console.error('Unauthorized access')
              break
            case 403:
              console.error('Forbidden')
              break
            case 404:
              console.error('Resource not found')
              break
            case 500:
              console.error('Internal server error')
              break
            default:
              console.error('Request error:', error.message)
          }
        } else if (error.request) {
          // Request made but no response received
          console.error('No response received:', error.message)
        } else {
          // Error in request setup
          console.error('Request setup error:', error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config)
    return this.transformResponse<T>(response)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config)
    return this.transformResponse<T>(response)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config)
    return this.transformResponse<T>(response)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config)
    return this.transformResponse<T>(response)
  }

  private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
    }
  }

  // Stream request support
  async stream(url: string, data?: any): Promise<ReadableStream> {
    const response = await fetch(`${this.client.defaults.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.body!
  }
}

export const requestClient = new RequestClient()
export default requestClient
