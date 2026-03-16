// API client base service (already implemented in utils/request.ts)

// This file serves as the main export point for API services
export { default as requestClient } from '@/utils/request'

// Define ApiResponse locally to avoid circular imports
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}
