import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import Compressor from "compressorjs";

// Import all doctor images
import doctor1 from "../assets/D1.png";
import doctor2 from "../assets/D2.png";
import doctor3 from "../assets/D3.png";
import doctor4 from "../assets/D4.png";
import doctor5 from "../assets/D5.png";
import doctor6 from "../assets/D6.png";
import doctor7 from "../assets/D7.png";
import doctor8 from "../assets/D8.png";
import doctor9 from "../assets/D9.png";
import doctor10 from "../assets/D10.png";
import doctor11 from "../assets/D11.png";
import doctor12 from "../assets/D12.png";

const psychiatristsData = [
  {
    name: "Titin Sulaiman",
    specialty: "Anxiety & Depression Specialist",
    price: "$24.99",
    rating: 5,
    sessions: 7,
    imageSrc: doctor1,
  },
  {
    name: "Martin Luther",
    specialty: "PTSD & Trauma Specialist",
    price: "$25.99",
    rating: 3,
    sessions: 7,
    imageSrc: doctor2,
  },
  {
    name: "Virle Syahroks",
    specialty: "Bipolar Disorder Specialist",
    price: "$28.99",
    rating: 4,
    sessions: 7,
    imageSrc: doctor3,
  },
  {
    name: "Yorkiv Gizlkenzix",
    specialty: "Personality Disorders Specialist",
    price: "$34.99",
    rating: 5,
    sessions: 7,
    imageSrc: doctor4,
  },
  {
    name: "Robert Ukerliznes",
    specialty: "Sleep Disorders Psychiatrist",
    price: "$27.99",
    rating: 5,
    sessions: 7,
    imageSrc: doctor5,
  },
  {
    name: "Tariots Survfig",
    specialty: "Eating Disorders Psychiatrist",
    price: "$29.90",
    rating: 5,
    sessions: 7,
    imageSrc: doctor6,
  },
  {
    name: "John Doe",
    specialty: "Sleep Disorders Specialist",
    price: "$20.99",
    rating: 4,
    sessions: 6,
    imageSrc: doctor7,
  },
  {
    name: "Jane Smith",
    specialty: "Anxiety Specialist",
    price: "$22.99",
    rating: 4,
    sessions: 5,
    imageSrc: doctor8,
  },
  {
    name: "Alice Brown",
    specialty: "Depression Specialist",
    price: "$27.50",
    rating: 5,
    sessions: 8,
    imageSrc: doctor9,
  },
  {
    name: "David Clark",
    specialty: "PTSD Specialist",
    price: "$30.00",
    rating: 5,
    sessions: 6,
    imageSrc: doctor10,
  },
  {
    name: "Michael White",
    specialty: "Personality Disorder Specialist",
    price: "$35.00",
    rating: 4,
    sessions: 7,
    imageSrc: doctor11,
  },
  {
    name: "Ralieyz Baxckz",
    specialty: "Bipolar Disorder Specialist",
    price: "$26.50",
    rating: 4,
    sessions: 5,
    imageSrc: doctor12,
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
