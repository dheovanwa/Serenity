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

const ForumPost = () => {
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
    specialty?: string; // Add specialty field
  } | null>(null);
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyReportModal, setShowReplyReportModal] = useState(false);
  const [reportReplyReason, setReportReplyReason] = useState("");
  const [isReplyReportSubmitting, setIsReplyReportSubmitting] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);
  const [authorProfilePicture, setAuthorProfilePicture] = useState("");
  const [replyProfilePictures, setReplyProfilePictures] = useState<{
    [key: string]: string;
  }>({});
  const navigate = useNavigate();

  // Function to calculate age from birthOfDate
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

  // Function to format display name based on role
  const getDisplayName = (author: any) => {
    if (author?.role === "psychiatrist") {
      return author.name || "Dr. Unknown";
    } else {
      // For users, show "Gender, Age"
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

    // Create refs for listeners to clean up later
    let postUnsubscribe: (() => void) | undefined;
    let repliesUnsubscribe: (() => void) | undefined;

    // Fetch post details with real-time updates
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "forum", forumId);

        // Use onSnapshot for real-time updates to the post document
        postUnsubscribe = onSnapshot(
          postRef,
          async (postSnap) => {
            if (postSnap.exists()) {
              const postData = { id: postSnap.id, ...postSnap.data() };
              setPost(postData);
              setLocalLikeCount(postData.likeCount || 0);

              // Check if user has liked the post
              if (userId) {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                  const likedPosts = userDoc.data().likedPosts || [];
                  setIsLiked(likedPosts.includes(forumId));
                }
              }

              // Fetch author information
              const authorId = postData.userId;
              let authorInfo = {
                name: "Anonymous",
                profileImage: null,
                role: "user" as const,
              };

              // Check in psychiatrists collection first
              try {
                const psyDocRef = doc(db, "psychiatrists", authorId);
                const psyDoc = await getDoc(psyDocRef);
                if (psyDoc.exists()) {
                  const psyData = psyDoc.data();
                  authorInfo = {
                    name: `Dr. ${psyData.name}`,
                    profileImage: psyData.image || null, // Use "image" field for psychiatrists
                    role: "psychiatrist",
                    specialty: psyData.specialty || "",
                  };
                } else {
                  // If not found in psychiatrists, check users
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

    // Listen to replies in real-time - we already have this using onSnapshot
    const repliesRef = collection(db, "forum", forumId, "reply");
    const q = query(repliesRef, orderBy("timeCreated", "asc"));

    repliesUnsubscribe = onSnapshot(q, async (snapshot) => {
      const repliesData = [];

      for (const replyDoc of snapshot.docs) {
        const replyData = { id: replyDoc.id, ...replyDoc.data() };

        // Fetch reply author info
        let replyAuthor = {
          name: "Anonymous",
          profileImage: null,
          role: "user" as const,
        };

        // Check in psychiatrists collection first
        const psyDocRef = doc(db, "psychiatrists", replyData.userId);
        const psyDoc = await getDoc(psyDocRef);
        if (psyDoc.exists()) {
          const psyData = psyDoc.data();
          replyAuthor = {
            name: `Dr. ${psyData.name}`,
            profileImage: psyData.image || null, // Use "image" field for psychiatrists
            role: "psychiatrist",
            specialty: psyData.specialty || "",
          };
        } else {
          // If not found in psychiatrists, check users
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

    // Clean up all listeners when component unmounts
    return () => {
      if (postUnsubscribe) postUnsubscribe();
      if (repliesUnsubscribe) repliesUnsubscribe();
    };
  }, [forumId, userId]);

  // Add effect to fetch user's liked replies
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

  // Fetch profile pictures for replies
  useEffect(() => {
    const fetchReplyProfilePictures = async () => {
      if (!replies.length) return;

      const profilePictures: { [key: string]: string } = {};

      for (const reply of replies) {
        if (!reply.authorId) continue;

        try {
          let profilePictureUrl = "";

          if (reply.authorRole === "psychiatrist") {
            // For psychiatrists, use the "image" field
            const psychiatristDoc = await getDoc(
              doc(db, "psychiatrists", reply.authorId)
            );
            if (psychiatristDoc.exists()) {
              const psychiatristData = psychiatristDoc.data();
              profilePictureUrl = psychiatristData.image || "";
            }
          } else {
            // For users, use the "profilePicture" field
            const userDoc = await getDoc(doc(db, "users", reply.authorId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              profilePictureUrl = userData.profilePicture || "";
            }
          }

          if (profilePictureUrl) {
            profilePictures[reply.authorId] = profilePictureUrl;
          }
        } catch (error) {
          console.error(
            `Error fetching profile picture for ${reply.authorId}:`,
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
        // Unlike
        await updateDoc(userRef, {
          likedPosts: arrayRemove(forumId),
        });
        await updateDoc(postRef, {
          likeCount: localLikeCount - 1,
        });
        setLocalLikeCount((prev) => prev - 1);
      } else {
        // Like
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

  const handleSubmitReply = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!newReply.trim() || !userId) return;

    try {
      const replyData = {
        userId,
        content: newReply,
        likeCount: 0,
        timeCreated: serverTimestamp(),
        profileImage: null,
      };

      if (parentId) {
        // Add to nested reply collection
        await addDoc(
          collection(db, "forum", forumId, "reply", parentId, "reply"),
          replyData
        );
      } else {
        // Add to main reply collection
        await addDoc(collection(db, "forum", forumId, "reply"), replyData);
      }

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

      // Check if reply exists
      const replySnap = await getDoc(replyRef);
      if (!replySnap.exists()) {
        console.error("Reply not found");
        return;
      }

      const currentLikeCount = replySnap.data().likeCount || 0;
      const isLiked = likedReplies[replyId];

      if (isLiked) {
        // Unlike reply
        await updateDoc(replyRef, {
          likeCount: Math.max(0, currentLikeCount - 1),
        });

        // Update user's likedReplies
        const updatedLikedReplies = { ...likedReplies };
        delete updatedLikedReplies[replyId];

        await updateDoc(userRef, {
          likedReplies: updatedLikedReplies,
        });

        setLikedReplies(updatedLikedReplies);
      } else {
        // Like reply
        await updateDoc(replyRef, {
          likeCount: currentLikeCount + 1,
        });

        // Update user's likedReplies
        const updatedLikedReplies = {
          ...likedReplies,
          [replyId]: true,
        };

        await updateDoc(userRef, {
          likedReplies: updatedLikedReplies,
        });

        setLikedReplies(updatedLikedReplies);
      }
    } catch (error) {
      console.error("Error updating reply like:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    // Add null check
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
      // Add report to reports subcollection of the forum post
      const reportsRef = collection(db, "forum", forumId, "reports");
      await addDoc(reportsRef, {
        reportContent: reportReason,
        reportedBy: userId,
        timestamp: serverTimestamp(),
      });

      // Check if post contains profanity
      if (post && containsProfanity(post)) {
        try {
          // Delete the post if it contains profanity
          await deleteDoc(doc(db, "forum", forumId));

          // Add to removed posts collection for audit
          await addDoc(collection(db, "removedPosts"), {
            originalId: forumId,
            title: post.title,
            content: post.content,
            userId: post.userId,
            removedAt: serverTimestamp(),
            reason: "Automatic removal due to profanity",
            reportReason: reportReason,
          });

          // Redirect to forum home if post is deleted
          navigate("/forum");
          return;
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

  // Add a function to handle reply reporting
  const handleReplyReport = (replyId: string) => {
    setSelectedReplyId(replyId);
    setShowReplyReportModal(true);
  };

  // Add function to submit reply report
  const submitReplyReport = async () => {
    if (!reportReplyReason.trim() || !userId || !forumId || !selectedReplyId)
      return;

    setIsReplyReportSubmitting(true);
    try {
      // Get the reply content
      const replyRef = doc(db, "forum", forumId, "reply", selectedReplyId);
      const replySnap = await getDoc(replyRef);

      if (!replySnap.exists()) {
        throw new Error("Reply not found");
      }

      const replyData = replySnap.data();
      const replyContent = replyData.content || "";

      // Check if reply contains profanity
      const isProfane = containsProfanity(replyContent);

      // Store the report in a subcollection of the reply
      const reportsRef = collection(replyRef, "reports");
      await addDoc(reportsRef, {
        reportContent: reportReplyReason,
        reportedBy: userId,
        timestamp: serverTimestamp(),
      });

      // If profane, mark as violation immediately
      if (isProfane) {
        await updateDoc(replyRef, {
          isViolation: true,
          reportedBy: userId,
          reportedAt: serverTimestamp(),
        });
      }

      // Close modal and reset state
      setShowReplyReportModal(false);
      setReportReplyReason("");
      setSelectedReplyId(null);
    } catch (error) {
      console.error("Error submitting reply report:", error);
    } finally {
      setIsReplyReportSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="min-h-screen bg-[#F2EDE2] p-6">
      {/* Main post */}
      <div className="max-w-4xl mx-auto bg-[#E4DCCC] rounded-lg p-6 mb-6">
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
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-[#161F36]">
              {getDisplayName(postAuthor)}
            </h3>
            {postAuthor?.role === "psychiatrist" && postAuthor.specialty && (
              <span className="text-sm text-gray-600">
                {postAuthor.specialty}
              </span>
            )}
          </div>
          <div className="ml-auto">
            <button
              onClick={handleReport}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Laporkan postingan ini"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#161F36] mb-4">{post.title}</h1>
        <p className="text-gray-700 mb-4">{post.content}</p>

        {/* Categories */}
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

        <div className="flex justify-between items-center text-gray-600">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
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
            <span className="flex items-center gap-1">
              <MessageSquare size={18} />
              {replies.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
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
            className="flex-1 p-3 rounded-lg border border-gray-300 bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#BACBD8] text-[#161F36] rounded-lg hover:bg-[#9FB6C6]"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Replies */}
      <div className="max-w-4xl mx-auto space-y-4">
        {replies.map((reply) => (
          <div key={reply.id} className="bg-white rounded-lg p-4 shadow">
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
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-[#161F36] text-sm">
                  {getDisplayName(reply.author)}
                </h4>
                {reply.author?.role === "psychiatrist" &&
                  reply.author.specialty && (
                    <span className="text-xs text-gray-500">
                      {reply.author.specialty}
                    </span>
                  )}
              </div>

              {/* Add Report Button for Reply */}
              <button
                onClick={() => handleReplyReport(reply.id)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Laporkan balasan ini"
              >
                <Flag size={14} />
              </button>
            </div>

            {/* Reply content - only show warning if marked as violation */}
            {reply.isViolation ? (
              <p className="text-gray-500 italic mb-2">
                Informasi yang diberikan oleh pengguna ini menyalahgunakan
                syarat dan ketentuan dari penggunaan forum diskusi
              </p>
            ) : (
              <p className="text-gray-800 mb-2">{reply.content}</p>
            )}

            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleReplyLike(reply.id)}
                  className={`flex items-center gap-1`}
                >
                  <div className="flex items-center bg-[#F8F0E0] rounded-md px-2 py-1">
                    <ThumbsUp
                      size={16}
                      className="mr-1"
                      color="#5A6B7D"
                      fill={likedReplies[reply.id] ? "#BACBD8" : "none"}
                      strokeWidth={1.5}
                    />
                    <span className="text-[#5A6B7D] font-medium">
                      {reply.likeCount || 0}
                    </span>
                  </div>
                </button>
                <span>
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

      {/* Report Modal for Reply */}
      {showReplyReportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowReplyReportModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Laporkan Balasan</h3>
            <p className="text-sm text-gray-600 mb-4">
              Silakan berikan alasan mengapa Anda ingin melaporkan balasan ini.
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#BACBD8]"
              placeholder="Tuliskan alasan laporan..."
              value={reportReplyReason}
              onChange={(e) => setReportReplyReason(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setShowReplyReportModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-[#BACBD8] text-[#161F36] rounded-md hover:bg-[#9FB6C6] transition-colors disabled:opacity-50"
                onClick={submitReplyReport}
                disabled={!reportReplyReason.trim() || isReplyReportSubmitting}
              >
                {isReplyReportSubmitting ? (
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
    </div>
  );
};

export default ForumPost;
