import { createBrowserClient } from './supabase'
import type { Database } from './supabase-types'
import type { Course as AppCourse, Workshop as AppWorkshop, Product as AppProduct, Category as AppCategory, Announcement as AppAnnouncement } from './app-data'
import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Course = Tables['courses']['Row']
type Lesson = Tables['lessons']['Row']
type Product = Tables['products']['Row']
type Workshop = Tables['workshops']['Row']
type Category = Tables['categories']['Row']
type Enrollment = Tables['enrollments']['Row']
type LessonProgress = Tables['lesson_progress']['Row']
type WorkshopRegistration = Tables['workshop_registrations']['Row']
type SavedItem = Tables['saved_items']['Row']
type WishlistItem = Tables['wishlist_items']['Row']
type Notification = Tables['notifications']['Row']
type Order = Tables['orders']['Row']
type OrderItem = Tables['order_items']['Row']
type TTCResource = Tables['ttc_resources']['Row']
type TTCEnrollment = Tables['ttc_enrollments']['Row']
type Announcement = Tables['announcements']['Row']
type Favorite = Tables['favorites']['Row']
type Teacher = Tables['teachers']['Row']
type InventoryLog = Tables['inventory_log']['Row']
type Media = Tables['media']['Row']
type Banner = Tables['banners']['Row']
type AuditLog = Tables['audit_logs']['Row']
type Lead = Tables['leads']['Row']
type WaitlistEntry = Tables['waitlist']['Row']

function sb() {
  return createBrowserClient()
}

// Profiles
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await sb().from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await sb().from('profiles').update(updates).eq('id', userId)
  return { error }
}

// Courses
export async function getCourses(): Promise<Course[]> {
  const { data } = await sb().from('courses').select('*').eq('published', true).order('created_at', { ascending: false })
  return data ?? []
}

export async function getCourse(id: string): Promise<Course | null> {
  const { data } = await sb().from('courses').select('*').eq('id', id).single()
  return data
}

export async function getCoursesByCategory(slug: string): Promise<Course[]> {
  const { data } = await sb()
    .from('courses')
    .select('*, categories!inner(slug)')
    .eq('published', true)
    .eq('categories.slug', slug)
    .order('created_at', { ascending: false })
  return data ?? []
}

// Lessons
export async function getLessons(courseId: string): Promise<Lesson[]> {
  const { data } = await sb()
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })
  return data ?? []
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const { data } = await sb().from('lessons').select('*').eq('id', id).single()
  return data
}

// Products
export async function getProducts(): Promise<Product[]> {
  const { data } = await sb().from('products').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data } = await sb().from('products').select('*').eq('id', id).single()
  return data
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const { data } = await sb()
    .from('products')
    .select('*, categories!inner(slug)')
    .eq('categories.slug', slug)
    .order('created_at', { ascending: false })
  return data ?? []
}

// Workshops
export async function getWorkshops(): Promise<Workshop[]> {
  const { data } = await sb().from('workshops').select('*').order('start_date', { ascending: true })
  return data ?? []
}

export async function getWorkshop(id: string): Promise<Workshop | null> {
  const { data } = await sb().from('workshops').select('*').eq('id', id).single()
  return data
}

export async function getUpcomingWorkshops(): Promise<Workshop[]> {
  const { data } = await sb()
    .from('workshops')
    .select('*')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
  return data ?? []
}

// Categories
export async function getCategories(type?: 'course' | 'product' | 'workshop'): Promise<Category[]> {
  let query = sb().from('categories').select('*').order('name')
  if (type) query = query.eq('type', type)
  const { data } = await query
  return data ?? []
}

// Enrollments
export async function getEnrollments(userId: string): Promise<Enrollment[]> {
  const { data } = await sb().from('enrollments').select('*').eq('user_id', userId).order('started_at', { ascending: false })
  return data ?? []
}

export async function getEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
  const { data } = await sb()
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
  return data
}

export async function enrollInCourse(userId: string, courseId: string) {
  const { error } = await sb().from('enrollments').insert({ user_id: userId, course_id: courseId })
  return { error }
}

// Lesson Progress
export async function getLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
  const { data } = await sb()
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
  return data ?? []
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  courseId: string,
  updates: { watched_seconds?: number; completed?: boolean }
) {
  const existing = await sb()
    .from('lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (existing.data) {
    return sb().from('lesson_progress').update(updates).eq('id', existing.data.id)
  }

  return sb().from('lesson_progress').insert({
    user_id: userId,
    lesson_id: lessonId,
    course_id: courseId,
    watched_seconds: updates.watched_seconds ?? 0,
    completed: updates.completed ?? false,
  })
}

// Workshop Registrations
export async function registerForWorkshop(userId: string, workshopId: string) {
  const { error } = await sb().from('workshop_registrations').insert({ user_id: userId, workshop_id: workshopId })
  return { error }
}

export async function getWorkshopRegistrations(userId: string): Promise<WorkshopRegistration[]> {
  const { data } = await sb()
    .from('workshop_registrations')
    .select('*')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })
  return data ?? []
}

// Saved Items
export async function getSavedItems(userId: string): Promise<SavedItem[]> {
  const { data } = await sb().from('saved_items').select('*').eq('user_id', userId)
  return data ?? []
}

export async function saveItem(userId: string, itemType: SavedItem['item_type'], itemId: string) {
  const { error } = await sb().from('saved_items').insert({ user_id: userId, item_type: itemType, item_id: itemId })
  return { error }
}

export async function unsaveItem(userId: string, itemType: SavedItem['item_type'], itemId: string) {
  const { error } = await sb()
    .from('saved_items')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
  return { error }
}

export async function isSaved(userId: string, itemType: SavedItem['item_type'], itemId: string): Promise<boolean> {
  const { data } = await sb()
    .from('saved_items')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .single()
  return !!data
}

// Wishlist
export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const { data } = await sb().from('wishlist_items').select('*').eq('user_id', userId)
  return data ?? []
}

export async function addToWishlist(userId: string, productId: string) {
  const { error } = await sb().from('wishlist_items').insert({ user_id: userId, product_id: productId })
  return { error }
}

export async function removeFromWishlist(userId: string, productId: string) {
  const { error } = await sb().from('wishlist_items').delete().eq('user_id', userId).eq('product_id', productId)
  return { error }
}

// Notifications
export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data } = await sb()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function markNotificationRead(id: string) {
  const { error } = await sb().from('notifications').update({ read: true }).eq('id', id)
  return { error }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await sb()
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  return count ?? 0
}

// Orders
export async function getOrders(userId: string): Promise<(Order & { items?: OrderItem[] })[]> {
  const { data: orders } = await sb()
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!orders) return []

  const orderIds = orders.map((o: any) => o.id)
  const { data: allItems } = await sb()
    .from('order_items')
    .select('*, courses(title), products(title), workshops(title)')
    .in('order_id', orderIds)

  const itemsByOrder: Record<string, (OrderItem & { itemTitle?: string })[]> = {}
  if (allItems) {
    for (const item of allItems) {
      const itemTitle = item.courses?.title || item.products?.title || item.workshops?.title || ''
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
      itemsByOrder[item.order_id].push({ ...item, itemTitle } as OrderItem & { itemTitle?: string })
    }
  }

  return orders.map(order => ({
    ...order,
    items: itemsByOrder[order.id] ?? [],
  }))
}

// TTC Resources
export async function getTTCResources(): Promise<TTCResource[]> {
  const { data } = await sb().from('ttc_resources').select('*').order('created_at', { ascending: false })
  return data ?? []
}

// TTC Enrollments
export async function getTTCEnrollments(userId: string): Promise<TTCEnrollment[]> {
  const { data } = await sb()
    .from('ttc_enrollments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function submitTTCEnrollment(enrollment: Omit<TTCEnrollment, 'id' | 'created_at'>) {
  const { error } = await sb().from('ttc_enrollments').insert(enrollment)
  return { error }
}

// ─── Cached fetch functions (transform DB types → App types) ───
// Cache TTL: 60 seconds — data auto-refreshes after admin edits in Supabase

const CACHE_TTL = 60_000

type CacheEntry<T> = { data: T; ts: number }

let _coursesCache: CacheEntry<AppCourse[]> | null = null
let _productsCache: CacheEntry<AppProduct[]> | null = null
let _workshopsCache: CacheEntry<AppWorkshop[]> | null = null
let _categoriesCache: CacheEntry<AppCategory[]> | null = null
let _announcementsCache: CacheEntry<AppAnnouncement[]> | null = null

function isCacheFresh(entry: CacheEntry<unknown> | null): boolean {
  return entry !== null && Date.now() - entry.ts < CACHE_TTL
}

function mapCourse(c: Course, catMap: Record<string, string>): AppCourse {
  const catSlug = Object.entries(catMap).find(([, id]) => id === c.category_id)?.[0] ?? ''
  return {
    id: c.id, title: c.title, subtitle: c.subtitle, description: c.description,
    image: c.image, duration: c.duration, lessons: c.lessons_count, level: c.level,
    category: catSlug, price: c.price, instructor: c.instructor, instructorImage: c.instructor_image ?? '',
    rating: c.rating, reviews: c.reviews_count, progress: undefined, isPurchased: false, isSaved: false,
    certificateEligible: c.certificate_eligible,
  }
}

function mapProduct(p: Product): AppProduct {
  return {
    id: p.id, title: p.title, description: p.description, image: p.image, price: p.price,
    originalPrice: p.original_price, category: '', rating: p.rating, reviews: p.reviews_count, inStock: p.in_stock,
  }
}

function mapWorkshop(w: Workshop): AppWorkshop {
  return {
    id: w.id, title: w.title, description: w.description, image: w.image,
    startDate: new Date(w.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    duration: w.duration, language: w.language, price: w.price, startsIn: w.starts_in,
    instructor: w.instructor, format: w.format,
  }
}

export async function fetchCourses(): Promise<AppCourse[]> {
  if (isCacheFresh(_coursesCache)) return _coursesCache!.data
  const [courses, cats] = await Promise.all([getCourses(), getCategories('course')])
  const catMap: Record<string, string> = {}
  for (const c of cats) catMap[c.slug] = c.id
  _coursesCache = { data: courses.map(c => mapCourse(c, catMap)), ts: Date.now() }
  return _coursesCache.data
}

export async function fetchProducts(): Promise<AppProduct[]> {
  if (isCacheFresh(_productsCache)) return _productsCache!.data
  const [products, cats] = await Promise.all([getProducts(), getCategories('product')])
  const catMap: Record<string, string> = {}
  for (const c of cats) catMap[c.slug] = c.id
  _productsCache = {
    data: products.map(p => {
      const catSlug = Object.entries(catMap).find(([, id]) => id === p.category_id)?.[0] ?? ''
      return { ...mapProduct(p), category: catSlug }
    }),
    ts: Date.now(),
  }
  return _productsCache.data
}

export async function fetchWorkshops(): Promise<AppWorkshop[]> {
  if (isCacheFresh(_workshopsCache)) return _workshopsCache!.data
  _workshopsCache = { data: (await getWorkshops()).map(mapWorkshop), ts: Date.now() }
  return _workshopsCache.data
}

export async function fetchCategories(): Promise<AppCategory[]> {
  if (isCacheFresh(_categoriesCache)) return _categoriesCache!.data
  _categoriesCache = { data: (await getCategories()).map(c => ({ id: c.slug, label: c.name })), ts: Date.now() }
  return _categoriesCache.data
}

export function clearCache() {
  _coursesCache = null
  _productsCache = null
  _workshopsCache = null
  _categoriesCache = null
  _announcementsCache = null
}

// ─── Announcements ───
export async function fetchAnnouncements(): Promise<AppAnnouncement[]> {
  if (isCacheFresh(_announcementsCache)) return _announcementsCache!.data
  const data = await getAnnouncements()
  _announcementsCache = { data, ts: Date.now() }
  return _announcementsCache.data
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data } = await sb()
    .from('announcements')
    .select('*')
    .eq('active', true)
    .order('date', { ascending: false })
  return data ?? []
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const { data } = await sb().from('announcements').select('*').eq('id', id).single()
  return data
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>) {
  const { error } = await sb().from('announcements').insert(announcement)
  return { error }
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>) {
  const { error } = await sb().from('announcements').update(updates).eq('id', id)
  return { error }
}

export async function deleteAnnouncement(id: string) {
  const { error } = await sb().from('announcements').delete().eq('id', id)
  return { error }
}

// ─── Favorites ───
export async function getFavorites(userId: string): Promise<(Favorite & { products?: Product })[]> {
  const { data } = await sb()
    .from('favorites')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function addFavorite(userId: string, productId: string) {
  const { error } = await sb().from('favorites').insert({ user_id: userId, product_id: productId })
  return { error }
}

export async function removeFavorite(userId: string, productId: string) {
  const { error } = await sb().from('favorites').delete().eq('user_id', userId).eq('product_id', productId)
  return { error }
}

export async function isFavorite(userId: string, productId: string): Promise<boolean> {
  const { data } = await sb()
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()
  return !!data
}

export async function getFavoriteCount(productId: string): Promise<number> {
  const { count } = await sb()
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
  return count ?? 0
}

// ─── Teachers ───
export async function getTeachers(): Promise<Teacher[]> {
  const { data } = await sb()
    .from('teachers')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getTeacher(id: string): Promise<Teacher | null> {
  const { data } = await sb().from('teachers').select('*').eq('id', id).single()
  return data
}

export async function createTeacher(teacher: Omit<Teacher, 'id' | 'created_at'>) {
  const { error } = await sb().from('teachers').insert(teacher)
  return { error }
}

export async function updateTeacher(id: string, updates: Partial<Teacher>) {
  const { error } = await sb().from('teachers').update(updates).eq('id', id)
  return { error }
}

export async function deleteTeacher(id: string) {
  const { error } = await sb().from('teachers').delete().eq('id', id)
  return { error }
}

// ─── Products (Admin) ───
export async function createProduct(product: Omit<Product, 'id' | 'created_at'>) {
  const { error } = await sb().from('products').insert(product)
  return { error }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { error } = await sb().from('products').update(updates).eq('id', id)
  return { error }
}

export async function deleteProduct(id: string) {
  const { error } = await sb().from('products').delete().eq('id', id)
  return { error }
}

// ─── Workshops (Admin) ───
export async function createWorkshop(workshop: Omit<Workshop, 'id' | 'created_at'>) {
  const { error } = await sb().from('workshops').insert(workshop)
  return { error }
}

export async function updateWorkshop(id: string, updates: Partial<Workshop>) {
  const { error } = await sb().from('workshops').update(updates).eq('id', id)
  return { error }
}

export async function deleteWorkshop(id: string) {
  const { error } = await sb().from('workshops').delete().eq('id', id)
  return { error }
}

// ─── Orders (Admin) ───
export async function getAllOrders(): Promise<(Order & { profiles?: Profile; items?: OrderItem[] })[]> {
  const { data: orders } = await sb()
    .from('orders')
    .select('*, profiles(name, email, phone)')
    .order('created_at', { ascending: false })

  if (!orders) return []

  const orderIds = orders.map((o: any) => o.id)
  const { data: allItems } = await sb()
    .from('order_items')
    .select('*, products(title), courses(title), workshops(title)')
    .in('order_id', orderIds)

  const itemsByOrder: Record<string, any[]> = {}
  if (allItems) {
    for (const item of allItems) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
      itemsByOrder[item.order_id].push(item)
    }
  }

  return orders.map(order => ({
    ...order,
    items: itemsByOrder[order.id] ?? [],
  }))
}

export async function updateOrderStatus(id: string, status: Order['order_status']) {
  const { error } = await sb().from('orders').update({ order_status: status }).eq('id', id)
  return { error }
}

// ─── Teacher Workshops ───
export async function getTeacherWorkshops(teacherId: string): Promise<(Workshop & { registrations_count?: number })[]> {
  const { data } = await sb()
    .from('workshops')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('start_date', { ascending: true })
  if (!data) return []
  const workshopIds = data.map(w => w.id)
  const { data: counts } = await sb()
    .from('workshop_registrations')
    .select('workshop_id')
    .in('workshop_id', workshopIds)
  const regCounts: Record<string, number> = {}
  if (counts) {
    for (const r of counts) {
      regCounts[r.workshop_id] = (regCounts[r.workshop_id] || 0) + 1
    }
  }
  return data.map(w => ({ ...w, registrations_count: regCounts[w.id] || 0 }))
}

export async function getWorkshopRegistrationsForTeacher(workshopId: string): Promise<(WorkshopRegistration & { profiles?: Profile })[]> {
  const { data } = await sb()
    .from('workshop_registrations')
    .select('*, profiles(name, email, phone, avatar_url)')
    .eq('workshop_id', workshopId)
    .order('registered_at', { ascending: false })
  return data ?? []
}

export async function markAttendance(registrationId: string, status: WorkshopRegistration['status']) {
  const { error } = await sb()
    .from('workshop_registrations')
    .update({ status })
    .eq('id', registrationId)
  return { error }
}

// ─── Users (Admin) ───
export async function getAllUsers(): Promise<Profile[]> {
  const { data } = await sb()
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

// ─── Inventory Log ───
export async function getInventoryLogs(productId: string): Promise<InventoryLog[]> {
  const { data } = await sb()
    .from('inventory_log')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createInventoryLog(log: Omit<InventoryLog, 'id' | 'created_at'>) {
  const { error } = await sb().from('inventory_log').insert(log)
  return { error }
}

export async function getLowStockProducts(): Promise<Product[]> {
  const { data } = await sb()
    .from('products')
    .select('*')
    .gt('stock', 0)
    .lte('stock', 5)
    .order('stock', { ascending: true })
  return data ?? []
}

export async function getOutOfStockProducts(): Promise<Product[]> {
  const { data } = await sb()
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('in_stock', false)
    .order('title')
  return data ?? []
}

// ─── Search & Filter ───
export async function searchProducts(params: {
  query?: string
  category?: string
  tag?: string
  featured?: boolean
  minPrice?: number
  maxPrice?: number
}): Promise<Product[]> {
  let query = sb().from('products').select('*').eq('active', true)

  if (params.query) {
    query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,tags.cs.{${params.query}}`)
  }
  if (params.category) {
    query = query.eq('category_id', params.category)
  }
  if (params.featured !== undefined) {
    query = query.eq('featured', params.featured)
  }
  if (params.minPrice !== undefined) {
    query = query.gte('price', params.minPrice)
  }
  if (params.maxPrice !== undefined) {
    query = query.lte('price', params.maxPrice)
  }

  const { data } = await query.order('created_at', { ascending: false })
  return data ?? []
}

// ─── Waitlist ───
export async function joinWaitlist(userId: string, workshopId: string) {
  const { error } = await sb().from('waitlist').insert({ user_id: userId, workshop_id: workshopId })
  return { error }
}

export async function getWaitlist(workshopId: string): Promise<(WaitlistEntry & { profiles?: Profile })[]> {
  const { data } = await sb()
    .from('waitlist')
    .select('*, profiles(name, email)')
    .eq('workshop_id', workshopId)
    .eq('notified', false)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function markWaitlistNotified(id: string) {
  const { error } = await sb().from('waitlist').update({ notified: true }).eq('id', id)
  return { error }
}

export async function isOnWaitlist(userId: string, workshopId: string): Promise<boolean> {
  const { data } = await sb()
    .from('waitlist')
    .select('id')
    .eq('user_id', userId)
    .eq('workshop_id', workshopId)
    .maybeSingle()
  return !!data
}

// ─── Media Library ───
export async function getMedia(): Promise<Media[]> {
  const { data } = await sb().from('media').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function createMedia(media: Omit<Media, 'id' | 'created_at'>) {
  const { error } = await sb().from('media').insert(media)
  return { error }
}

export async function deleteMedia(id: string) {
  const { error } = await sb().from('media').delete().eq('id', id)
  return { error }
}

// ─── Banners ───
export async function getBanners(): Promise<Banner[]> {
  const { data } = await sb()
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getAllBanners(): Promise<Banner[]> {
  const { data } = await sb().from('banners').select('*').order('sort_order', { ascending: true })
  return data ?? []
}

export async function createBanner(banner: Omit<Banner, 'id' | 'created_at'>) {
  const { error } = await sb().from('banners').insert(banner)
  return { error }
}

export async function updateBanner(id: string, updates: Partial<Banner>) {
  const { error } = await sb().from('banners').update(updates).eq('id', id)
  return { error }
}

export async function deleteBanner(id: string) {
  const { error } = await sb().from('banners').delete().eq('id', id)
  return { error }
}

// ─── Audit Logs ───
export async function getAuditLogs(): Promise<(AuditLog & { profiles?: Profile })[]> {
  const { data } = await sb()
    .from('audit_logs')
    .select('*, profiles(name, email)')
    .order('created_at', { ascending: false })
    .limit(100)
  return data ?? []
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
  const { error } = await sb().from('audit_logs').insert(log)
  return { error }
}

// ─── Leads (CRM) ───
export async function getLeads(): Promise<Lead[]> {
  const { data } = await sb()
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const { error } = await sb().from('leads').update(updates).eq('id', id)
  return { error }
}

// ─── Analytics ───
export async function getOrderStats() {
  const { data: orders } = await sb().from('orders').select('total, order_status, created_at')
  if (!orders) return { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
  const completed = orders.filter(o => o.order_status === 'completed')
  return {
    totalOrders: orders.length,
    totalRevenue: completed.reduce((sum, o) => sum + Number(o.total), 0),
    avgOrderValue: completed.length > 0
      ? completed.reduce((sum, o) => sum + Number(o.total), 0) / completed.length
      : 0,
  }
}

export async function getProductSales(): Promise<{ title: string; count: number; revenue: number }[]> {
  const { data } = await sb()
    .from('order_items')
    .select('*, products!inner(title), orders!inner(order_status)')
    .eq('orders.order_status', 'completed')
  if (!data) return []
  const sales: Record<string, { count: number; revenue: number }> = {}
  for (const item of data) {
    const title = (item as any).products?.title || 'Unknown'
    if (!sales[title]) sales[title] = { count: 0, revenue: 0 }
    sales[title].count += item.quantity || 1
    sales[title].revenue += Number(item.price)
  }
  return Object.entries(sales)
    .map(([title, stats]) => ({ title, ...stats }))
    .sort((a, b) => b.count - a.count)
}

export async function getWorkshopAnalytics() {
  const { data: workshops } = await sb().from('workshops').select('id, title, seat_limit')
  const { data: registrations } = await sb().from('workshop_registrations').select('workshop_id, status')
  if (!workshops) return { totalWorkshops: 0, totalRegistrations: 0, popular: [], attendanceRate: 0 }
  const regsByWorkshop: Record<string, { total: number; attended: number }> = {}
  let totalRegs = 0
  let totalAttended = 0
  for (const r of registrations || []) {
    if (!regsByWorkshop[r.workshop_id]) regsByWorkshop[r.workshop_id] = { total: 0, attended: 0 }
    regsByWorkshop[r.workshop_id].total++
    totalRegs++
    if (r.status === 'attended') {
      regsByWorkshop[r.workshop_id].attended++
      totalAttended++
    }
  }
  const popular = workshops
    .map(w => ({
      title: w.title,
      registrations: regsByWorkshop[w.id]?.total || 0,
      capacity: w.seat_limit,
    }))
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 5)
  return {
    totalWorkshops: workshops.length,
    totalRegistrations: totalRegs,
    attendanceRate: totalRegs > 0 ? Math.round((totalAttended / totalRegs) * 100) : 0,
    popular,
  }
}

export async function getUserAnalytics() {
  const { data: profiles } = await sb().from('profiles').select('role, created_at')
  if (!profiles) return { totalUsers: 0, admins: 0, teachers: 0, students: 0 }
  return {
    totalUsers: profiles.length,
    admins: profiles.filter(p => p.role === 'admin').length,
    teachers: profiles.filter(p => p.role === 'teacher').length,
    students: profiles.filter(p => p.role === 'student').length,
  }
}

// ─── CSV Export Data ───
export async function exportUsersCSV(): Promise<string> {
  const { data } = await sb().from('profiles').select('*').order('created_at', { ascending: false })
  if (!data) return 'No data'
  const headers = 'Name,Email,Phone,Role,Created'
  const rows = data.map(p => `"${p.name}","${p.email}","${p.phone || ''}","${p.role}","${p.created_at}"`)
  return [headers, ...rows].join('\n')
}

export async function exportOrdersCSV(): Promise<string> {
  const { data: orders } = await sb()
    .from('orders')
    .select('*, profiles(name, email)')
    .order('created_at', { ascending: false })
  if (!orders) return 'No data'
  const headers = 'Order #,Customer,Email,Total,Status,Payment,Created'
  const rows = orders.map(o =>
    `"${o.order_number || ''}","${(o as any).profiles?.name || ''}","${(o as any).profiles?.email || ''}",${o.total},"${o.order_status}","${o.payment_status}","${o.created_at}"`
  )
  return [headers, ...rows].join('\n')
}

export async function exportProductsCSV(): Promise<string> {
  const { data } = await sb().from('products').select('*').order('title')
  if (!data) return 'No data'
  const headers = 'Title,SKU,Price,Stock,Featured,Active'
  const rows = data.map(p =>
    `"${p.title}","${p.sku || ''}",${p.price},${p.stock},${p.featured},${p.active}`
  )
  return [headers, ...rows].join('\n')
}

export async function exportLeadsCSV(): Promise<string> {
  const { data } = await sb().from('leads').select('*').order('created_at', { ascending: false })
  if (!data) return 'No data'
  const headers = 'Name,Email,Phone,Subject,Message,Followed Up,Created'
  const rows = data.map(l =>
    `"${l.name}","${l.email}","${l.phone || ''}","${l.subject || ''}","${l.message.replace(/"/g, '""')}",${l.followed_up},"${l.created_at}"`
  )
  return [headers, ...rows].join('\n')
}

// ─── Admin Functions ───
export async function getAllCourses(): Promise<Course[]> {
  const { data } = await sb().from('courses').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function getCourseAnalytics(): Promise<{ title: string; enrollments: number; revenue: number; completionRate: number }[]> {
  const { data: courses } = await sb().from('courses').select('*')
  const { data: enrollments } = await sb().from('enrollments').select('course_id, progress')
  if (!courses || !enrollments) return []
  const enrollMap = new Map<string, { count: number; totalProgress: number }>()
  for (const e of enrollments) {
    const existing = enrollMap.get(e.course_id) || { count: 0, totalProgress: 0 }
    existing.count++
    existing.totalProgress += e.progress
    enrollMap.set(e.course_id, existing)
  }
  return courses.map(c => {
    const stats = enrollMap.get(c.id) || { count: 0, totalProgress: 0 }
    return {
      title: c.title,
      enrollments: stats.count,
      revenue: stats.count * Number(c.price),
      completionRate: stats.count > 0 ? Math.round(stats.totalProgress / stats.count) : 0,
    }
  })
}

// ─── Realtime Subscriptions ───
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) {
  return sb()
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event, schema: 'public', table },
      (payload) => callback(payload)
    )
    .subscribe()
}

export function subscribeToAnnouncements(callback: (payload: any) => void) {
  return subscribeToTable('announcements', callback)
}

export function subscribeToProducts(callback: (payload: any) => void) {
  return subscribeToTable('products', callback)
}

export function subscribeToWorkshops(callback: (payload: any) => void) {
  return subscribeToTable('workshops', callback)
}

export function subscribeToOrders(callback: (payload: any) => void) {
  return subscribeToTable('orders', callback)
}

export function subscribeToFavorites(userId: string, callback: (payload: any) => void) {
  return sb()
    .channel(`favorites-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload)
    )
    .subscribe()
}

type RealtimeCallback = (payload: any) => void

const activeSubscriptions = new Map<string, RealtimeChannel>()

export function useRealtimeSubscription(
  table: string,
  callback: RealtimeCallback,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  filter?: string
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const key = `${table}-${event}-${filter || 'all'}`
    if (activeSubscriptions.has(key)) return

    const channel = sb()
      .channel(key)
      .on(
        'postgres_changes',
        { event, schema: 'public', table, filter },
        (payload) => callbackRef.current(payload)
      )
      .subscribe()

    activeSubscriptions.set(key, channel)

    return () => {
      channel.unsubscribe()
      activeSubscriptions.delete(key)
    }
  }, [table, event, filter])
}

export function useRealtimeAnnouncements(callback: RealtimeCallback) {
  useRealtimeSubscription('announcements', callback)
}

export function useRealtimeProducts(callback: RealtimeCallback) {
  useRealtimeSubscription('products', callback)
}

export function useRealtimeWorkshops(callback: RealtimeCallback) {
  useRealtimeSubscription('workshops', callback)
}
