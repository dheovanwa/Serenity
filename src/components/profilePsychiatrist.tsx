import TopBar from "../components/TopBar";
import InputField from "../components/inputField";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import cameraIcon from "../assets/83574.png";
import ProfilePic from "../assets/default_profile_image.svg";
import Compressor from "compressorjs";
import user from "../assets/User.svg";
import setting from "../assets/Settings.svg";
import chevronDownIcon from "../assets/con1.png";
import calender from "../assets/Calendar.svg";
import { Calendar } from "lucide-react";
import { Separator } from "../components/Seperator";

const PsychiatristProfile = () => {
  const [userName, setUserName] = useState("Loading...");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [errorFirstName, setErrorFirstName] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [profilePic, setProfilePic] = useState(ProfilePic); // State for profile picture
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for file input
  const [phoneError, setPhoneError] = useState(false);
  const [errorName, setErrorName] = useState(false);
  const [errorSpecialization, setErrorSpecialization] = useState(false);
  const [strError, setStrError] = useState(false);
  const [workSchedule, setWorkSchedule] = useState<{ [key: string]: string }>({
    // Will be loaded from Firestore
  });

  const [formData, setFormData] = useState({
    name: "dr. Elon Musk",
    specialization: "Sp, Kejiwaan Konsultan",
    alumnus: "Universitas Indonesia",
    email: "elon@example.com",
    practiceYear: "01/01/2001",
    strNumber: "QH0000000000003621",
    phoneNumber: "",
  });
  const [initialFormData, setInitialFormData] = useState({
    name: "",
    specialization: "",
    practiceAddress: "",
    alumnus: "",
    practiceYear: "",
    email: "",
    strNumber: "",
    phoneNumber: "",
  });

  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [isSettingsClicked, setIsSettingsClicked] = useState(false);
  const navigate = useNavigate();
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const handleLogoutClick = () => {
    setIsOverlayVisible(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayVisible(false);
  };
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileClicked(true);
    setIsSettingsClicked(false);
  };

  const handleSettingsClick = () => {
    setIsSettingsClicked(true);
    setIsProfileClicked(false);
  };
  useEffect(() => {
    const fetchUserData = async () => {
      const documentId = localStorage.getItem("documentId");
      if (!documentId) {
        navigate("/signin");
        return;
      }

      try {
        // Fetch psychiatrist data from psychiatrists collection
        const psyDocRef = doc(db, "psychiatrists", documentId);
        const psyDoc = await getDoc(psyDocRef);

        let psyData: any = null;
        if (psyDoc.exists()) {
          psyData = psyDoc.data();
          // Parse jadwal field
          if (psyData.jadwal) {
            const jadwal = psyData.jadwal;
            // Convert jadwal to display format
            const days = {
              senin: "Senin",
              selasa: "Selasa",
              rabu: "Rabu",
              kamis: "Kamis",
              jumat: "Jumat",
              sabtu: "Sabtu",
              minggu: "Minggu",
            };
            const schedule: { [key: string]: string } = {};
            Object.entries(days).forEach(([key, label]) => {
              const daySchedule = jadwal[key];
              if (!daySchedule || daySchedule === null) {
                schedule[label] = "Libur";
              } else {
                // Convert minutes to HH:MM
                const toTime = (min: number) => {
                  const h = Math.floor(min / 60)
                    .toString()
                    .padStart(2, "0");
                  const m = (min % 60).toString().padStart(2, "0");
                  return `${h}:${m}`;
                };
                schedule[label] = `${toTime(daySchedule.start)} - ${toTime(
                  daySchedule.end
                )}`;
              }
            });
            setWorkSchedule(schedule);
          }
          // Connect image, name, and specialty fields
          if (psyData.image) {
            setProfilePic(psyData.image);
          }
          if (psyData.name) {
            setFormData((prev) => ({ ...prev, name: psyData.name }));
          }
          if (psyData.specialty) {
            setFormData((prev) => ({
              ...prev,
              specialization: psyData.specialty,
            }));
          }
        }

        // ...existing userDoc fetch for profile fields...
        const userDocRef = doc(db, "psychiatrists", documentId);
        const userDoc = await getDoc(userDocRef);

        // Calculate Tahun Bergabung (practiceYear)
        let practiceYear = "";
        if (psyData && typeof psyData.tahunPengalaman === "number") {
          const now = new Date();
          const year = now.getFullYear() - psyData.tahunPengalaman;
          // Always 21 August
          practiceYear = `21/08/${year}`;
        }

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            name: userData.name || psyData?.name || "",
            specialization: userData.specialization || psyData?.specialty || "",
            alumnus: userData.alumnus || psyData?.alumnus || "",
            practiceYear: practiceYear || userData.practiceYear || "",
            email: userData.email || psyData?.email || "",
            strNumber: userData.strNumber || psyData?.str || "",
            phoneNumber: userData.phoneNumber || psyData?.phoneNumber || "",
          });
          setInitialFormData(userData);
          checkFormValidity();
        } else if (psyData) {
          setFormData((prev) => ({
            ...prev,
            alumnus: psyData.alumnus || "",
            practiceYear: practiceYear,
            email: psyData.email || "",
            strNumber: psyData.str || "",
            phoneNumber: psyData.phoneNumber || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 720);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    checkFormValidity();
  }, [formData]);

  const handleLogout = () => {
    localStorage.removeItem("documentId");
    navigate("/signin");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(initialFormData);
    setStrError(false);
    setPhoneError(false);
    setErrorFirstName(false);
    setIsFormValid(true);
    if (initialFormData.profilePicture) {
      setProfilePic(initialFormData.profilePicture);
    } else {
      setProfilePic(ProfilePic);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      if (/[^0-9]/.test(value) || value.length > 13) {
        return;
      }
      if ((value && !value.startsWith("08")) || value.length < 6) {
        setPhoneError(true);
      } else {
        setPhoneError(false);
      }
    }
    if (name === "strNumber") {
      if (value.length > 16) {
        return;
      }
    }

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      return updatedData;
    });
    checkFormValidity();
  };

  const checkFormValidity = () => {
    const isNameValid = formData.name.trim() !== "";
    const isSpecializationValid = formData.specialization.trim() !== "";
    const isStrValid = formData.strNumber.trim() !== "";
    const isPhoneValid =
      formData.phoneNumber.trim() !== "" &&
      formData.phoneNumber.startsWith("08") &&
      formData.phoneNumber.length >= 6;

    const formIsValid = true;

    setIsFormValid(formIsValid);

    setErrorName(!isNameValid);
    setErrorSpecialization(!isSpecializationValid);
    setStrError(!isStrValid);
  };
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorName(true);
      return;
    }
    if (!formData.specialization.trim()) {
      setErrorSpecialization(true);
      return;
    }

    setErrorName(false);
    setErrorSpecialization(false);
    setStrError(false);

    const documentId = localStorage.getItem("documentId");
    if (!documentId) {
      console.error("No document ID found in localStorage.");
      return;
    }

    try {
      // const userDocRef = doc(db, "users", documentId);
      // await updateDoc(userDocRef, {
      //   name: formData.name,
      //   specialization: formData.specialization,
      //   strNumber: formData.strNumber,
      //   phoneNumber: formData.phoneNumber,
      // });

      console.log("User data updated successfully.");
      setIsEditing(false); // Menonaktifkan mode edit setelah simpan
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Crop the image by center but a bit upper by 20px, then compress and save
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          // Calculate crop size (square, min of width/height)
          const cropSize = Math.min(img.width, img.height);
          // Center crop, but move up by 20px (if possible)
          let sx = (img.width - cropSize) / 2;
          let sy = (img.height - cropSize) / 2 - 200;
          if (sy < 0) sy = 0;

          const canvas = document.createElement("canvas");
          canvas.width = cropSize;
          canvas.height = cropSize;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              img,
              sx,
              sy,
              cropSize,
              cropSize,
              0,
              0,
              cropSize,
              cropSize
            );
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  // Compress the cropped image
                  new Compressor(blob, {
                    quality: 0.8,
                    success: (compressedFile) => {
                      const compReader = new FileReader();
                      compReader.onload = () => {
                        const base64Image = compReader.result as string;
                        setProfilePic(base64Image);
                        saveProfilePictureToFirestore(base64Image);
                      };
                      compReader.readAsDataURL(compressedFile);
                    },
                    error: (err) => {
                      console.error("Error compressing image:", err);
                    },
                  });
                }
              },
              "image/jpeg",
              0.95
            );
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfilePictureToFirestore = async (base64Image: string) => {
    const documentId = localStorage.getItem("documentId");
    if (!documentId) {
      console.error("No document ID found in localStorage.");
      return;
    }

    try {
      // Save to psychiatrists collection, field: image
      const psyDocRef = doc(db, "psychiatrists", documentId);
      await updateDoc(psyDocRef, { image: base64Image });
      console.log(
        "Profile picture updated successfully in psychiatrists collection."
      );
    } catch (error) {
      console.error(
        "Error updating profile picture in psychiatrists collection:",
        error
      );
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click(); // Trigger file input click
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f3d9] text-[#161F36]">
        <div className="w-1/2 h-2 bg-gray-300 rounded-full overflow-hidden">
          <div className="h-full bg-[#161F36] animate-loading-bar"></div>
        </div>
        <style>
          {`
            @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0); }
              100% { transform: translateX(100%); }
            }
            .animate-loading-bar {
              animation: loading-bar 1.5s infinite;
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="w-full items-center justify-center mt-40 ">
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24 sm:w-55 sm:h-55 rounded-full overflow-hidden">
            <img
              src={profilePic}
              alt="Profile"
              className={`w-full h-full object-cover transition duration-300 ${
                isEditing ? "opacity-70 group-hover:opacity-50" : ""
              }`}
            />
            {isEditing && (
              <div
                onClick={triggerFileInput}
                className="absolute inset-0 flex justify-center items-center transition duration-300 cursor-pointer"
              >
                <img
                  src={cameraIcon}
                  alt="Camera Icon"
                  className="w-10 h-10 opacity-80 group-hover:opacity-100"
                />
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
            />
          </div>
        </div>

        <div className="flex text-[#161F36] dark:text-[#E6E6E6] text-center items-center justify-center sm:text-left mt-6">
          <h1 className="text-2xl sm:text-4xl font-medium">{formData.name}</h1>
        </div>
        <div className="flex text-[#161F36] dark:text-[#E6E6E6] text-center items-center justify-center sm:text-left ">
          <h2 className="text-xl font-light">{formData.specialization}</h2>
        </div>
        <div className="flex justify-center text-md items-center text-[#161F36] dark:text-[#E6E6E6] font-light mb-10">
          {formData.email}
        </div>

        {/* Mobile Layout Buttons */}
        {isMobile && (
          <div className="flex flex-row justify-center items-center mt-5 w-full gap-25">
            {/* Profile Button */}
            <button
              className={`flex justify-center items-center rounded-lg mb-5 w-[30%] h-[40px] ${
                isProfileClicked
                  ? "bg-[#BACBD8] dark:text-[#161F36]"
                  : "text-[] dark:text-[#E6E6E6]"
              } transition-all duration-300`}
              onClick={handleProfileClick}
            >
              <h1 className="text-lg text-center">Profile</h1>
            </button>

            <button
              className={`flex justify-center items-center rounded-lg mb-5 w-[30%] h-[40px] ${
                isSettingsClicked
                  ? "bg-[#BACBD8] dark:text-[#161F36]"
                  : "text-[] dark:text-[#E6E6E6]"
              } transition-all duration-300`}
              onClick={handleSettingsClick}
            >
              <h1 className="text-lg text-center ">Jam Kerja</h1>
            </button>
          </div>
        )}
      </div>

      {/*DESKTOP*/}
      {!isMobile && (
        <div className=" bg-[#F2EDE2] dark:bg-[#151515] flex h-screen">
          <div className="relative z-1 flex flex-col lg:flex-row w-full ">
            {/*Left*/}

            <div className="w-full lg:w-1/4 flex flex-col xl:mr-1 lg:pt-10 lg:mr-10  ">
              <h2 className="text-[#161F36] dark:text-[#E6E6E6] mb-1 lg:text-[22px] font-regular text-left sm:ml-12 md:ml-10 lg:ml-20">
                Jam Kerja
              </h2>

              <div className="bg-transparent lg:w-[70%] md:w-[40%] sm:w-[40%] text-[#161F36] dark:text-[#E6E6E6] border-2 border-[#161F36] dark:border-[#E6E6E6] sm:ml-12 md:ml-10 md:mr-10 lg:ml-20 rounded-[6px] p-4">
                <div className="flex flex-col gap-2">
                  {Object.entries(workSchedule).map(([day, time]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center"
                    >
                      <span className="text-left text-xl flex-1">
                        {day}, {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol Keluar di bawah kiri */}
              <button
                onClick={() => setIsOverlayVisible(true)}
                className="text-[#FF5640] text-sm lg:text-xl text-left mt-auto lg:ml-3 md:ml-12 sm:ml-15 self-start w-full lg:w-full transition-all duration-300 mb-3 cursor-pointer"
                style={{ cursor: "pointer" }}
              >
                Keluar dari akun
              </button>
            </div>

            {/*middle */}
            <div className="grid grid-cols-2 lg:w-3/4 col-span-4 lg:ml-0 md:ml-10 sm:ml-12">
              <div className="grid grid-cols-1 gap-4 text-[#161F36] mt-10 ">
                <div className="md:col-span-2">
                  <InputField
                    label="Nama Lengkap"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={errorName ? "border-red-500" : "border-gray-900"}
                  />
                  {errorName && (
                    <p className="text-red-500 text-sm mt-2">
                      Nama depan tidak boleh kosong
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 ">
                  <InputField
                    label="Specialisasi"
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={
                      errorSpecialization ? "border-red-500" : "border-gray-900"
                    }
                  />
                  {errorSpecialization && (
                    <p className="text-red-500 text-sm mt-2">
                      Specialization tidak boleh kosong
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 font-medium">
                  <InputField
                    label="Alumnus"
                    type="text"
                    name="alumnus"
                    value={formData.alumnus}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 w-full gap-4 mt-10 ">
                <div>
                  <InputField
                    icon={<Calendar />}
                    iconPosition="left"
                    label="Tahun Bergabung"
                    type="text"
                    name="practiceYear"
                    value={formData.practiceYear}
                    onChange={handleChange}
                    readOnly={true}
                    className="pl-12 "
                  />
                </div>
                <div className="flex gap-2 items-stretch">
                  <div className="flex-grow">
                    <InputField
                      label="Nomor STR"
                      type="text"
                      name="strNumber"
                      value={formData.strNumber}
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <InputField
                    label="Nomor Telepon"
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="08123272348"
                    className={
                      phoneError ? "border-red-500" : "border-gray-900"
                    }
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1">
                      Nomor Telepon harus dimulai dengan 08 dan dalam format
                      yang benar
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end items-end w-full gap-6 lg:gap-10 lg:mb-20 md:mb-5 sm:pr-10 sm:mb-5 pt-10 lg:pr-17 md:pr-10 col-span-2">
                {isEditing && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleSave}
                      className={`bg-[#BACBD8] text-lg text-[#161F36] py-4 px-13 rounded-md hover:bg-[#87b4fb] transition font-medium ${
                        !isFormValid ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!isFormValid}
                    >
                      Simpan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/*MOBILE*/}
      {isMobile && isProfileClicked && (
        <div className=" bg-[#F2EDE2] dark:bg-[#151515] flex h-screen w-full ml-2 ">
          <div className="relative z-1 flex flex-col w-full pb-18">
            <div className="flex flex-col">
              <div className="grid grid-cols-1 w-full text-[#161F36] dark:text-[#E6E6E6] gap-3 mt-5 pl-5">
                <div className="md:col-span-2">
                  <InputField
                    label="Nama Lengkap"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={errorName ? "border-red-500" : "border-gray-900"}
                  />
                  {errorName && (
                    <p className="text-red-500 text-sm mt-2">
                      Nama depan tidak boleh kosong
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 ">
                  <InputField
                    label="Specialisasi"
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={
                      errorSpecialization ? "border-red-500" : "border-gray-900"
                    }
                  />
                  {errorSpecialization && (
                    <p className="text-red-500 text-sm mt-2">
                      Specialization tidak boleh kosong
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 font-medium">
                  <InputField
                    label="Alumnus"
                    type="text"
                    name="alumnus"
                    value={formData.alumnus}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 mt-3 pl-5">
                <div>
                  <InputField
                    icon={<Calendar />}
                    iconPosition="left"
                    label="Tahun Bergabung"
                    type="text"
                    name="practiceYear"
                    value={formData.practiceYear}
                    onChange={handleChange}
                    readOnly={true}
                    className="pl-12 "
                  />
                </div>
                <div className="flex gap-2 items-stretch">
                  <div className="flex-grow">
                    <InputField
                      label="Nomor STR"
                      type="text"
                      name="strNumber"
                      value={formData.strNumber}
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <InputField
                    label="Nomor Telepon"
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder=""
                    className={
                      phoneError ? "border-red-500" : "border-gray-900"
                    }
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1">
                      Nomor Telepon harus dimulai dengan 08 dan dalam format
                      yang benar
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[#FF5640] text-[18px] lg:text-xl transition-all duration-300"

            >
              Keluar dari akun
            </button>
          </div>
        </div>
      )}

      {isMobile && isSettingsClicked && (
        <div className=" bg-[#F2EDE2] dark:bg-[#151515] flex h-screen w-full  ">
          <div className="relative z-1 flex flex-col w-full ">
            <div className="flex flex-col justify-center items-center">
              <div className="bg-transparent  w-[80%]  mt-10  text-[#161F36] dark:text-[#E6E6E6] border-2 border-[#161F36] dark:border-[#E6E6E6] rounded-[6px] p-4">
                <div className="flex flex-col gap-2">
                  {Object.entries(workSchedule).map(([day, time]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center "
                    >
                      <span className="text-left text-xl flex-1">
                        {day}, {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[#FF5640] text-[18px] lg:text-xl transition-all duration-300"

            >
              Keluar dari akun
            </button>
          </div>
        </div>
      )}
      {isOverlayVisible && (
          <div className="fixed inset-0 bg-black/50 backdrop-brightness-10 backdrop-opacity-40 z-50 flex justify-center items-center">
            <div className="bg-[#F2EDE2] dark:bg-[#161F36] p-6 rounded-[8px] border-1 border-black shadow-lg w-11/12 sm:w-1/3">
              <h2 className="text-lg font-semibold mb-4">Apakah kamu yakin?</h2>
              <p className="text-sm mb-4 font-regular">
                Aksi ini akan mengeluarkanmu dari akunmu <br />
                dan kamu harus masuk kembali untuk mengaksesnya.
              </p>
              <div className="flex flex-wrap justify-end gap-4">
                <button
                  onClick={handleCloseOverlay}
                  className="bg-transparent border-1 font-medium text-sm text-[#161F36] dark:text-[#E6E6E6] border-black dark:border-[#E6E6E6] px-4 py-2 rounded-md w-full sm:w-auto "
                >
                  Batalkan
                </button>
                <button
                  onClick={async () => {
                    try {
                      await signOut(auth);
                      localStorage.removeItem("documentId");
                      navigate("/signin");
                    } catch (error) {
                      console.error("Error signing out:", error);
                    }
                  }}
                  className="bg-[#BACBD8] text-[#181818] font-medium px-4 py-2 rounded-md w-full sm:w-auto text-sm "
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PsychiatristProfile;
