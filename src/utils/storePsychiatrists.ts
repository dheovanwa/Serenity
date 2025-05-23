import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import Compressor from "compressorjs";

// Import all doctor images
import doctor1 from "../assets/D10.png";
import doctor2 from "../assets/D10.png";
import doctor3 from "../assets/D10.png";
import doctor4 from "../assets/D10.png";
import doctor5 from "../assets/D10.png";
import doctor6 from "../assets/D10.png";
import doctor7 from "../assets/D10.png";
import doctor8 from "../assets/D10.png";
import doctor9 from "../assets/D10.png";
import doctor10 from "../assets/D10.png";
import doctor11 from "../assets/D10.png";
import doctor12 from "../assets/D10.png";

export interface TimeRange {
  start: number; // 24-hour format in minutes from midnight
  end: number;
}

const specialties = [
  "Psikolog Klinis",
  "Psikolog Anak & Remaja",
  "Psikolog Industri dan Organisasi",
  "Psikolog Pendidikan",
  "Konselor Pernikahan dan Keluarga",
  "Konselor Adiksi",
  "Terapis / Konselor Umum",
];

export const psychiatristsData = [
  {
    name: "Anita Wijaya",
    specialty: "Psikolog Klinis",
    price: 25000.0,
    rating: 5,
    tahunPengalaman: 4,
    imageSrc: doctor1,
    jadwal: {
      senin: { start: 540, end: 960 }, // 09:00-16:00 in minutes
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: null, // Libur
    },
  },
  {
    name: "Budi Santoso",
    specialty: "Psikolog Klinis",
    price: 27500.0,
    rating: 4,
    tahunPengalaman: 6,
    imageSrc: doctor2,
    jadwal: {
      senin: { start: 540, end: 960 },
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: null, // Libur
      sabtu: { start: 540, end: 960 },
      minggu: null, // Libur
    },
  },
  {
    name: "Dewi Kusuma",
    specialty: "Psikolog Anak & Remaja",
    price: 22500.0,
    rating: 5,
    tahunPengalaman: 8,
    imageSrc: doctor3,
    jadwal: {
      senin: { start: 540, end: 960 },
      selasa: { start: 540, end: 960 },
      rabu: null, // Libur
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: { start: 540, end: 960 },
      minggu: null, // Libur
    },
  },
  {
    name: "Hendra Gunawan",
    specialty: "Psikolog Industri dan Organisasi",
    price: 30000.0,
    rating: 5,
    tahunPengalaman: 5,
    imageSrc: doctor4,
    jadwal: {
      senin: null, // Libur
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
  {
    name: "Robert Ukerliznes",
    specialty: "Psikolog Pendidikan",
    price: 20000,
    rating: 5,
    tahunPengalaman: 2,
    sessions: 7,
    imageSrc: doctor5,
    jadwal: {
      senin: { start: 540, end: 960 }, // Libur
      selasa: null,
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
  {
    name: "Tariots Survfig",
    specialty: "Konselor Pernikahan dan Keluarga",
    price: 24000,
    rating: 5,
    sessions: 7,
    tahunPengalaman: 5,
    imageSrc: doctor6,
    jadwal: {
      senin: null, // Libur
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
  {
    name: "John Doe",
    specialty: "Konselor Adiksi",
    price: 22000,
    tahunPengalaman: 3,
    rating: 4,
    sessions: 6,
    imageSrc: doctor7,
    jadwal: {
      senin: null, // Libur
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
  {
    name: "Jane Smith",
    specialty: "Terapis / Konselor Umum",
    price: 35000,
    tahunPengalaman: 3,
    rating: 4,
    sessions: 5,
    imageSrc: doctor8,
    jadwal: {
      senin: null, // Libur
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
  {
    name: "Alice Brown",
    specialty: "Psikolog Klinis",
    price: 40000,
    tahunPengalaman: 3,
    rating: 5,
    sessions: 8,
    imageSrc: doctor9,
    jadwal: {
      senin: null, // Libur
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
  {
    name: "David Clark",
    specialty: "Psikolog Klinis",
    price: 35000,
    tahunPengalaman: 2,
    rating: 5,
    sessions: 6,
    imageSrc: doctor10,
    jadwal: {
      senin: null, // Libur
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
  {
    name: "Michael White",
    specialty: "Psikolog Anak & Remaja",
    price: 30000,
    tahunPengalaman: 5,
    rating: 4,
    sessions: 7,
    imageSrc: doctor11,
    jadwal: {
      senin: null, // Libur
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
  {
    name: "Ralieyz Baxckz",
    specialty: "Konselor Adiksi",
    price: 40000,
    tahunPengalaman: 9,
    rating: 4,
    sessions: 5,
    imageSrc: doctor12,
    jadwal: {
      senin: null, // Libur
      selasa: { start: 540, end: 960 },
      rabu: { start: 540, end: 960 },
      kamis: { start: 540, end: 960 },
      jumat: { start: 540, end: 960 },
      sabtu: null, // Libur
      minggu: { start: 540, end: 960 },
    },
  },
];
const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calculate new dimensions (maintain aspect ratio)
      let width = img.width;
      let height = img.height;
      const maxDimension = 400; // Reduced from 800

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Create a Blob from the canvas
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject("Failed to create blob");
            return;
          }

          // More aggressive compression
          new Compressor(blob, {
            quality: 0.3, // Reduced from 0.6
            maxWidth: 400, // Reduced from 800
            maxHeight: 400, // Added max height
            resize: "contain",
            mimeType: "image/jpeg", // Use JPEG for better compression
            success: (compressedBlob) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result as string);
              };
              reader.readAsDataURL(compressedBlob);
            },
            error: (err) => {
              reject(err);
            },
          });
        },
        "image/jpeg",
        0.7
      );
    };

    img.onerror = (error) => reject(error);
  });
};

export const storePsychiatrists = async () => {
  const psychiatristsRef = collection(db, "psychiatrists");

  try {
    for (const psych of psychiatristsData) {
      // Convert and compress image to base64
      const base64Image = await convertImageToBase64(psych.imageSrc);

      // Store in Firestore with both base64 and original imageSrc
      await addDoc(psychiatristsRef, {
        ...psych,
        image: base64Image,
      });

      console.log(`Stored psychiatrist: ${psych.name}`);
    }
    console.log("All psychiatrists stored successfully!");
  } catch (error) {
    console.error("Error storing psychiatrists:", error);
  }
};
