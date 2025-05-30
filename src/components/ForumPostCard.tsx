import React, { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Clock, User, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { shouldRemovePost } from "../utils/profanityFilter";
import defaultProfileImage from "../assets/default_profile_image.svg";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  userId: string;
  likeCount: number;
  category: string[];
  timeCreated: Timestamp;
  replyCount: number;
  profileImage?: string | null;
  userRole?: "user" | "psychiatrist";
  specialty?: string; // Add specialty field
  isLiked?: boolean;
  authorName?: string;
  authorGender?: "male" | "female";
  authorBirthDate?: string | Date;
}

interface ForumPostCardProps {
  post: ForumPost;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const userId = localStorage.getItem("documentId");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (!userId) return;
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const likedPosts = userDoc.data().likedPosts || [];
        setIsLiked(likedPosts.includes(post.id));
      }
    };
    checkIfLiked();
  }, [post.id, userId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking like
    if (!userId) return;

    try {
      const userRef = doc(db, "users", userId);
      const postRef = doc(db, "forum", post.id);

      if (isLiked) {
        // Unlike
        await updateDoc(userRef, {
          likedPosts: arrayRemove(post.id),
        });
        await updateDoc(postRef, {
          likeCount: localLikeCount - 1,
        });
        setLocalLikeCount((prev) => prev - 1);
      } else {
        // Like
        await updateDoc(userRef, {
          likedPosts: arrayUnion(post.id),
        });
        await updateDoc(postRef, {
          likeCount: localLikeCount + 1,
        });
        setLocalLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to post detail
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim() || !userId) return;

    setIsSubmitting(true);
    try {
      // Store the report in a subcollection of the forum post
      const reportsRef = collection(db, "forum", post.id, "reports");
      await addDoc(reportsRef, {
        reportContent: reportReason,
        reportedBy: userId,
        timestamp: serverTimestamp(),
      });

      // Check if post contains profanity
      if (shouldRemovePost(post)) {
        try {
          // Delete the post if it contains profanity
          await deleteDoc(doc(db, "forum", post.id));

          // Add to removed posts collection for audit
          await addDoc(collection(db, "removedPosts"), {
            originalId: post.id,
            title: post.title,
            content: post.content,
            userId: post.userId,
            removedAt: serverTimestamp(),
            reason: "Automatic removal due to profanity",
            reportReason: reportReason,
          });

          // Redirect to forum home if post is deleted
          navigate("/forum");
        } catch (error) {
          console.error("Error deleting inappropriate post:", error);
        }
      }

      // Close modal and reset state
      setShowReportModal(false);
      setReportReason("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    const now = new Date();
    const postDate = timestamp.toDate();
    const diffInMinutes = Math.floor(
      (now.getTime() - postDate.getTime()) / 60000
    );

    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} jam yang lalu`;
    return `${Math.floor(diffInMinutes / 1440)} hari yang lalu`;
  };

  const calculateAge = (birthOfDate: string | Date): number => {
    const birth = new Date(birthOfDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getDisplayName = () => {
    if (post.userRole === "psychiatrist") {
      return post.authorName || "Dr. Unknown";
    } else {
      // For users, show "Gender, Age"
      if (post.authorGender && post.authorBirthDate) {
        const age = calculateAge(post.authorBirthDate);
        const gender = post.authorGender === "male" ? "Laki-laki" : "Perempuan";
        return `${gender}, ${age}`;
      }
      return "Pengguna";
    }
  };

  return (
    <>
      <div
        className="bg-[#E4DCCC] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/forum/${post.id}`)}
      >
        {/* Author Information and Profile */}
        <div className="flex items-center gap-3 mb-4">
          {post.profileImage ? (
            <img
              src={post.profileImage}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <img
              src={defaultProfileImage}
              alt="Default Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-[#161F36]">{getDisplayName()}</h3>
            {post.userRole === "psychiatrist" && post.specialty && (
              <span className="text-sm text-gray-600">{post.specialty}</span>
            )}
          </div>
          {/* Add Report Button */}
          <button
            onClick={handleReport}
            className="ml-auto p-2 text-gray-500 hover:text-red-500 transition-colors"
            title="Laporkan postingan ini"
          >
            <Flag size={16} />
          </button>
        </div>

        {/* Post Title and Content */}
        <h2 className="text-xl font-semibold text-[#161F36] mb-2">
          {post.title}
        </h2>
        <p className="text-gray-700 mb-4">{post.content}</p>

        {/* Categories/Tags */}
        {post.category && post.category.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.category.map((tag, index) => (
              <span
                key={index}
                className="bg-[#BACBD8] text-[#161F36] px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Footer */}
        <div className="flex justify-between items-center text-gray-600">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike(e);
              }}
              className={`flex items-center text-gray-600 hover:text-[#BACBD8] transition-colors ${
                isLiked ? "text-[#BACBD8]" : ""
              }`}
            >
              <ThumbsUp
                size={18}
                className="mr-1"
                fill={isLiked ? "#BACBD8" : "none"}
              />
              {localLikeCount}
            </button>
            <span className="flex items-center text-gray-600">
              <MessageSquare size={18} className="mr-1" />
              {post.replyCount}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock size={16} className="mr-2" />
            {formatTime(post.timeCreated)}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Laporkan Postingan</h3>
            <p className="text-sm text-gray-600 mb-4">
              Silakan berikan alasan mengapa Anda ingin melaporkan postingan
              ini.
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#BACBD8]"
              placeholder="Tuliskan alasan laporan..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setShowReportModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-[#BACBD8] text-[#161F36] rounded-md hover:bg-[#9FB6C6] transition-colors disabled:opacity-50"
                onClick={submitReport}
                disabled={!reportReason.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#161F36]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Mengirim...
                  </span>
                ) : (
                  "Kirim Laporan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ForumPostCard;
