import TopBar from "./TopBar";
import InputField from "./inputField";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import cameraIcon from "../assets/83574.png";
import ProfilePic from "../assets/Logo.jpg";
import Compressor from "compressorjs";

const profilePsychiatrist = () => {
  const [userName, setUserName] = useState("Loading...");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [errorFirstName, setErrorFirstName] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [profilePic, setProfilePic] = useState(ProfilePic); // State for profile picture
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for file input

  const [formData, setFormData] = useState({
    firstName: "Coolit",
    lastName: "Heytame",
    address: "Jl. Anggrek No. 5",
    sex: "",
    education: "Bachelor, Master, etc",
    email: "heytame@example.com",
    phoneNumber: "",
    country: "Indonesia",
    city: "Jakarta",
  });
  const [initialFormData, setInitialFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    sex: "",
    education: "",
    email: "",
    phoneNumber: "",
    country: "",
    city: "",
  });
  const navigate = useNavigate();

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
            education: userData.education || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            country: userData.country || "",
            city: userData.city || "",
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

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

    if (name === "phoneNumber") {
      if (/[^0-9]/.test(value) || value.length > 13) {
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
        sex: formData.sex,
        education: formData.education, // Corrected key
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        city: formData.city,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#b5e9ff] text-white">
        <div className="w-1/2 h-2 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-[#6ec2fa] animate-loading-bar"></div>
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
    <div className="min-h-screen bg-[#95cefd] text-white flex flex-col">
      <TopBar userName={userName} onLogout={handleLogout} />
      <div className="w-full px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="bg-[#41729b] text-white py-2 px-4 rounded-md hover:bg-[#48657c] transition font-semibold cursor-pointer"
        >
          ← Back to Home
        </button>
      </div>

      <div className="w-full px-6 py-15 bg-[#6cbdff]">
        <div className="flex items-center gap-6 flex-col sm:flex-row">
          <div className="relative w-24 h-24 sm:w-45 sm:h-45 rounded-full overflow-hidden group">
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover transition duration-300"
            />
          </div>

          <div className="text-center sm:text-left max-w-7xl">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold mb-2">
                dr. {formData.firstName} {formData.lastName}
              </h1>

              {/* Box with stars and experience */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {/* Star Rating */}
                  <span className="text-yellow-500">★★★★★</span>
                </div>
                <div className="bg-transparent border-2 text-white font-semibold rounded-sm px-3 py-1">
                  2 Years Experience in Serenity
                </div>
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold">
              I’m dr. Coolit Heytame, a psychiatrist with years of experience in
              treating a variety of mental health conditions. I focus on
              creating a supportive environment where patients can heal and
              grow, using evidence-based therapies and an empathetic approach to
              help them regain emotional balance.
            </p>

            <button
              onClick={() => {
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  setIsEditing(true);
                }
              }}
              className="mt-4 bg-[#41729b] text-white py-2 px-6 rounded-md hover:bg-[#48657c] transition font-semibold cursor-pointer"
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#4b80ac] flex-1">
        <div className="max-w-6xl mx-auto pt-10 py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputField
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={
                      errorFirstName ? "border-red-500" : "border-gray-300"
                    }
                  />
                  {errorFirstName && (
                    <p className="text-red-500 text-sm mt-2">
                      First Name cannot be empty
                    </p>
                  )}
                </div>
                <div>
                  <InputField
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <InputField
                    label="Sex"
                    type="text"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Male or Female"
                  />
                </div>
                <div className="md:col-span-2">
                  <InputField
                    label="Work Address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Your work address"
                  />
                </div>
                <div className="md:col-span-2">
                  <InputField
                    label="Graduate of"
                    type="text"
                    name="education" // Corrected key
                    value={formData.education} // Corrected key
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="University, City, Year"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Contact</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={true}
                  />
                </div>

                <div className="flex gap-2 items-stretch">
                  <div className="flex-grow">
                    <InputField
                      label="Phone Number"
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      placeholder="08xxxxxxx"
                    />
                  </div>
                </div>
                <div>
                  <InputField
                    label="Country"
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Your country"
                  />
                </div>
                <div>
                  <InputField
                    label="City"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Your city"
                  />
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                className={`bg-[#41729b] text-white py-4 px-20 border-2 rounded-md hover:bg-[#48657c] transition font-bold text-xl ${
                  !isFormValid ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isFormValid}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default profilePsychiatrist;
