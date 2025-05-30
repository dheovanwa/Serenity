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
import { collection, getDocs, query, limit } from "firebase/firestore";
import ProfilePic from "../assets/default_profile_image.svg";

export function CarouselDemo() {
  const [psychiatrists, setPsychiatrists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPsychiatrists = async () => {
      setLoading(true);
      setError(null);
      try {
        const psychiatristsQuery = query(
          collection(db, "psychiatrists"),
          limit(10)
        );
        const querySnap = await getDocs(psychiatristsQuery);
        const data = querySnap.docs.map((doc) => {
          const d = doc.data();
          console.log("Fetched psychiatrist:", d);
          return {
            name: d.name || "Tanpa Nama",
            specialty: d.specialty || "Spesialisasi tidak tersedia",
            image: d.image && d.image.trim() !== "" ? d.image : ProfilePic,
          };
        });
        setPsychiatrists(data);
      } catch (e) {
        console.error("Error fetching psychiatrists:", e);
        setError("Gagal memuat data psikiater.");
        setPsychiatrists([]);
      }
      setLoading(false);
    };
    fetchPsychiatrists();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-10 text-lg text-gray-500">
        Memuat psikiater pilihan...
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

  if (psychiatrists.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-10 text-lg text-gray-500">
        Tidak ada psikiater yang tersedia.
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-7xl mx-auto">
      <CarouselContent>
        {psychiatrists.map((psychiatrist, index) => (
          <CarouselItem key={index}>
            <div className="p-4">
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {/* Gambar Psikiater */}
                  <img
                    src={psychiatrist.image}
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
