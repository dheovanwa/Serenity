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
import { ChevronDown } from "lucide-react"; // Import ChevronDown dari lucide-react

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
  specialty?: string;
  isLiked?: boolean;
}

interface ForumProps {
  isDarkMode: boolean;
}

const Forum: React.FC<ForumProps> = ({ isDarkMode }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState("Waktu");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("descending");
  const [visiblePosts, setVisiblePosts] = useState<number>(5);
  const [userPosts, setUserPosts] = useState<ForumPost[]>([]);
  const [visibleUserPosts, setVisibleUserPosts] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const loadMoreUserPostsRef = useRef<HTMLDivElement | null>(null);
  const [profilePictures, setProfilePictures] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("documentId");

        let userLikedPosts: string[] = [];
        if (userId) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            userLikedPosts = userDoc.data()?.likedPosts || [];
          }
        }

        const forumRef = collection(db, "forum");
        const q = query(forumRef, orderBy("timeCreated", "desc"));

        const unsubscribe = onSnapshot(
          q,
          async (querySnapshot) => {
            const fetchedPosts: ForumPost[] = [];

            for (const docSnap of querySnapshot.docs) {
              const data = docSnap.data();

              let profileImage = null;
              let userRole: "user" | "psychiatrist" = "user";
              let authorName = "";
              let authorGender = "";
              let authorBirthDate = "";
              let specialty = "";

              const psyDocRef = doc(db, "psychiatrists", data.userId);
              const psyDoc = await getDoc(psyDocRef);
              if (psyDoc.exists()) {
                const psyData = psyDoc.data();
                profileImage = psyData.image || null;
                userRole = "psychiatrist";
                authorName = `Dr. ${psyData.name}`;
                specialty = psyData.specialty || "";
              } else {
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
                }
              }

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
                isLiked: false,
              });
            }

            if (userId) {
              const userDoc = await getDoc(doc(db, "users", userId));
              if (userDoc.exists()) {
                const likedPosts = userDoc.data()?.likedPosts || [];
                fetchedPosts.forEach((post) => {
                  post.isLiked = likedPosts.includes(post.id);
                });
              }
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
            const cached = localStorage.getItem("cachedForumPosts");
            if (cached) {
              setPosts(JSON.parse(cached));
            }
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up forum listener:", error);
        setLoading(false);
        const cached = localStorage.getItem("cachedForumPosts");
        if (cached) {
          setPosts(JSON.parse(cached));
        }
      }
    };

    const unsubscribe = fetchPosts();
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

  const AscendingIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#161F36] dark:text-white"
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
      className="text-[#161F36] dark:text-white"
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

  const filterAndSortPosts = (posts: ForumPost[]) => {
    let filtered = posts;

    if (searchQuery.trim() !== "") {
      const normalizedQuery = searchQuery.toLowerCase().trim();

      const titleMatches = filtered.filter((post) =>
        post.title.toLowerCase().includes(normalizedQuery)
      );

      const contentOnlyMatches = filtered.filter(
        (post) =>
          !post.title.toLowerCase().includes(normalizedQuery) &&
          post.content.toLowerCase().includes(normalizedQuery)
      );

      filtered = [...titleMatches, ...contentOnlyMatches];
    }

    return filtered.sort((a, b) => {
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

  const userId = localStorage.getItem("documentId");
  const filteredPosts = filterAndSortPosts(posts)
    .filter((post) => post.userId !== userId)
    .slice(0, visiblePosts);

  const filteredUserPosts = filterAndSortPosts(userPosts).slice(
    0,
    visibleUserPosts
  );

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && visiblePosts < posts.length) {
        setVisiblePosts((prev) => prev + 5);
      }
    },
    [visiblePosts, posts.length]
  );

  useEffect(() => {
    const options = {
      root: null,
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

  const displayedPosts = filteredPosts;
  const displayedUserPosts = filteredUserPosts;

  const handleViewMoreUserPosts = () => {
    setVisibleUserPosts((prev) => Math.min(prev + 5, userPosts.length));
  };

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

              let profileImage = null;
              let userRole: "user" | "psychiatrist" = "user";
              let authorName = "";
              let authorGender = "";
              let authorBirthDate = "";
              let specialty = "";

              const psyDocRef = doc(db, "psychiatrists", data.userId);
              const psyDoc = await getDoc(psyDocRef);
              if (psyDoc.exists()) {
                const psyData = psyDoc.data();
                profileImage = psyData.image || null;
                userRole = "psychiatrist";
                authorName = `Dr. ${psyData.name}`;
                specialty = psyData.specialty || "";
              } else {
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
                }
              }

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
                isLiked: false,
              });
            }

            if (userId) {
              const userDoc = await getDoc(doc(db, "users", userId));
              if (userDoc.exists()) {
                const likedPosts = userDoc.data()?.likedPosts || [];
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

  const handleUserPostsObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && visibleUserPosts < userPosts.length) {
        setVisibleUserPosts((prev) => prev + 5);
      }
    },
    [visibleUserPosts, userPosts.length]
  );

  useEffect(() => {
    const options = {
      root: null,
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

  return (
    <div
      className="min-h-screen p-6 transition-colors duration-300
                    bg-[#F2EDE2] dark:bg-[#161F36]"
    >
      {" "}
      {/* Main background */}
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-4 text-[#161F36] dark:text-white">
          {" "}
          {/* Title */}
          Forum Diskusi
        </h1>
        <p className="text-gray-600 mb-6 dark:text-gray-300">
          {" "}
          {/* Description */}
          Berbagi pengalaman dan dukungan dalam komunitas yang aman
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#BACBD8] text-[#161F36] px-6 py-2 rounded-lg hover:bg-[#9FB6C6] transition-colors font-semibold
                     dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#293c63]" // Button
        >
          Buat Diskusi Baru
        </button>
      </div>
      {/* Filter and Search Section */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Cari diskusi..."
          className="flex-grow p-2 rounded-lg border border-gray-300 bg-white
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" // Search Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Sort Controls */}
        <div className="flex gap-2">
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="p-2 rounded-md bg-[#BACBD8] text-[#161F36] font-semibold h-[45px] flex justify-between items-center hover:bg-[#9FB6C6] transition-all duration-300 min-w-[180px]
                         dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#293c63]" // Sort Button
            >
              <span className="ml-1 mr-5">
                {selectedSort || "Urut berdasarkan"}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isSortOpen ? "transform rotate-180" : ""
                } ${
                  isDarkMode ? "text-white" : "text-[#161F36] dark:text-white"
                }`}
              />
            </button>

            {/* Sort Dropdown */}
            <div
              className={`absolute w-full mt-1 rounded-md shadow-lg transition-opacity duration-300 z-30
                          bg-[#BACBD8] dark:bg-[#1A2947] dark:shadow-xl ${
                            isSortOpen
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none"
                          }`}
            >
              <ul className="space-y-2">
                <li
                  onClick={() => handleSelectSort("Like")}
                  className={`text-left font-base p-2 cursor-pointer transition-colors duration-50 hover:rounded-tl-md hover:rounded-tr-md
                             ${
                               isDarkMode
                                 ? "text-white hover:bg-[#23385F]"
                                 : "text-[#161F36] hover:bg-[#9FB6C6] dark:text-white dark:hover:bg-[#4563a1]"
                             }`}
                >
                  Like
                </li>
                <li
                  onClick={() => handleSelectSort("Waktu")}
                  className={`text-left font-base p-2 cursor-pointer transition-colors duration-50 hover:rounded-bl-md hover:rounded-br-md
                             ${
                               isDarkMode
                                 ? "text-white hover:bg-[#23385F] dark:bg-[#1A2947]"
                                 : "text-[#161F36] hover:bg-[#9FB6C6] dark:text-white dark:hover:bg-[#293c63]"
                             }`}
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
            className="p-2 rounded-md text-[#161F36] hover:bg-[#9FB6C6] transition-all duration-300 flex items-center justify-center w-[45px]
                       bg-[#BACBD8] dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#293c63]"
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
          <h2 className="text-2xl font-bold mb-4 text-[#161F36] dark:text-white">
            Diskusi Saya
          </h2>
          <div className="space-y-4">
            {displayedUserPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                isDarkMode={isDarkMode}
              />
            ))}

            {visibleUserPosts < userPosts.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleViewMoreUserPosts}
                  className="bg-[#BACBD8] text-[#161F36] px-6 py-2 rounded-md hover:bg-[#9FB6C6] transition-colors font-medium
                             dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#293c63]"
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
        <h2 className="text-2xl font-bold mb-4 text-[#161F36] dark:text-white">
          Semua Diskusi
        </h2>
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                isDarkMode={isDarkMode}
              />
            ))}

            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {visiblePosts < posts.length && (
                <div className="text-gray-500 dark:text-gray-400">
                  Loading more posts...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg text-center dark:bg-[#1A2947]">
            <p className="text-gray-600 dark:text-gray-300">
              Tidak ada diskusi yang ditemukan
            </p>
          </div>
        )}
      </div>
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default Forum;
