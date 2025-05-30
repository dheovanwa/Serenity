import InputField from "../components/inputField";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import cameraIcon from "../assets/83574.png";
import ProfilePic from "../assets/default_profile_image.svg";
import Compressor from "compressorjs";
import calender from "../assets/Calendar.svg";
import { Calendar } from "lucide-react";

const UserProfile = () => {
  const [userName, setUserName] = useState("Loading...");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [errorFirstName, setErrorFirstName] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [profilePic, setProfilePic] = useState(ProfilePic); // State for profile picture
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for file input
  const [phoneError, setPhoneError] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "Elon",
    lastName: "Musk",
    address: "Jl. Anggrek No. 5",
    sex: "Pria",
    email: "elon@example.com",
    birthOfDate: "01/01/2001",
    phoneNumber: "",
  });
  const [initialFormData, setInitialFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    sex: "",
    education: "",
    birthOfDate: "",
    email: "",
    phoneNumber: "",
    country: "",
    city: "",
  });

  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [isSettingsClicked, setIsSettingsClicked] = useState(false);
  const navigate = useNavigate();
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const handleLogoutClick = async () => {
    setIsOverlayVisible(true);
    try {
      await signOut(auth);
      localStorage.removeItem("documentId");
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCloseOverlay = () => {
    setIsOverlayVisible(false);
  };
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => ({
      ...prev,
      sex: gender,
    }));
    setIsGenderDropdownOpen(false);
  };
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
        const userDocRef = doc(db, "users", documentId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            address: userData.address || "",
            sex: userData.sex || "",
            birthOfDate: userData.birthOfDate || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            birthOfDate: userData.birthOfDate || "",
          });
          setInitialFormData(userData);

          // Load profile picture from Firestore
          if (userData.profilePicture) {
            setProfilePic(userData.profilePicture);
          }

          checkFormValidity();
          console.log("User data fetched:", userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false); // Stop loading
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
    const fetchUserName = async () => {
      const documentId = localStorage.getItem("documentId");
      if (!documentId) return;

      try {
        const userDocRef = doc(db, "users", documentId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(
            `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
          );
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("User");
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("documentId");
    navigate("/signin");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(initialFormData);
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

    if (
      (name === "firstName" ||
        name === "lastName" ||
        name === "country" ||
        name === "city") &&
      /[^a-zA-Z\s]/.test(value)
    ) {
      return;
    }

    if (name === "nationalCode") {
      if (/[^0-9]/.test(value) || value.length > 16) {
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
    const isFirstNameValid = formData.firstName.trim() !== "";
    setIsFormValid(isFirstNameValid);
    setErrorFirstName(!isFirstNameValid);
  };
  const handleSave = async () => {
    if (!formData.firstName.trim()) {
      setErrorFirstName(true);
      return;
    }

    if (
      !formData.phoneNumber.startsWith("08") ||
      formData.phoneNumber.length < 6
    ) {
      setPhoneError(true);
      return;
    }

    setErrorFirstName(false);
    const documentId = localStorage.getItem("documentId");
    if (!documentId) {
      console.error("No document ID found in localStorage.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", documentId);

      await updateDoc(userDocRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
      });

      console.log("User data updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress the image
      new Compressor(file, {
        quality: 0.6, // Adjust compression quality
        success: (compressedFile) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Image = reader.result as string;
            setProfilePic(base64Image); // Update profile picture locally
            saveProfilePictureToFirestore(base64Image); // Save to Firestore
          };
          reader.readAsDataURL(compressedFile);
        },
        error: (err) => {
          console.error("Error compressing image:", err);
        },
      });
    }
  };

  const saveProfilePictureToFirestore = async (base64Image: string) => {
    const documentId = localStorage.getItem("documentId");
    if (!documentId) {
      console.error("No document ID found in localStorage.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", documentId);
      await updateDoc(userDocRef, { profilePicture: base64Image });
      console.log("Profile picture updated successfully in Firestore.");
    } catch (error) {
      console.error("Error updating profile picture in Firestore:", error);
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
      <div className="w-full items-center justify-center mt-40 mb-2">
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

        <div className="flex text-[#161F36] text-center items-center justify-center sm:text-left mt-6">
          <h1 className="text-2xl sm:text-4xl font-medium dark:text-white">
            {formData.firstName} {formData.lastName}
          </h1>
        </div>
        <div className="flex justify-center text-lg items-center text-[#161F36] font-light dark:text-white">
          {formData.email}
        </div>
      </div>

      {/*DESKTOP*/}
      {!isMobile && (
        <div className=" bg-[#F2EDE2] flex h-screen dark:bg-[#151515]">
          <div className="relative z-1 flex flex-col lg:flex-row gap-8 w-full ">
            {/*middle */}
            <div className="grid grid-cols-2 lg:w-full col-span-4 pl-60 pr-60">
              <div className="grid grid-cols-1 w-full gap-4 text-[#161F36] mt-10 ml-5">
                <div className="md:col-span-2">
                  <InputField
                    label="Nama depan"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={
                      errorFirstName ? "border-red-500" : "border-gray-900"
                    }
                  />
                  {errorFirstName && (
                    <p className="text-red-500 text-sm mt-2">
                      Nama depan tidak boleh kosong
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 ">
                  <InputField
                    label="Nama belakang"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="md:col-span-2 ">
                  <InputField
                    label="Jenis Kelamin"
                    type="text"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    readOnly={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 w-full gap-4 mt-10 ml-20">
                <div>
                  <InputField
                    icon={<Calendar />}
                    iconPosition="left"
                    label="Tanggal Lahir"
                    type="text"
                    name="tanggal_lahir"
                    value={formData.birthOfDate}
                    onChange={handleChange}
                    readOnly={true}
                    className="pl-12 "
                  />
                </div>
                <div className="flex gap-2 items-stretch">
                  <div className="flex-grow">
                    <InputField
                      label="Alamat"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      placeholder=""
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
              <div className="flex justify-center items-center w-full gap-6 lg:gap-10  mb-20 mt-20 lg:-mr-7 col-span-2">
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleCancelEdit();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className=" bg-[#BACBD8] text-[#161F36] text-center flex justify-center items-center py-4 px-13 text-lg rounded-md hover:bg-[#87b4fb] transition font-medium cursor-pointer dark:bg-[#1A2947] dark:text-white"
                >
                  {isEditing ? "Batal" : "Ubah"}
                </button>
                {isEditing && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleSave}
                      className={`bg-[#BACBD8] dark:bg-[#1A2947] text-lg text-[#161F36]  dark:text-[#E6E6E6] py-4 px-13 rounded-md hover:bg-[#87b4fb] transition font-medium ${
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
            <button
              onClick={handleLogoutClick}
              className="absolute bottom-4 left-4 text-[#FF5640] text-sm lg:text-xl text-left self-start transition-all duration-300"
            >
              Keluar dari akun
            </button>
          </div>

          {isOverlayVisible && (
            <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-brightness-10 backdrop-opacity-40 z-50 flex justify-center items-center">
              <div className="bg-[#F2EDE2] p-6 rounded-[8px] border-1 border-black shadow-lg w-11/12 sm:w-1/3">
                <h2 className="text-lg font-semibold mb-4">
                  Apakah kamu yakin?
                </h2>
                <p className="text-sm mb-4 font-regular">
                  Aksi ini akan mengubah data dirimu dan tidak bisa diubah{" "}
                  <br />
                  kembali ke semula apabila kamu melanjutkan.
                </p>
                <div className="flex flex-wrap justify-end gap-4">
                  <button
                    onClick={handleCloseOverlay}
                    className="bg-transparent border-1 font-medium text-sm text-[#161F36] border-black px-4 py-2 rounded-md w-full sm:w-auto "
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("documentId");
                      window.location.href = "/signin";
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
      )}

      {/*MOBILE*/}
      {isMobile && (
        <div className="bg-[#F2EDE2] flex h-screen w-full px-4 ml-2">
          <div className="relative z-1 flex flex-col w-full max-w-screen-sm mx-auto overflow-hidden">
            {/*middle */}
            <div className="flex flex-col">
              <div className=" grid grid-cols-1 w-full text-[#161F36] gap-3 mt-5 pl-5">
                <div className="md:col-span-2">
                  <InputField
                    label="Nama depan"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={
                      errorFirstName ? "border-red-500" : "border-gray-900"
                    }
                  />
                  {errorFirstName && (
                    <p className="text-red-500 text-sm mt-2">
                      Nama depan tidak dapat kosong
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 ">
                  <InputField
                    label="Nama belakang"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="md:col-span-2 ">
                  <InputField
                    label="Jenis Kelamin"
                    type="text"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    readOnly={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 mt-3 pl-5">
                <div>
                  <InputField
                    icon={<img src={calender} alt="calendar" className="" />}
                    iconPosition="left"
                    label="Tanggal Lahir"
                    type="text"
                    name="tanggal_lahir"
                    value={formData.birthOfDate}
                    onChange={handleChange}
                    readOnly={true}
                    className="pl-12 "
                  />
                </div>
                <div className="flex gap-2 items-stretch">
                  <div className="flex-grow">
                    <InputField
                      label="Alamat"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      placeholder="Your address"
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
                      Nomor Telepon harus dimulai dengan 08
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-center items-center w-full gap-6 lg:gap-10  mb-20 mt-20 lg:-ml-20 col-span-2">
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleCancelEdit();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className=" bg-[#BACBD8] text-[#161F36] text-center flex justify-center items-center py-4 px-13 text-lg rounded-md hover:bg-[#87b4fb] transition font-medium cursor-pointer"
                >
                  {isEditing ? "Batal" : "Ubah"}
                </button>
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
          {isOverlayVisible && (
            <div className="fixed inset-0 bg-transparent bg-opacity-10 backdrop-brightness-10 backdrop-opacity-40 z-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-1/3">
                <h2 className="text-xl font-bold mb-4">Apakah kamu yakin?</h2>
                <p className="text-sm mb-4">
                  Aksi ini akan mengubah data dirimu dan tidak bisa diubah{" "}
                  <br />
                  kembali ke semula apabila kamu melanjutkan.
                </p>
                <div className="flex flex-wrap justify-end gap-4">
                  <button
                    onClick={handleCloseOverlay}
                    className="bg-transparent border-2 text-[#161F36] px-4 py-2 rounded-md w-full sm:w-auto text-sm sm:text-base"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("documentId");
                      window.location.href = "/signin";
                    }}
                    className="bg-[#BACBD8] text-[#161F36] px-4 py-2 rounded-md w-full sm:w-auto text-sm sm:text-base"
                  >
                    Lanjutkan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
