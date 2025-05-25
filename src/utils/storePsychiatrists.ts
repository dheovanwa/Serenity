import { collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import psychiatristsDataJson from "./psychiatristsData.json";
import Compressor from "compressorjs";

export interface TimeRange {
  start: number; // 24-hour format in minutes from midnight
  end: number;
}

export interface Psychiatrist {
  id: string;
  name: string;
  specialty: string;
  image: string;
  price: number;
  basePrice: number;
  rating: number;
  tahunPengalaman: number;
  jadwal: {
    [key: string]: TimeRange | null;
  };
}

// Add debug logging
const debugData = psychiatristsDataJson;
console.log("Raw JSON data:", debugData);

// Export the data with better error handling and default data
export const psychiatristsData: Psychiatrist[] = (() => {
  try {
    if (!psychiatristsDataJson || !psychiatristsDataJson.psychiatrists) {
      console.error(
        "Invalid psychiatrists data format:",
        psychiatristsDataJson
      );
      return [];
    }

    const data = psychiatristsDataJson.psychiatrists;
    console.log("Parsed psychiatrists data:", data);

    if (!Array.isArray(data)) {
      console.error("Psychiatrists data is not an array:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error parsing psychiatrists data:", error);
    return [];
  }
})();

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
    console.log("Starting storePsychiatrists with data:", psychiatristsData);

    // Add validation for required fields
    const validPsychiatrists = psychiatristsData.filter(
      (psych) => psych.name && psych.specialty
    );

    if (validPsychiatrists.length === 0) {
      throw new Error("No valid psychiatrists data available");
    }

    const psychiatristsToStore = validPsychiatrists.map((psych) => ({
      ...psych,
      chatPatientQuota: 5, // Add default quota
    }));

    for (const psych of psychiatristsToStore) {
      try {
        // Convert and compress image to base64
        // const base64Image = await convertImageToBase64(psych.image);

        // Store in Firestore with base64 image
        await addDoc(psychiatristsRef, {
          ...psych,
          // image: base64Image,
        });

        console.log(`Stored psychiatrist: ${psych.name}`);
      } catch (error) {
        console.error(`Error storing psychiatrist ${psych.name}:`, error);
        // Continue with next psychiatrist even if one fails
        continue;
      }
    }
    console.log("All psychiatrists stored successfully!");
  } catch (error) {
    console.error("Error storing psychiatrists:", error);
    throw error; // Re-throw to let caller handle the error
  }
};

export const resetDailyQuotas = async () => {
  try {
    const psychiatristsRef = collection(db, "psychiatrists");
    const querySnapshot = await getDocs(psychiatristsRef);

    // Reset each psychiatrist's quota to their original value
    const resetPromises = querySnapshot.docs.map((doc) => {
      return updateDoc(doc.ref, {
        chatPatientQuota: 5, // Reset to default value
      });
    });

    await Promise.all(resetPromises);
    console.log("Successfully reset all psychiatrists' chat quotas");
  } catch (error) {
    console.error("Error resetting chat quotas:", error);
  }
};

// Add this to App.tsx or a suitable initialization point
export const initializeQuotaReset = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeUntilReset = tomorrow.getTime() - now.getTime();

  // Set initial timeout to run at midnight
  setTimeout(() => {
    resetDailyQuotas();
    // Then set it to run daily
    setInterval(resetDailyQuotas, 24 * 60 * 60 * 1000);
  }, timeUntilReset);
};
