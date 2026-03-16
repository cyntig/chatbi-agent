// Local storage utilities with type safety

export class StorageService {
  private prefix = 'chatbi_'

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(this.getKey(key), serialized)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key))
  }

  clear(): void {
    // Only remove items with our prefix
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  has(key: string): boolean {
    return localStorage.getItem(this.getKey(key)) !== null
  }
}

export const storage = new StorageService()

// Specific storage helpers
export const sessionStorage = {
  getCurrentSession(): string | null {
    return storage.get<string>('current_session')
  },
  setCurrentSession(sessionId: string): void {
    storage.set('current_session', sessionId)
  },
  clearCurrentSession(): void {
    storage.remove('current_session')
  },
}

export const preferenceStorage = {
  getPreferences() {
    return storage.get('user_preferences')
  },
  setPreferences(preferences: any): void {
    storage.set('user_preferences', preferences)
  },
}

export const cacheStorage = {
  get<T>(key: string, maxAge: number = 3600000): T | null {
    const cached = storage.get<{ data: T; timestamp: number }>(`cache_${key}`)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > maxAge
    if (isExpired) {
      this.remove(key)
      return null
    }

    return cached.data
  },

  set<T>(key: string, data: T): void {
    storage.set(`cache_${key}`, {
      data,
      timestamp: Date.now(),
    })
  },

  remove(key: string): void {
    storage.remove(`cache_${key}`)
  },

  clear(): void {
    // Clear all cache items
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith('chatbi_cache_')) {
        localStorage.removeItem(key)
      }
    })
  },
}
