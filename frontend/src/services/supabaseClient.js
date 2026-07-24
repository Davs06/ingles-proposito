import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://jbpbycrpystxfeqtpkqa.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicGJ5Y3JweXN0eGZlcXRwa3FhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDkwMjIzMCwiZXhwIjoyMTAwNDc4MjMwfQ.8CKa8UOnlr4sISjPZgkd40frdBLBB7j24CdWDFvwS3g';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  const activeUrl = import.meta.env.VITE_SUPABASE_URL || supabaseUrl;
  const activeKey = import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey;
  return Boolean(activeUrl && activeKey && !activeUrl.includes('mock'));
};


/**
 * Uploads an image file to Supabase Storage ('gallery-photos' bucket)
 * Returns the public URL of the uploaded image.
 */
export const uploadImageToSupabase = async (file, bucketName = 'gallery-photos') => {
  if (!isSupabaseConfigured()) {
    // Fallback for demo/offline environment: read file as Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `gallery/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

