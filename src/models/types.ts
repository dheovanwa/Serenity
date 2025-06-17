// types.ts

// Model untuk data Pengguna dari Firestore
export interface UserProfile {
  uid: string; // Ini adalah userId yang akan digunakan (asumsi documentId dari localStorage adalah UID)
  email?: string;
  firstName?: string;
  lastName?: string;
  // Ini adalah field yang Anda sebutkan
  specialty_like?: { [key: string]: number }; // Map di Firestore menjadi objek di JS
  gaya_interaksi?: { [key: string]: number }; // Map di Firestore menjadi objek di JS
  // Tambahkan field lain jika ada yang relevan dari dokumen user Anda
  address?: string;
  dailySurveyCompleted?: boolean;
  isUser?: boolean;
  phoneNumber?: string;
  profilePicture?: string;
}

// Model untuk data Psikolog dari Firestore
export interface Psikolog {
  id: string; // ID dokumen Firestore (penting untuk referensi)
  name: string;
  specialty: string; // String tunggal seperti "Psikolog Klinis"
  gaya_interaksi: string[]; // Array of Strings, misal ["Direktif dan Terstruktur", "Suportif dan Empatik"]
  price?: number; // Asumsi price mungkin ada
  rating?: number; // Asumsi rating mungkin ada
  ratings?: number[]; // Asumsi ratings array mungkin ada
  image?: string; // Asumsi ada field 'image' untuk gambar profil
  location?: string; // Asumsi ada field 'location'
  // Ini akan ditambahkan secara dinamis untuk scoring
  score?: number; // Skor dari Content-Based
}

// Preferensi pengguna untuk sistem rekomendasi
// Ini akan diambil dari UserProfile dan/atau filter UI
export interface UserPreferences {
  preferredSpecialties?: string[]; // Ini akan diisi dari specialty_like dari user profile
  preferredGayaInteraksi?: string[]; // Ini akan diisi dari gaya_interaksi dari user profile
  // Anda bisa menambahkan preferensi lain jika ada filter di UI:
  lokasiPrioritas?: string;
  minRating?: number;
  maxPrice?: number;
}
