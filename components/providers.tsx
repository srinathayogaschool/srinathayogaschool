'use client'

import { Suspense, ReactNode } from 'react'
import { CartProvider } from '@/components/cart/cart-context'
import { AuthProvider } from '@/components/auth-provider'
import { RealtimeSync } from '@/components/realtime-sync'
import { FavoritesProvider } from '@/components/favorites-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <RealtimeSync>
          <FavoritesProvider>
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </FavoritesProvider>
        </RealtimeSync>
      </CartProvider>
    </AuthProvider>
  )
}
