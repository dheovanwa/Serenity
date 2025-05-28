import React, { useState, useEffect, useRef, useCallback } from "react";
import ForumPostCard from "../components/ForumPostCard";
import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import CreatePostModal from "../components/CreatePostModal";
import { ChevronDown } from "lucide-react";

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
  authorName?: string;
  authorGender?: string;
  authorBirthDate?: string;
  specialty?: string; // Add specialty field
}

const Forum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState("Waktu");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("descending");
  const [visiblePosts, setVisiblePosts] = useState<number>(5); // Initially show 5 posts
  const [userPosts, setUserPosts] = useState<ForumPost[]>([]);
  const [visibleUserPosts, setVisibleUserPosts] = useState<number>(5);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const loadMoreUserPostsRef = useRef<HTMLDivElement | null>(null);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("documentId");

        // Get user's liked posts
        let userLikedPosts: string[] = [];
        if (userId) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            userLikedPosts = userDoc.data().likedPosts || [];
          }
        }

        // Use onSnapshot instead of getDocs for real-time updates
        const forumRef = collection(db, "forum");
        const q = query(forumRef, orderBy("timeCreated", "desc"));

        const unsubscribe = onSnapshot(
          q,
          async (querySnapshot) => {
            const fetchedPosts: ForumPost[] = [];

            for (const docSnap of querySnapshot.docs) {
              const data = docSnap.data();

              // Get user data for profile image and personal info
              let profileImage = null;
              let userRole = "user";
              let authorName = "";
              let authorGender = "";
              let authorBirthDate = "";
              let specialty = "";

              // Check in users collection first
              const userDocRef = doc(db, "users", data.userId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                const userData = userDoc.data();
                profileImage = userData.profileImage || null;
                userRole = "user";
                authorName = userData.firstName
                  ? `${userData.firstName} ${userData.lastName || ""}`.trim()
                  : "User";
                authorGender = userData.sex || "";
                authorBirthDate = userData.birthOfDate || "";
              } else {
                // If not found in users, check psychiatrists
                const psyDocRef = doc(db, "psychiatrists", data.userId);
                const psyDoc = await getDoc(psyDocRef);
                if (psyDoc.exists()) {
                  const psyData = psyDoc.data();
                  profileImage = psyData.photoURL || null;
                  userRole = "psychiatrist";
                  authorName = `Dr. ${psyData.name}`;
                  specialty = psyData.specialty || ""; // Get specialty
                }
              }

              // Get reply count by getting collection size
              const replyCollectionRef = collection(docSnap.ref, "reply");
              const replySnapshot = await getDocs(replyCollectionRef);

              fetchedPosts.push({
                id: docSnap.id,
                title: data.title,
                content: data.content,
                userId: data.userId,
                likeCount: data.likeCount || 0,
                category: data.category || [],
                timeCreated: data.timeCreated,
                replyCount: replySnapshot.size,
                profileImage,
                userRole,
                authorName,
                authorGender,
                authorBirthDate,
                specialty,
                isLiked: userLikedPosts.includes(docSnap.id),
              });
            }

            setPosts(fetchedPosts);
            localStorage.setItem(
              "cachedForumPosts",
              JSON.stringify(fetchedPosts)
            );
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching posts:", error);
            // If snapshot listener fails, try to use cached data
            const cached = localStorage.getItem("cachedForumPosts");
            if (cached) {
              setPosts(JSON.parse(cached));
            }
            setLoading(false);
          }
        );

        // Return the unsubscribe function to clean up the listener
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up forum listener:", error);
        setLoading(false);
        // Try to use cached data if available
        const cached = localStorage.getItem("cachedForumPosts");
        if (cached) {
          setPosts(JSON.parse(cached));
        }
      }
    };

    const unsubscribe = fetchPosts();

    // Clean up the listener when component unmounts
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const handleCreatePost = async (post: {
    title: string;
    content: string;
    category: string[];
  }) => {
    try {
      const userId = localStorage.getItem("documentId");
      if (!userId) {
        alert("Please login first");
        return;
      }

      const forumRef = collection(db, "forum");
      await addDoc(forumRef, {
        ...post,
        userId,
        likeCount: 0,
        category: post.category,
        timeCreated: serverTimestamp(),
      });

      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  };

  // Add sorting icons components
  const AscendingIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20V4M12 4L6 10M12 4L18 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const DescendingIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4V20M12 20L18 14M12 20L6 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const handleSelectSort = (sortOption: string) => {
    setSelectedSort(sortOption);
    setIsSortOpen(false);
  };

  const sortPosts = (posts: any[]) => {
    return [...posts].sort((a, b) => {
      const multiplier = sortOrder === "ascending" ? 1 : -1;
      switch (selectedSort) {
        case "Like":
          return (a.likeCount - b.likeCount) * multiplier;
        case "Waktu":
          return (a.timeCreated.seconds - b.timeCreated.seconds) * multiplier;
        default:
          return b.timeCreated.seconds - a.timeCreated.seconds;
      }
    });
  };

  // Implement infinite scroll with Intersection Observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && visiblePosts < posts.length) {
        setVisiblePosts((prev) => prev + 5); // Load 5 more posts when scrolling down
      }
    },
    [visiblePosts, posts.length]
  );

  // Set up the intersection observer
  useEffect(() => {
    const options = {
      root: null, // Use viewport as root
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, options);

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [handleObserver, loadMoreRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get sorted posts but limit the number displayed
  // Filter out current user's posts from "Semua Diskusi" section
  const userId = localStorage.getItem("documentId");
  const displayedPosts = sortPosts(posts)
    .filter((post) => post.userId !== userId) // Filter out current user's posts
    .slice(0, visiblePosts);

  const displayedUserPosts = sortPosts(userPosts).slice(0, visibleUserPosts);

  // Add function to handle "View More" button click
  const handleViewMoreUserPosts = () => {
    setVisibleUserPosts((prev) => Math.min(prev + 5, userPosts.length));
  };

  // Add effect to fetch current user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const userId = localStorage.getItem("documentId");
        if (!userId) return;

        const forumRef = collection(db, "forum");
        const q = query(
          forumRef,
          where("userId", "==", userId),
          orderBy("timeCreated", "desc")
        );

        const unsubscribe = onSnapshot(
          q,
          async (querySnapshot) => {
            const fetchedPosts: ForumPost[] = [];

            for (const docSnap of querySnapshot.docs) {
              const data = docSnap.data();

              // Get user data for profile image and personal info
              let profileImage = null;
              let userRole = "user";
              let authorName = "";
              let authorGender = "";
              let authorBirthDate = "";
              let specialty = "";

              // Check in users collection first
              const userDocRef = doc(db, "users", data.userId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                const userData = userDoc.data();
                profileImage = userData.profileImage || null;
                userRole = "user";
                authorName = userData.firstName
                  ? `${userData.firstName} ${userData.lastName || ""}`.trim()
                  : "User";
                authorGender = userData.sex || "";
                authorBirthDate = userData.birthOfDate || "";
              } else {
                // If not found in users, check psychiatrists
                const psyDocRef = doc(db, "psychiatrists", data.userId);
                const psyDoc = await getDoc(psyDocRef);
                if (psyDoc.exists()) {
                  const psyData = psyDoc.data();
                  profileImage = psyData.photoURL || null;
                  userRole = "psychiatrist";
                  authorName = `Dr. ${psyData.name}`;
                  specialty = psyData.specialty || ""; // Get specialty
                }
              }

              // Get reply count
              const replyCollectionRef = collection(docSnap.ref, "reply");
              const replySnapshot = await getDocs(replyCollectionRef);

              fetchedPosts.push({
                id: docSnap.id,
                title: data.title,
                content: data.content,
                userId: data.userId,
                likeCount: data.likeCount || 0,
                category: data.category || [],
                timeCreated: data.timeCreated,
                replyCount: replySnapshot.size,
                profileImage,
                userRole,
                authorName,
                authorGender,
                authorBirthDate,
                specialty,
                isLiked: false, // Will be updated in a separate check
              });
            }

            // Check which posts are liked by the user
            if (userId) {
              const userDoc = await getDoc(doc(db, "users", userId));
              if (userDoc.exists()) {
                const likedPosts = userDoc.data().likedPosts || [];
                fetchedPosts.forEach((post) => {
                  post.isLiked = likedPosts.includes(post.id);
                });
              }
            }

            setUserPosts(fetchedPosts);
          },
          (error) => {
            console.error("Error fetching user posts:", error);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up user posts listener:", error);
      }
    };

    const unsubscribe = fetchUserPosts();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Implement infinite scroll for user posts with Intersection Observer
  const handleUserPostsObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && visibleUserPosts < userPosts.length) {
        setVisibleUserPosts((prev) => prev + 5); // Load 5 more posts when scrolling down
      }
    },
    [visibleUserPosts, userPosts.length]
  );

  // Set up the intersection observer for user posts
  useEffect(() => {
    const options = {
      root: null, // Use viewport as root
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleUserPostsObserver, options);

    if (loadMoreUserPostsRef.current) {
      observer.observe(loadMoreUserPostsRef.current);
    }

    return () => {
      if (loadMoreUserPostsRef.current) {
        observer.unobserve(loadMoreUserPostsRef.current);
      }
    };
  }, [handleUserPostsObserver, loadMoreUserPostsRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F2EDE2] p-6">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-[#161F36] mb-4">
          Forum Diskusi
        </h1>
        <p className="text-gray-600 mb-6">
          Berbagi pengalaman dan dukungan dalam komunitas yang aman
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#BACBD8] text-[#161F36] px-6 py-2 rounded-lg hover:bg-[#9FB6C6] transition-colors font-semibold"
        >
          Buat Diskusi Baru
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Cari diskusi..."
          className="flex-grow p-2 rounded-lg border border-gray-300 bg-white"
        />

        {/* Sort Controls */}
        <div className="flex gap-2">
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="p-2 rounded-md bg-[#BACBD8] text-[#161F36] font-semibold h-[45px] flex justify-between items-center hover:bg-[#9FB6C6] transition-all duration-300 min-w-[180px]"
            >
              <span className="ml-1 mr-5">
                {selectedSort || "Urut berdasarkan"}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isSortOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {/* Sort Dropdown */}
            <div
              className={`absolute w-full mt-1 bg-[#BACBD8] rounded-md shadow-lg transition-opacity duration-300 ${
                isSortOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ul className="space-y-2">
                <li
                  onClick={() => handleSelectSort("Like")}
                  className="text-[#161F36] text-left font-base p-2 cursor-pointer hover:bg-[#9FB6C6] transition-colors duration-300"
                >
                  Like
                </li>
                <li
                  onClick={() => handleSelectSort("Waktu")}
                  className="text-[#161F36] text-left font-base p-2 cursor-pointer hover:bg-[#9FB6C6] transition-colors duration-300"
                >
                  Waktu
                </li>
              </ul>
            </div>
          </div>

          {/* Sort Order Button */}
          <button
            onClick={() =>
              setSortOrder((prev) =>
                prev === "ascending" ? "descending" : "ascending"
              )
            }
            className="p-2 rounded-md bg-[#BACBD8] text-[#161F36] hover:bg-[#9FB6C6] transition-all duration-300 flex items-center justify-center w-[45px]"
            title={
              sortOrder === "ascending" ? "Sort Ascending" : "Sort Descending"
            }
          >
            {sortOrder === "ascending" ? <AscendingIcon /> : <DescendingIcon />}
          </button>
        </div>
      </div>

      {/* User Posts Section */}
      {userPosts.length > 0 && (
        <div className="max-w-6xl mx-auto mt-6 mb-10">
          <h2 className="text-2xl font-bold text-[#161F36] mb-4">
            Diskusi Saya
          </h2>
          <div className="space-y-4">
            {displayedUserPosts.map((post) => (
              <ForumPostCard key={post.id} post={post} />
            ))}

            {/* View More button for user posts */}
            {visibleUserPosts < userPosts.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleViewMoreUserPosts}
                  className="bg-[#BACBD8] text-[#161F36] px-6 py-2 rounded-md hover:bg-[#9FB6C6] transition-colors font-medium"
                >
                  Lihat Lebih Banyak
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Posts Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-[#161F36] mb-4">
          Semua Diskusi
        </h2>
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}

          {/* Loading indicator and load more trigger */}
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {visiblePosts < posts.length && (
              <div className="text-gray-500">Loading more posts...</div>
            )}
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default Forum;
