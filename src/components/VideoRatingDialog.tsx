import React, { useState } from "react";
import {
  doc,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface VideoRatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    psychiatristId: string;
    doctorName: string;
  };
  userId: string;
  isDarkMode?: boolean;
}

const VideoRatingDialog: React.FC<VideoRatingDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  userId,
  isDarkMode = false,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleStarClick = async (starValue: number) => {
    setRating(starValue);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      // Check if rating already exists
      const videoRatingDocRef = doc(db, "videoRatings", appointment.id);
      const existingRating = await getDoc(videoRatingDocRef);

      if (existingRating.exists()) {
        alert("Rating sudah ada untuk sesi ini.");
        onClose();
        return;
      }

      // Save video rating record
      await setDoc(videoRatingDocRef, {
        appointmentId: appointment.id,
        psychiatristId: appointment.psychiatristId,
        rating: rating,
        ratedAt: serverTimestamp(),
        ratedBy: userId,
      });

      // Update psychiatrist's ratings
      const psychiatristRef = doc(
        db,
        "psychiatrists",
        appointment.psychiatristId
      );
      const psychiatristDoc = await getDoc(psychiatristRef);

      if (psychiatristDoc.exists()) {
        const psychiatristData = psychiatristDoc.data();
        const currentRatings = psychiatristData.ratings || [];

        const updatedRatings = [...currentRatings, rating];

        const averageRating =
          updatedRatings.reduce((sum, rating) => sum + rating, 0) /
          updatedRatings.length;
        const roundedAverage = Math.round(averageRating * 10) / 10;

        await updateDoc(psychiatristRef, {
          ratings: updatedRatings,
          rating: roundedAverage,
        });

        console.log(
          `Updated psychiatrist rating: ${roundedAverage} (from ${updatedRatings.length} ratings)`
        );
      }

      onClose();
    } catch (error) {
      console.error("Error saving video rating:", error);
      alert("Gagal menyimpan rating. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (starValue: number) => {
    setHoveredRating(starValue);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg shadow-xl w-80 max-w-sm mx-4 ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <h3
          className={`text-xl font-semibold mb-4 text-center ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Beri Rating untuk Sesi Video
        </h3>

        <p
          className={`text-center mb-4 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Bagaimana pengalaman Anda dengan Dr. {appointment.doctorName}?
        </p>

        <div className="flex items-center justify-center space-x-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              onMouseLeave={handleStarLeave}
              className="focus:outline-none transition-transform cursor-pointer hover:scale-110"
              disabled={isSubmitting}
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p
            className={`text-sm text-center mb-4 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Anda akan memberi rating {rating} bintang
          </p>
        )}

        {isSubmitting && (
          <p className="text-sm text-blue-600 text-center mb-4 dark:text-blue-400">
            Menyimpan rating...
          </p>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md transition-colors ${
              isDarkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Lewati
          </button>
          <button
            onClick={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
            className={`px-4 py-2 rounded-md transition-colors ${
              rating === 0 || isSubmitting
                ? "bg-gray-400 text-white cursor-not-allowed"
                : isDarkMode
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Rating"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoRatingDialog;
