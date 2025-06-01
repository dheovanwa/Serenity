import React, { useState, useRef, useEffect } from "react";
import searchIcon from "../assets/search1.png"; // Asumsi ikon ini hitam/gelap
import chevronDownIcon from "../assets/con1.png"; // Asumsi ikon ini hitam/gelap
import SparklingIcon from "../assets/Sparkling.svg"; // Asumsi ikon ini mungkin sudah berwarna (misal: emas/putih)
import PsychiatristSearchProfile from "../components/PsychiatristSearchProfile";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  getContentBasedRecommendations,
  getUserPreferencesFromProfile,
} from "../utils/recommendation";
import { UserProfile, Psikolog } from "../models/types";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Import logo dark dan light untuk komponen ini jika perlu
import logoLight from "../assets/Logo - Light.png"; // Contoh, jika logo muncul di sini
import logoDark from "../assets/Logo - Dark.png"; // Contoh, jika logo muncul di sini
import Footer from "../components/Footer";

interface Psychiatrist {
  id?: string;
  name: string;
  specialty: string;
  price: number;
  rating: number;
  tahunPengalaman: number;
  jadwal: {
    [key: string]: { start: number; end: number } | null;
  };
  image: string;
}

// Tambahkan isDarkMode ke props SearchPsikiater
interface SearchPsikiaterProps {
  isDarkMode: boolean;
}

const AscendingIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="dark:text-white" // Ikon SVG bisa langsung diwarnai ulang
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
    className="dark:text-white" // Ikon SVG bisa langsung diwarnai ulang
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

const specialties = [
  "Psikolog Klinis",
  "Psikolog Anak & Remaja",
  "Psikolog Industri dan Organisasi",
  "Psikolog Pendidikan",
  "Konselor Pernikahan dan Keluarga",
  "Konselor Adiksi",
  "Terapis / Konselor Umum",
];

const SearchPsikiater: React.FC<SearchPsikiaterProps> = ({ isDarkMode }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("ascending");
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [psychiatrists, setPsychiatrists] = useState<Psychiatrist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPsychiatrists = async () => {
      try {
        setIsLoading(true);
        const psychiatristsRef = collection(db, "psychiatrists");
        const querySnapshot = await getDocs(psychiatristsRef);

        const fetchedPsychiatrists: Psychiatrist[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPsychiatrists.push({
            id: doc.id,
            ...doc.data(),
          } as Psychiatrist);
        });

        setPsychiatrists(fetchedPsychiatrists);
      } catch (error) {
        console.error("Error fetching psychiatrists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPsychiatrists();
  }, []);

  useEffect(() => {
    // Fetch user profile from Firestore
    const fetchUserProfile = async () => {
      try {
        const auth = getAuth();
        // Tunggu hingga auth state siap
        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            setUserProfile(null);
            return;
          }
          const userId = user.uid;
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("uid", "==", userId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            setUserProfile({ uid: docSnap.id, ...docSnap.data() });
          } else {
            setUserProfile(null);
          }
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
        setIsOrderOpen(false);
        setIsSpecialtyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClear = () => {
    setSearchText("");
    setSelectedSort("");
    setSortOrder("ascending");
    setSelectedSpecialty("");
  };

  const handleSelectSort = (sortOption: string) => {
    setSelectedSort(sortOption);
    setIsSortOpen(false);
  };

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    setIsOrderOpen(false);
  };

  const handleSelectSpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setIsSpecialtyOpen(false);
  };

  const filteredPsychiatrists = psychiatrists.filter((psychiatrist) => {
    const matchesSearch = searchText
      ? psychiatrist.name.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesSpecialty = selectedSpecialty
      ? psychiatrist.specialty === selectedSpecialty
      : true;
    return matchesSearch && matchesSpecialty;
  });

  // Use content-based recommendation for sorting
  const userPreferences = userProfile
    ? getUserPreferencesFromProfile(userProfile)
    : { preferredSpecialties: [], preferredGayaInteraksi: [] };
  const recommendedPsychiatrists = getContentBasedRecommendations(
    filteredPsychiatrists as Psikolog[],
    userPreferences
  );

  // Sort psychiatrists: if jadwal[today] === null, group them at the bottom
  const isNotAvailableToday = (psychiatrist: Psychiatrist): boolean => {
    const days = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    const today = days[new Date().getDay()];
    return !psychiatrist.jadwal || psychiatrist.jadwal[today] === null;
  };

  const sortedPsychiatrists = (() => {
    const list =
      recommendedPsychiatrists.length > 0
        ? recommendedPsychiatrists
        : filteredPsychiatrists;
    const available = [];
    const holiday = [];
    for (const psy of list) {
      if (isNotAvailableToday(psy)) {
        holiday.push(psy);
      } else {
        available.push(psy);
      }
    }
    return [...available, ...holiday];
  })();

  const sortPsychiatrists = (
    list: Psychiatrist[],
    option: string,
    order: string
  ) => {
    return [...list].sort((a, b) => {
      const aAvailable = !isNotAvailableToday(a);
      const bAvailable = !isNotAvailableToday(b);
      if (aAvailable !== bAvailable) {
        return aAvailable ? -1 : 1;
      }
      switch (option) {
        case "Rating":
          return order === "ascending"
            ? a.rating - b.rating
            : b.rating - a.rating;
        case "Harga":
          return order === "ascending" ? a.price - b.price : b.price - a.price;
        case "Tahun Pengalaman":
          return order === "ascending"
            ? a.tahunPengalaman - b.tahunPengalaman
            : b.tahunPengalaman - a.tahunPengalaman;
        default:
          return 0;
      }
    });
  };

  // const sortedPsychiatrists = sortPsychiatrists(
  //   filteredPsychiatrists,
  //   selectedSort,
  //   sortOrder
  // );

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-[#F2EDE2] dark:bg-[#161F36] flex flex-col overflow-x-hidden transition-colors duration-300" // Background utama halaman
    >
      <div className="max-w-6xl mt-10 flex flex-col justify-start items-start sm:ml-5 md:ml-6 lg:ml-30 xl:ml-35 2xl:ml-53 mb-8 px-4 sm:px-8 md:px-12">
        <h1 className="text-4xl font-bold text-[#161F36] dark:text-white text-center sm:text-left">
          Cari Psikolog
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center sm:text-left">
          Temukan psikolog terbaik kami disini
        </p>
      </div>
      <div className="mt-10 pt-6 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="w-full sm:w-[90%] lg:w-[75%] mx-auto flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 sm:w-[60%] lg:w-[70%]">
            {/* Magic Recommendation Button */}

            <div className="relative flex-grow">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Cari ahli medis pilihanmu..."
                className="bg-transparent border-1 border-black text-[#161F36] p-2 rounded-md w-full h-[45px] pl-10 text-sm sm:text-base
                           dark:bg-[#161F36] dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors duration-300" // Input search
              />
              <img
                src={searchIcon}
                alt="Search Icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 dark:filter dark:invert" // Invert ikon search
              />
            </div>
            <button
              onClick={handleClear}
              className="bg-[#BACBD8] text-[#161F36] font-semibold rounded-md h-[45px] px-5 min-w-[120px]
                         dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#23385F] transition-colors duration-300" // Tombol Hapus
            >
              Hapus
            </button>
          </div>
          <div className="flex gap-3 w-full sm:w-auto z-20">
            {/* Dropdown Spesialisasi */}
            <div className="relative sm:w-[200px] w-full">
              <button
                onClick={() => setIsSpecialtyOpen(!isSpecialtyOpen)}
                className="p-2 rounded-md bg-[#BACBD8] text-[#161F36] font-semibold text-sm sm:text-base w-full h-[45px] flex justify-between items-center
                           hover:bg-blue-200 transition-all duration-300
                           dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#23385F]" // Tombol Pilih Spesialisasi
              >
                <span className="truncate">
                  {selectedSpecialty ? selectedSpecialty : "Pilih Spesialisasi"}
                </span>
                <img
                  src={chevronDownIcon}
                  alt="Dropdown Icon"
                  className={`w-4 h-4 ml-2 max-w-[24px] max-h-[24px] object-contain dark:filter  ${
                    // Invert ikon dropdown
                    isSpecialtyOpen ? "transform rotate-180" : ""
                  } transition-transform duration-300`}
                />
              </button>
              <div
                className={`absolute w-full mt-1 bg-[#BACBD8] rounded-md shadow-lg transition-opacity duration-300 z-30
                            dark:bg-[#1A2947] dark:shadow-xl ${
                              // Dropdown Spesialisasi content
                              isSpecialtyOpen
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none"
                            }`}
              >
                <ul className="space-y-1 max-h-60 overflow-auto">
                  <li
                    onClick={() => handleSelectSpecialty("")}
                    className="text-[#161F36] text-left font-bold text-sm p-2 cursor-pointer
                               hover:bg-blue-100 transition-colors duration-300
                               dark:text-white dark:hover:bg-[#23385F]" // Item dropdown "Semua Spesialisasi"
                  >
                    Semua Spesialisasi
                  </li>
                  {specialties.map((specialty) => (
                    <li
                      key={specialty}
                      onClick={() => handleSelectSpecialty(specialty)}
                      className="text-[#161F36] text-left font-base text-sm p-2 cursor-pointer
                                 hover:bg-blue-100 transition-colors duration-300
                                 dark:text-white dark:hover:bg-[#23385F]" // Item dropdown Spesialisasi
                    >
                      {specialty}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Dropdown Urut Berdasarkan */}
            <div className="relative sm:w-[200px] w-full">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  className="p-2 rounded-md bg-[#BACBD8] text-[#161F36] font-semibold text-sm sm:text-base md:text-base w-full h-[45px] flex justify-between items-center
                             hover:bg-blue-200 transition-all duration-300 min-w-[180px] max-w-[180px]
                             dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#23385F]" // Tombol Urut Berdasarkan
                  style={{ minWidth: 180, maxWidth: 180 }}
                >
                  <span
                    className="ml-1 mr-5 truncate"
                    style={{ maxWidth: "100%" }}
                  >
                    {selectedSort ? selectedSort : "Urut berdasarkan"}
                  </span>
                  <img
                    src={chevronDownIcon}
                    alt="Dropdown Icon"
                    className={`w-4 h-4 mr-1 max-w-[24px] max-h-[24px] object-contain dark:filter${
                      // Invert ikon dropdown
                      isSortOpen ? "transform rotate-180" : ""
                    } transition-transform duration-300`}
                  />
                </button>
                <button
                  onClick={() =>
                    setSortOrder((prev) =>
                      prev === "ascending" ? "descending" : "ascending"
                    )
                  }
                  className="p-2 rounded-md bg-[#BACBD8] text-[#161F36] hover:bg-blue-200 transition-all duration-300 flex items-center justify-center w-[45px]
                             dark:bg-[#1A2947] dark:text-white dark:hover:bg-[#23385F]" // Tombol Asc/Desc
                  title={
                    sortOrder === "ascending"
                      ? "Sort Ascending"
                      : "Sort Descending"
                  }
                >
                  {sortOrder === "ascending" ? (
                    <AscendingIcon />
                  ) : (
                    <DescendingIcon />
                  )}
                </button>
              </div>
              <div
                className={`absolute w-full mt-1 bg-[#BACBD8] rounded-md shadow-lg transition-opacity duration-300 ${
                  isSortOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }
                dark:bg-[#1A2947] dark:shadow-xl`} // Dropdown Urut Berdasarkan content
                style={{ minWidth: 180, maxWidth: 180 }}
              >
                <ul className="space-y-2">
                  <li
                    onClick={() => handleSelectSort("Rating")}
                    className="text-[#161F36] text-left font-base text-sm sm:text-base md:text-base p-2 cursor-pointer
                               hover:bg-blue-100 transition-colors duration-300
                               dark:text-white dark:hover:bg-[#23385F]" // Item dropdown
                  >
                    Rating
                  </li>
                  <li
                    onClick={() => handleSelectSort("Harga")}
                    className="text-[#161F36] text-left font-base text-sm sm:text-base md:text-base p-2 cursor-pointer
                               hover:bg-blue-100 transition-colors duration-300
                               dark:text-white dark:hover:bg-[#23385F]" // Item dropdown
                  >
                    Harga
                  </li>
                  <li
                    onClick={() => handleSelectSort("Tahun Pengalaman")}
                    className="text-[#161F36] text-left font-base text-sm sm:text-base md:text-base p-2 cursor-pointer
                               hover:bg-blue-100 transition-colors duration-300
                               dark:text-white dark:hover:bg-[#23385F]" // Item dropdown
                  >
                    Tahun Pengalaman
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Kontainer daftar psikiater */}
        <div
          className="bg-transparent w-[95%] max-w-full max-h-[600px] sm:w-[90%] md:w-[85%] lg:w-[80%] h-auto sm:h-[600px] overflow-auto mx-auto p-4 sm:p-8 lg:p-12 mt-4 mb-8"
          style={{
            width: "80%",
            height: "auto",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#888 transparent",
          }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10 justify-items-center">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center bg-[#F8F0E0] p-4 rounded-lg shadow-xl hover:shadow-lg transition-all duration-300
                             dark:bg-gray-800 dark:shadow-md" // Skeleton loading card background
                >
                  <div className="w-full max-w-[213px] h-[320px] bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>{" "}
                  {/* Skeleton elements */}
                  <div className="w-36 h-6 bg-gray-200 rounded mt-2 animate-pulse dark:bg-gray-700"></div>
                  <div className="w-44 h-4 bg-gray-200 rounded mt-2 animate-pulse dark:bg-gray-700"></div>
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                    <div className="w-20 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                  </div>
                  <div className="w-[160px] h-9 bg-gray-200 rounded-[10px] mt-4 animate-pulse dark:bg-gray-700"></div>
                  <button className="w-[173px] h-9 bg-gray-200 rounded-[10px] mt-4 animate-pulse dark:bg-gray-700"></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10 justify-items-center">
              {sortedPsychiatrists.map((psychiatrist, index) => (
                <PsychiatristSearchProfile
                  key={psychiatrist.id || index}
                  id={psychiatrist.id}
                  name={psychiatrist.name}
                  specialty={psychiatrist.specialty}
                  price={psychiatrist.price}
                  rating={psychiatrist.rating}
                  tahunPengalaman={psychiatrist.tahunPengalaman}
                  jadwal={psychiatrist.jadwal || {}}
                  image={psychiatrist.image}
                  isDarkMode={isDarkMode} // Teruskan prop isDarkMode ke komponen anak
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPsikiater;
