import Navbar from "../components/Navbar";
import InputField from "../components/inputField";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase"; 
import cameraIcon from "../assets/83574.png";
import ProfilePic from "../assets/Logo.jpg";


const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [errorFirstName, setErrorFirstName] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "Elon",
    lastName: "Musk",
    address: "Jl. Anggrek No. 5",
    sex: "",
    education: "Bachelor, Master, etc",
    email: "elon@example.com",
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
            education: userData.education || "", // Corrected key
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            country: userData.country || "",
            city: userData.city || "",
          });
          setInitialFormData(userData);
          checkFormValidity(); 
          console.log("User data fetched:", userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

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

  return (
    <div className="min-h-screen bg-[#f2f3d9] text-[#2a3d23] flex flex-col">
      <Navbar />
  
      <div className="w-full px-6 py-15 bg-[#FFFFDB]">
        <div className="flex items-center gap-6 flex-col sm:flex-row">
         <div className="relative w-24 h-24 sm:w-45 sm:h-45 rounded-full overflow-hidden group">
      
            <img src={ProfilePic} 
              alt="Profile" 
                className={`w-full h-full object-cover transition duration-300 
                  ${ isEditing ? "opacity-70 group-hover:opacity-50" : ""
              }`}
            />
           
            {isEditing && (
              <div
                onClick={() => alert("Ganti foto lu nigga")}
                className="absolute inset-0 flex items-center justify-center transition duration-300 cursor-pointer"
              >
                <img
                  src={cameraIcon}
                  alt="Camera Icon"
                  className="w-10 h-10 opacity-80 group-hover:opacity-100"
                />
              </div>
            )}
          </div>


          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-2">
              {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-lg sm:text-2xl font-bold">
              Your account is ready, you can now apply for advice.
            </p>

            <button
              onClick={() => {
                if (isEditing) {
                  handleCancelEdit(); 
                } else {
                  setIsEditing(true); 
                }
              }}
              className="mt-4 bg-[#32481F] text-white py-2 px-6 rounded-md hover:bg-[#1f3019] transition font-semibold">
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#688F5E] flex-1">
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
                    className={errorFirstName ? "border-red-500" : "border-gray-300"}
                  />
                  {errorFirstName && (<p className="text-red-500 text-sm mt-2">First Name cannot be empty</p>)}
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
                    label="Address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Your address"
                  />
                </div>
                <div className="md:col-span-2">
                  <InputField
                    label="Education Level"
                    type="text"
                    name="education" // Corrected key
                    value={formData.education} // Corrected key
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Bachelor, Master, etc"
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
                className={`bg-[#32481F] text-white py-4 px-20 rounded-md hover:bg-[#1f3019] transition font-bold text-xl ${
                  !isFormValid ? "opacity-50 cursor-not-allowed" : "" }`}
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

export default UserProfile;
