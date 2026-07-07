'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { addFavorite, removeFavorite, getFavorites } from '@/lib/supabase-queries'
import type { Database } from '@/lib/supabase-types'

type Product = Database['public']['Tables']['products']['Row']

interface FavoritesContextType {
  favoriteIds: Set<string>
  favoriteProducts: (Product | null)[]
  toggleFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: new Set(),
  favoriteProducts: [],
  toggleFavorite: async () => {},
  isFavorite: () => false,
  loading: true,
})

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [favoriteProducts, setFavoriteProducts] = useState<(Product | null)[]>([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set())
      setFavoriteProducts([])
      setLoading(false)
      return
    }
    const favs = await getFavorites(user.id)
    setFavoriteIds(new Set(favs.map(f => f.product_id)))
    setFavoriteProducts(favs.map(f => f.products || null))
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const toggleFavorite = async (productId: string) => {
    if (!user) return
    const isFav = favoriteIds.has(productId)
    if (isFav) {
      await removeFavorite(user.id, productId)
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(productId); return next })
    } else {
      await addFavorite(user.id, productId)
      setFavoriteIds(prev => new Set(prev).add(productId))
    }
    loadFavorites()
  }

  const isFavorite = (productId: string) => favoriteIds.has(productId)

  return (
    <FavoritesContext.Provider value={{ favoriteIds, favoriteProducts, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
