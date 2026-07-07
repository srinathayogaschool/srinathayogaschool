'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface SyncState {
  productsVersion: number
  workshopsVersion: number
  announcementsVersion: number
  ordersVersion: number
  favoritesVersion: number
  teachersVersion: number
  bannersVersion: number
  mediaVersion: number
  leadsVersion: number
  inventoryLogVersion: number
  waitlistVersion: number
}

const initialSync: SyncState = {
  productsVersion: 0,
  workshopsVersion: 0,
  announcementsVersion: 0,
  ordersVersion: 0,
  favoritesVersion: 0,
  teachersVersion: 0,
  bannersVersion: 0,
  mediaVersion: 0,
  leadsVersion: 0,
  inventoryLogVersion: 0,
  waitlistVersion: 0,
}

const SyncContext = createContext<SyncState>(initialSync)

export function RealtimeSync({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<SyncState>(initialSync)

  const bumpVersion = useCallback((key: keyof SyncState) => {
    setVersions(prev => ({ ...prev, [key]: prev[key] + 1 }))
  }, [])

  useEffect(() => {
    const sb = createBrowserClient()
    const channels: RealtimeChannel[] = []

    const tables = [
      { name: 'products', key: 'productsVersion' as const },
      { name: 'workshops', key: 'workshopsVersion' as const },
      { name: 'announcements', key: 'announcementsVersion' as const },
      { name: 'orders', key: 'ordersVersion' as const },
      { name: 'favorites', key: 'favoritesVersion' as const },
      { name: 'teachers', key: 'teachersVersion' as const },
      { name: 'banners', key: 'bannersVersion' as const },
      { name: 'media', key: 'mediaVersion' as const },
      { name: 'leads', key: 'leadsVersion' as const },
      { name: 'inventory_log', key: 'inventoryLogVersion' as const },
      { name: 'waitlist', key: 'waitlistVersion' as const },
    ]

    for (const { name, key } of tables) {
      const channel = sb
        .channel(`global-${name}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: name }, () => {
          bumpVersion(key)
        })
        .subscribe()
      channels.push(channel)
    }

    return () => {
      for (const channel of channels) {
        channel.unsubscribe()
      }
    }
  }, [bumpVersion])

  return (
    <SyncContext.Provider value={versions}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSyncVersion(key: keyof SyncState) {
  const versions = useContext(SyncContext)
  return versions[key]
}

export function useRealtimeData<T>(
  fetcher: () => Promise<T[]>,
  versionKey: keyof SyncState
): { data: T[]; loading: boolean } {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const version = useSyncVersion(versionKey)
  const fetchedRef = useRef(false)

  useEffect(() => {
    fetcher()
      .then(result => {
        setData(result)
        setLoading(false)
        fetchedRef.current = true
      })
      .catch(() => setLoading(false))
  }, [version]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading }
}
