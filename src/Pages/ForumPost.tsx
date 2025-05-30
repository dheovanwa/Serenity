import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, ThumbsUp, Clock, Send, User, Flag } from "lucide-react";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { containsProfanity } from "../utils/profanityFilter";
import defaultProfileImage from "../assets/default_profile_image.svg";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  userId: string;
  likeCount: number;
  category: string[];
  timeCreated: any; // Firebase Timestamp is 'any' if not explicitly defined
  replyCount: number;
  profileImage?: string | null;
  userRole?: "user" | "psychiatrist";
  specialty?: string;
  isLiked?: boolean;
  authorName?: string;
  authorGender?: "male" | "female";
  authorBirthDate?: string | Date;
}

// Tambahkan isDarkMode ke props ForumPost
interface ForumPostPageProps {
  isDarkMode: boolean;
}

const ForumPost: React.FC<ForumPostPageProps> = ({ isDarkMode }) => {
  // Terima prop isDarkMode
  const { forumId } = useParams();
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId] = useState(localStorage.getItem("documentId"));
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [postAuthor, setPostAuthor] = useState<{
    name: string;
    profileImage?: string | null;
    role: "user" | "psychiatrist";
    specialty?: string;
    gender?: "male" | "female"; // Add gender
    birthDate?: string | Date; // Add birthDate
  } | null>(null);
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyReportModal, setShowReplyReportModal] = useState(false);
  const [reportReplyReason, setReportReplyReason] = useState("");
  const [isReplyReportSubmitting, setIsReplyReportSubmitting] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);
  const [authorProfilePicture, setAuthorProfilePicture] = useState(""); // Ini tidak digunakan
  const [replyProfilePictures, setReplyProfilePictures] = useState<{
    [key: string]: string;
  }>({});
  const navigate = useNavigate();

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

  const getDisplayName = (author: any) => {
    if (author?.role === "psychiatrist") {
      return author.name || "Dr. Unknown";
    } else {
      if (author?.gender && author?.birthDate) {
        const age = calculateAge(author.birthDate);
        const gender = author.gender === "male" ? "Laki-laki" : "Perempuan";
        return `${gender}, ${age}`;
      }
      return "Pengguna";
    }
  };

  useEffect(() => {
    if (!forumId) return;

    let postUnsubscribe: (() => void) | undefined;
    let repliesUnsubscribe: (() => void) | undefined;

    const fetchPost = async () => {
      try {
        const postRef = doc(db, "forum", forumId);

        postUnsubscribe = onSnapshot(
          postRef,
          async (postSnap) => {
            if (postSnap.exists()) {
              const postData = { id: postSnap.id, ...postSnap.data() };
              setPost(postData);
              setLocalLikeCount(postData.likeCount || 0);

              if (userId) {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                  const likedPosts = userDoc.data()?.likedPosts || [];
                  setIsLiked(likedPosts.includes(forumId));
                }
              }

              const authorId = postData.userId;
              let authorInfo = {
                name: "Anonymous",
                profileImage: null,
                role: "user" as const,
              };

              try {
                const psyDocRef = doc(db, "psychiatrists", authorId);
                const psyDoc = await getDoc(psyDocRef);
                if (psyDoc.exists()) {
                  const psyData = psyDoc.data();
                  authorInfo = {
                    name: `Dr. ${psyData.name}`,
                    profileImage: psyData.image || null,
                    role: "psychiatrist",
                    specialty: psyData.specialty || "",
                  };
                } else {
                  const userDocRef = doc(db, "users", authorId);
                  const userDoc = await getDoc(userDocRef);
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    authorInfo = {
                      name: userData.firstName
                        ? `${userData.firstName} ${
                            userData.lastName || ""
                          }`.trim()
                        : "User",
                      profileImage: userData.profileImage || null,
                      role: "user",
                      gender: userData.sex || "",
                      birthDate: userData.birthOfDate || "",
                    };
                  }
                }
              } catch (error) {
                console.error("Error fetching author data:", error);
              }

              setPostAuthor(authorInfo);
            } else {
              setPost(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching post:", error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error setting up post listener:", error);
        setLoading(false);
      }
    };

    const repliesRef = collection(db, "forum", forumId, "reply");
    const q = query(repliesRef, orderBy("timeCreated", "asc"));

    repliesUnsubscribe = onSnapshot(q, async (snapshot) => {
      const repliesData = [];

      for (const replyDoc of snapshot.docs) {
        const replyData = { id: replyDoc.id, ...replyDoc.data() };

        let replyAuthor = {
          name: "Anonymous",
          profileImage: null,
          role: "user" as const,
        };

        const psyDocRef = doc(db, "psychiatrists", replyData.userId);
        const psyDoc = await getDoc(psyDocRef);
        if (psyDoc.exists()) {
          const psyData = psyDoc.data();
          replyAuthor = {
            name: `Dr. ${psyData.name}`,
            profileImage: psyData.image || null,
            role: "psychiatrist",
            specialty: psyData.specialty || "",
          };
        } else {
          const userDocRef = doc(db, "users", replyData.userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            replyAuthor = {
              name: userData.firstName
                ? `${userData.firstName} ${userData.lastName || ""}`.trim()
                : "User",
              profileImage: userData.profileImage || null,
              role: "user",
              gender: userData.sex || "",
              birthDate: userData.birthOfDate || "",
            };
          }
        }

        repliesData.push({
          ...replyData,
          author: replyAuthor,
        });
      }

      setReplies(repliesData);
    });

    fetchPost();

    return () => {
      if (postUnsubscribe) postUnsubscribe();
      if (repliesUnsubscribe) repliesUnsubscribe();
    };
  }, [forumId, userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchLikedReplies = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setLikedReplies(userData.likedReplies || {});
        }
      } catch (error) {
        console.error("Error fetching liked replies:", error);
      }
    };

    fetchLikedReplies();
  }, [userId]);

  useEffect(() => {
    const fetchReplyProfilePictures = async () => {
      if (!replies.length) return;

      const profilePictures: { [key: string]: string } = {};

      for (const reply of replies) {
        if (!reply.author.userId) continue; // Ensure userId is present

        try {
          let profilePictureUrl = "";

          if (reply.author.role === "psychiatrist") {
            const psychiatristDoc = await getDoc(
              doc(db, "psychiatrists", reply.author.userId)
            );
            if (psychiatristDoc.exists()) {
              const psychiatristData = psychiatristDoc.data();
              profilePictureUrl = psychiatristData.image || "";
            }
          } else {
            const userDoc = await getDoc(doc(db, "users", reply.author.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              profilePictureUrl = userData.profilePicture || "";
            }
          }

          if (profilePictureUrl) {
            profilePictures[reply.author.userId] = profilePictureUrl;
          }
        } catch (error) {
          console.error(
            `Error fetching profile picture for ${reply.author.userId}:`,
            error
          );
        }
      }

      setReplyProfilePictures(profilePictures);
    };

    fetchReplyProfilePictures();
  }, [replies]);

  const handleLike = async () => {
    if (!userId || !forumId) return;

    try {
      const userRef = doc(db, "users", userId);
      const postRef = doc(db, "forum", forumId);

      if (isLiked) {
        await updateDoc(userRef, {
          likedPosts: arrayRemove(forumId),
        });
        await updateDoc(postRef, {
          likeCount: localLikeCount - 1,
        });
        setLocalLikeCount((prev) => prev - 1);
      } else {
        await updateDoc(userRef, {
          likedPosts: arrayUnion(forumId),
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

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !userId || !forumId) return;

    try {
      const replyData = {
        userId,
        content: newReply,
        likeCount: 0,
        timeCreated: serverTimestamp(),
      };

      await addDoc(collection(db, "forum", forumId, "reply"), replyData);
      // Update replyCount on the main post
      await updateDoc(doc(db, "forum", forumId), {
        replyCount: increment(1),
      });

      setNewReply("");
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleReplyLike = async (replyId: string) => {
    if (!userId || !forumId) return;

    try {
      const replyRef = doc(db, "forum", forumId, "reply", replyId);
      const userRef = doc(db, "users", userId);

      const replySnap = await getDoc(replyRef);
      if (!replySnap.exists()) {
        console.error("Reply not found");
        return;
      }

      const currentLikeCount = replySnap.data()?.likeCount || 0;
      const isReplyCurrentlyLiked = likedReplies[replyId];

      if (isReplyCurrentlyLiked) {
        await updateDoc(replyRef, {
          likeCount: Math.max(0, currentLikeCount - 1),
        });
        await updateDoc(userRef, {
          likedReplies: { ...likedReplies, [replyId]: false }, // Mark as unliked
        });
        setLikedReplies((prev) => {
          const newState = { ...prev };
          delete newState[replyId]; // Remove entry if unliked
          return newState;
        });
      } else {
        await updateDoc(replyRef, {
          likeCount: currentLikeCount + 1,
        });
        await updateDoc(userRef, {
          likedReplies: { ...likedReplies, [replyId]: true }, // Mark as liked
        });
        setLikedReplies((prev) => ({
          ...prev,
          [replyId]: true,
        }));
      }
    } catch (error) {
      console.error("Error updating reply like:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) {
      return "Baru saja";
    }

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

  const handleReport = () => {
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim() || !userId || !forumId) return;

    setIsSubmitting(true);
    try {
      const reportsRef = collection(db, "forum", forumId, "reports");
      await addDoc(reportsRef, {
        reportContent: reportReason,
        reportedBy: userId,
        timestamp: serverTimestamp(),
      });

      if (
        post &&
        containsProfanity(post.title || "" + " " + post.content || "")
      ) {
        // Pass post object to profanity check
        try {
          await deleteDoc(doc(db, "forum", forumId));

          await addDoc(collection(db, "removedPosts"), {
            originalId: forumId,
            title: post.title,
            content: post.content,
            userId: post.userId,
            removedAt: serverTimestamp(),
            reason: "Automatic removal due to profanity",
            reportReason: reportReason,
          });

          navigate("/forum");
          return;
        } catch (error) {
          console.error("Error deleting inappropriate post:", error);
        }
      }

      setShowReportModal(false);
      setReportReason("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      setIsSubmitting(false);
    }
  };

  const handleReplyReport = (replyId: string) => {
    setSelectedReplyId(replyId);
    setShowReplyReportModal(true);
  };

  const submitReplyReport = async () => {
    if (!reportReplyReason.trim() || !userId || !forumId || !selectedReplyId)
      return;

    setIsReplyReportSubmitting(true);
    try {
      const replyRef = doc(db, "forum", forumId, "reply", selectedReplyId);
      const replySnap = await getDoc(replyRef);

      if (!replySnap.exists()) {
        throw new Error("Reply not found");
      }

      const replyData = replySnap.data();
      const replyContent = replyData?.content || "";

      const isProfane = containsProfanity(replyContent);

      const reportsRef = collection(replyRef, "reports");
      await addDoc(reportsRef, {
        reportContent: reportReplyReason,
        reportedBy: userId,
        timestamp: serverTimestamp(),
      });

      if (isProfane) {
        await updateDoc(replyRef, {
          isViolation: true,
          reportedBy: userId,
          reportedAt: serverTimestamp(),
        });
      }

      setShowReplyReportModal(false);
      setReportReplyReason("");
      setSelectedReplyId(null);
    } catch (error) {
      console.error("Error submitting reply report:", error);
    } finally {
      setIsReplyReportSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-6 dark:text-white dark:bg-gray-900 min-h-screen">
        Loading...
      </div>
    );
  if (!post)
    return (
      <div className="text-center p-6 dark:text-white dark:bg-gray-900 min-h-screen">
        Post not found
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-[#F2EDE2] dark:bg-[#161F36] transition-colors duration-300">
      {/* Main post */}
      <div className="max-w-4xl mx-auto rounded-lg p-6 mb-6 bg-[#E4DCCC] dark:bg-[#1A2947]">
        {/* Post author info */}
        <div className="flex items-center gap-3 mb-4">
          {postAuthor?.profileImage ? (
            <img
              src={postAuthor.profileImage}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <img
              src={defaultProfileImage}
              alt="Default Profile"
              className="w-12 h-12 rounded-full object-cover dark:filter dark:invert"
            />
          )}
          <div>
            <h3 className="font-semibold text-[#161F36] dark:text-white">
              {getDisplayName(postAuthor)}
            </h3>
            {postAuthor?.role === "psychiatrist" && postAuthor.specialty && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {postAuthor.specialty}
              </span>
            )}
          </div>
          <div className="ml-auto">
            <button
              onClick={handleReport}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors dark:text-gray-400 dark:hover:text-red-400"
              title="Laporkan postingan ini"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#161F36] mb-4 dark:text-white">
          {post.title}
        </h1>
        <p className="text-gray-700 mb-4 dark:text-gray-300">{post.content}</p>

        {/* Categories */}
        {post.category && post.category.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.category.map(
              (
                tag: string,
                index: number // Add type annotation for tag and index
              ) => (
                <span
                  key={index}
                  className="bg-[#BACBD8] text-[#161F36] px-3 py-1 rounded-full text-sm dark:bg-gray-700 dark:text-white"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center hover:text-[#BACBD8] transition-colors
                          dark:hover:text-blue-400 ${
                            isLiked
                              ? "text-[#BACBD8] dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
            >
              <ThumbsUp
                size={18}
                className="mr-1"
                fill={isLiked ? (isDarkMode ? "#60A5FA" : "#BACBD8") : "none"} // Conditional fill for dark mode
                stroke="currentColor" // Use current text color for stroke
              />
              {localLikeCount}
            </button>
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <MessageSquare size={18} className="dark:text-white" />
              {replies.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm dark:text-gray-400">
            <Clock size={16} className="dark:text-white" />
            <span>{formatTime(post.timeCreated)}</span>
          </div>
        </div>
      </div>

      {/* Reply form */}
      <div className="max-w-4xl mx-auto mb-6">
        <form onSubmit={(e) => handleSubmitReply(e)} className="flex gap-2">
          <input
            type="text"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Tulis balasanmu..."
            className="flex-1 p-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#BACBD8] text-[#161F36] hover:bg-[#9FB6C6] dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#293c63]"
          >
            <Send size={20} className="dark:text-white" />
          </button>
        </form>
      </div>

      {/* Replies */}
      <div className="max-w-4xl mx-auto space-y-4">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className="rounded-lg p-4 shadow bg-white dark:bg-[#1A2947]"
          >
            {/* Reply author info */}
            <div className="flex items-center gap-3 mb-3">
              {reply.author?.profileImage ? (
                <img
                  src={reply.author.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <img
                  src={defaultProfileImage}
                  alt="Default Profile"
                  className="w-10 h-10 rounded-full object-cover dark:filter dark:invert"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-[#161F36] text-sm dark:text-white">
                  {getDisplayName(reply.author)}
                </h4>
                {reply.author?.role === "psychiatrist" &&
                  reply.author.specialty && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {reply.author.specialty}
                    </span>
                  )}
              </div>

              <button
                onClick={() => handleReplyReport(reply.id)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors dark:text-gray-400 dark:hover:text-red-400"
                title="Laporkan balasan ini"
              >
                <Flag size={14} />
              </button>
            </div>

            {/* Reply content - only show warning if marked as violation */}
            {reply.isViolation ? (
              <p className="text-gray-500 italic mb-2 dark:text-gray-400">
                Informasi yang diberikan oleh pengguna ini menyalahgunakan
                syarat dan ketentuan dari penggunaan forum diskusi
              </p>
            ) : (
              <p className="text-gray-800 mb-2 dark:text-gray-200">
                {reply.content}
              </p>
            )}

            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleReplyLike(reply.id)}
                  className={`flex items-center gap-1 ${
                    likedReplies[reply.id]
                      ? "text-[#BACBD8] dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center rounded-md px-2 py-1 bg-[#F8F0E0] dark:bg-gray-700">
                    <ThumbsUp
                      size={16}
                      className="mr-1"
                      color={
                        isDarkMode
                          ? likedReplies[reply.id]
                            ? "#60A5FA"
                            : "white"
                          : likedReplies[reply.id]
                          ? "#BACBD8"
                          : "#5A6B7D"
                      } // Conditional color for icon stroke
                      fill={
                        likedReplies[reply.id]
                          ? isDarkMode
                            ? "#60A5FA"
                            : "#BACBD8"
                          : "none"
                      } // Conditional fill for icon
                      strokeWidth={1.5}
                    />
                    <span className="text-[#5A6B7D] font-medium dark:text-white">
                      {reply.likeCount || 0}
                    </span>
                  </div>
                </button>
                <span className="text-gray-600 dark:text-gray-300">
                  {reply.timeCreated
                    ? formatTime(reply.timeCreated)
                    : "Baru saja"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" // Modal overlay
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4
                       bg-white dark:bg-[#1A2947]" // Modal content background
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
              Laporkan Postingan
            </h3>
            <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">
              Silahkan berikan alasan mengapa Anda ingin melaporkan postingan
              ini.
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#BACBD8]
                         bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-700"
              placeholder="Tuliskan alasan laporan..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md hover:bg-gray-300 transition-colors
                           bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={() => setShowReportModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 text-white rounded-md hover:bg-[#9FB6C6] transition-colors disabled:opacity-50
                           bg-[#BACBD8] dark:bg-[#10347c] dark:hover:bg-[#4563a1]"
                onClick={submitReport}
                disabled={!reportReason.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center text-[#161F36] dark:text-white">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#161F36] dark:text-white"
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

      {/* Report Modal for Reply */}
      {showReplyReportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" // Modal overlay
          onClick={() => setShowReplyReportModal(false)}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4
                       bg-white dark:bg-gray-800" // Modal content background
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
              Laporkan Balasan
            </h3>
            <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">
              Silahkan berikan alasan mengapa Anda ingin melaporkan balasan ini.
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#BACBD8]
                         bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-700"
              placeholder="Tuliskan alasan laporan..."
              value={reportReplyReason}
              onChange={(e) => setReportReplyReason(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md hover:bg-gray-300 transition-colors
                           bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={() => setShowReplyReportModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 text-white rounded-md hover:bg-[#9FB6C6] transition-colors disabled:opacity-50
                           bg-[#BACBD8] dark:bg-[#10347c] dark:hover:bg-[#4563a1]"
                onClick={submitReplyReport}
                disabled={!reportReplyReason.trim() || isReplyReportSubmitting}
              >
                {isReplyReportSubmitting ? (
                  <span className="flex items-center text-[#161F36] dark:text-white">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#161F36] dark:text-white"
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
    </div>
  );
};

export default ForumPost;
