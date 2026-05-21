import { supabase, isSupabaseConfigured } from '../supabase'

export async function uploadImage(file: File, bucket = 'article-images'): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) { console.error(error); return null }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadSiteAsset(file: File): Promise<string | null> {
  return uploadImage(file, 'site-assets')
}
