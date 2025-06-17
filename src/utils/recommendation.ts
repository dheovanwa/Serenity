// utils/recommendation.ts

import { Psikolog, UserPreferences, UserProfile } from "../models/types";

/**
 * Mendapatkan UserPreferences dari UserProfile.
 * Mengubah Map (objek di JS) dari Firestore menjadi Array of Strings yang disukai.
 */
export const getUserPreferencesFromProfile = (
  userProfile: UserProfile
): UserPreferences => {
  const preferences: UserPreferences = {};

  if (userProfile.specialty_like) {
    // Ambil specialty yang memiliki nilai > 0 (dianggap disukai/diutamakan)
    preferences.preferredSpecialties = Object.keys(
      userProfile.specialty_like
    ).filter((key) => userProfile.specialty_like![key] > 0);
  }

  if (userProfile.gaya_interaksi) {
    // Ambil gaya_interaksi yang memiliki nilai > 0
    preferences.preferredGayaInteraksi = Object.keys(
      userProfile.gaya_interaksi
    ).filter((key) => userProfile.gaya_interaksi![key] > 0);
  }

  return preferences;
};

/**
 * Mendapatkan rekomendasi berbasis konten dengan scoring.
 * Menghitung skor untuk setiap psikiater berdasarkan kecocokan preferensi pengguna.
 * @param psychiatrists Daftar psikiater dari Firestore.
 * @param preferences Preferensi pengguna.
 * @returns Array psikiater yang sudah memiliki 'score' dan diurutkan.
 */
export const getContentBasedRecommendations = (
  psychiatrists: Psikolog[],
  preferences: UserPreferences
): Psikolog[] => {
  let scoredPsikologs = psychiatrists.map((psy) => ({ ...psy, score: 0 })); // Inisialisasi score

  // Scoring berdasarkan preferredSpecialties
  if (
    preferences.preferredSpecialties &&
    preferences.preferredSpecialties.length > 0
  ) {
    scoredPsikologs = scoredPsikologs.map((psy) => {
      let score = psy.score || 0;
      if (psy.specialty) {
        if (
          preferences.preferredSpecialties!.some((prefSpec) =>
            psy.specialty.toLowerCase().includes(prefSpec.toLowerCase())
          )
        ) {
          score += 2; // Beri bobot lebih tinggi untuk kecocokan specialty
        }
      }
      //   console.log(
      //     `Scoring for specialty: ${psy.name} (${psy.specialty}) - Score: ${score}`
      //   );

      //   console.log(...psy);

      return { ...psy, score: score };
    });
  }

  // Scoring berdasarkan preferredGayaInteraksi
  if (
    preferences.preferredGayaInteraksi &&
    preferences.preferredGayaInteraksi.length > 0
  ) {
    scoredPsikologs = scoredPsikologs.map((psy) => {
      let score = psy.score || 0;
      if (psy.gaya_interaksi && Array.isArray(psy.gaya_interaksi)) {
        if (
          psy.gaya_interaksi.some((psyGaya) =>
            preferences.preferredGayaInteraksi!.some((prefGaya) =>
              psyGaya.toLowerCase().includes(prefGaya.toLowerCase())
            )
          )
        ) {
          score += 1; // Bobot standar untuk gaya interaksi
        }
      }
      return { ...psy, score: score };
    });
  }

  // Filter psikiater yang memiliki skor > 0 (setidaknya ada satu kecocokan preferensi)
  // dan urutkan berdasarkan skor tertinggi
  return scoredPsikologs
    .filter((psy) => (psy.score || 0) > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
};

/**
 * Fungsi untuk memfilter psikiater agar setiap specialty unik.
 * Mengambil psikiater dari daftar yang sudah diurutkan (berdasarkan skor/rating).
 */
export const getUniqueSpecialtyRecommendations = (
  psikologs: Psikolog[],
  limitCount: number = 10
): Psikolog[] => {
  const uniqueSpecialties: Set<string> = new Set();
  const recommendedList: Psikolog[] = [];

  for (const psy of psikologs) {
    // Tambahkan psikiater ini jika specialty-nya belum ada di daftar rekomendasi
    if (!uniqueSpecialties.has(psy.specialty.toLowerCase())) {
      recommendedList.push(psy);
      uniqueSpecialties.add(psy.specialty.toLowerCase());
    }

    // Berhenti jika sudah mencapai batas limit
    if (recommendedList.length >= limitCount) {
      break;
    }
  }

  // Jika setelah loop masih belum mencapai limit, tambahkan sisa psikiater
  // dari daftar asli tanpa mempertimbangkan keunikan specialty lagi
  if (recommendedList.length < limitCount) {
    const existingIds = new Set(recommendedList.map((p) => p.id));
    for (const psy of psikologs) {
      if (!existingIds.has(psy.id)) {
        recommendedList.push(psy);
        existingIds.add(psy.id); // Tambahkan ID ke set agar tidak duplikat
        if (recommendedList.length >= limitCount) {
          break;
        }
      }
    }
  }

  return recommendedList.slice(0, limitCount); // Pastikan hanya sampai limit
};
