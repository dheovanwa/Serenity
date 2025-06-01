import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  limit,
  orderBy,
} from "firebase/firestore";
import ProfilePic from "../assets/default_profile_image.svg";
import starIcon from "../assets/star.svg";

// Import type yang sudah kita definisikan
import { Psikolog, UserProfile, UserPreferences } from "../models/types";
// Import fungsi rekomendasi baru
import {
  getUserPreferencesFromProfile,
  getContentBasedRecommendations,
  getUniqueSpecialtyRecommendations,
} from "../utils/recommendation";

export function CarouselDemo() {
  const [recommendedPsychiatrists, setRecommendedPsychiatrists] = useState<
    Psikolog[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Dapatkan UID Pengguna Saat Ini
        const currentUserId = localStorage.getItem("documentId");

        // 2. Ambil Profil Pengguna Saat Ini (untuk preferensi Content-Based)
        let currentUserProfile: UserProfile | null = null;
        let currentUserPreferences: UserPreferences = {};

        if (currentUserId) {
          const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
          if (currentUserDoc.exists()) {
            const userData = currentUserDoc.data();
            currentUserProfile = {
              uid: currentUserDoc.id,
              ...(userData as Omit<UserProfile, "uid">),
              specialty_like: userData.specialty_like || {},
              gaya_interaksi: userData.gaya_interaksi || {},
            };
            // Konversi data map dari Firestore menjadi array of strings untuk preferensi
            currentUserPreferences =
              getUserPreferencesFromProfile(currentUserProfile);
          } else {
            console.warn(
              "Current user profile not found for ID:",
              currentUserId
            );
            // Jika profil user tidak ditemukan, gunakan preferensi default (kosong)
            currentUserPreferences = {};
          }
        } else {
          console.warn(
            "User ID not found. Displaying default/popular psychiatrists."
          );
          // Jika tidak ada user ID, gunakan preferensi default (kosong)
          currentUserPreferences = {};
        }

        // 3. Ambil Semua Psikiater (untuk Content-Based Filtering)
        const allPsychiatristsQuery = query(collection(db, "psychiatrists"));
        const allPsychiatristsSnap = await getDocs(allPsychiatristsQuery);
        const allPsychiatrists: Psikolog[] = allPsychiatristsSnap.docs.map(
          (doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              name: d.name || "Tanpa Nama",
              specialty: d.specialty || "Spesialisasi tidak tersedia",
              gaya_interaksi: d.gaya_interaksi || [], // Pastikan ini array
              price: d.price || 0,
              rating: d.rating || 0,
              ratings: d.ratings || [],
              image: d.image && d.image.trim() !== "" ? d.image : ProfilePic,
              location: d.location || "",
            };
          }
        );

        // 4. Hitung Rekomendasi Content-Based
        // Ini akan mengurutkan psikiater berdasarkan score kecocokan preferensi pengguna
        let contentBasedRecommendations = getContentBasedRecommendations(
          allPsychiatrists,
          currentUserPreferences
        );

        // 5. Terapkan logika keunikan specialty
        let finalRecommendations: Psikolog[];
        const RECOMMENDED_COUNT = 10; // Jumlah rekomendasi yang ingin ditampilkan

        if (contentBasedRecommendations.length > 0) {
          // Jika ada rekomendasi content-based, coba ambil yang unik specialty
          finalRecommendations = contentBasedRecommendations;
        } else {
          // FALLBACK: Jika tidak ada rekomendasi content-based (userPrefs kosong/tidak cocok)
          console.log(
            "No content-based recommendations. Falling back to unique popular/default."
          );
          // Ambil psikiater paling populer/default (misal berdasarkan rating)
          const fallbackQuery = query(
            collection(db, "psychiatrists"),
            orderBy("rating", "desc") // Urutkan berdasarkan rating tertinggi
            // Tidak perlu limit di sini, karena getUniqueSpecialtyRecommendations akan membatasi
          );
          const fallbackSnap = await getDocs(fallbackQuery);
          const fallbackPsikologs: Psikolog[] = fallbackSnap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              name: d.name || "Tanpa Nama",
              specialty: d.specialty || "Spesialisasi tidak tersedia",
              gaya_interaksi: d.gaya_interaksi || [],
              price: d.price || 0,
              rating: d.rating || 0,
              image: d.image && d.image.trim() !== "" ? d.image : ProfilePic,
              location: d.location || "",
            };
          });
          // Terapkan keunikan specialty pada fallback psikolog
          finalRecommendations = getUniqueSpecialtyRecommendations(
            fallbackPsikologs,
            RECOMMENDED_COUNT
          );
        }

        setRecommendedPsychiatrists(finalRecommendations);
      } catch (e) {
        console.error("Error during recommendation process:", e);
        setError("Gagal memuat rekomendasi psikiater.");
        setRecommendedPsychiatrists([]);
      } finally {
        setLoading(false);
      }
    };
    initRecommendations();
  }, []); // Dependensi kosong agar hanya berjalan sekali saat mount

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-10 text-lg text-gray-500">
        Memuat rekomendasi psikiater pilihan...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-10 text-lg text-red-500">
        {error}
      </div>
    );
  }

  if (recommendedPsychiatrists.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-10 text-lg text-gray-500">
        Tidak ada rekomendasi psikiater yang ditemukan. Coba lagi nanti.
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-7xl mx-auto">
      <CarouselContent>
        {recommendedPsychiatrists.map((psychiatrist) => (
          <CarouselItem key={psychiatrist.id}>
            <div className="p-4">
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {/* Gambar Psikiater */}
                  <img
                    src={psychiatrist.image || ProfilePic}
                    alt={psychiatrist.name}
                    className="w-62 h-62 rounded-xl object-cover mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ProfilePic;
                    }}
                  />
                  {/* Nama Psikiater */}
                  <span className="text-2xl font-semibold mb-2">
                    {psychiatrist.name}
                  </span>
                  {/* Spesialisasi Psikiater */}
                  <p className="text-lg text-gray-500">
                    {psychiatrist.specialty}
                  </p>
                  {/* Rating */}
                  {psychiatrist.rating !== undefined && (
                    <p className="text-md text-gray-600 flex items-center gap-1">
                      Rating:{" "}
                      {parseFloat(psychiatrist.rating as any).toFixed(1)}
                      <img
                        src={starIcon}
                        alt="star"
                        className="w-5 h-5 inline-block"
                      />
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
