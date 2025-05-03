import Navbar from "../components/Navbar";
import InputField from "../components/inputField";
import React, { useState } from "react";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Elon",
    lastName: "Musk",
    address: "Jl. Anggrek No. 5",
    nationalCode: "123456789",
    education: "Bachelor, Master, etc",
    email: "elon@example.com",
    phoneNumber: "812xxxxxxx",
    country: "Indonesia",
    city: "Jakarta",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if ((name === "firstName" || name === "lastName" || name === "country"|| name === "city") && /[^a-zA-Z\s]/.test(value)) {
      return;
    }
    if (name === "nationalCode" ) {
      if (/[^0-9]/.test(value) || value.length > 16) {
        return;
      }
    }

    if (name === "phoneNumber") {
      if (/[^0-9]/.test(value) || value.length > 13) {
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saved:", formData);
    setIsEditing(false);
  };

  return (

    <div className="min-h-screen bg-[#f2f3d9] text-[#2a3d23] flex flex-col">
      <Navbar />

    <div className="w-full px-6 py-15 bg-[#FFFFDB]">
        <div className="flex items-center gap-6 flex-col sm:flex-row">
            <div className="relative w-24 h-24 sm:w-45 sm:h-45 bg-[#ccd6aa] rounded-full flex items-center justify-center">
                <span className="text-3xl sm:text-5xl">P</span>
                <div className="absolute bottom-1.5 right-1 bg-[#9cb67b] rounded-full p-4 sm:p-7"></div>
            </div>

            <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-5xl font-extrabold mb-2">{formData.firstName} {formData.lastName}</h1>
                <p className="text-lg sm:text-2xl font-bold">Your account is ready, you can now apply for advice.</p>

                <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="mt-4 bg-[#32481F] text-white py-2 px-6 rounded-md hover:bg-[#1f3019] transition font-semibold"
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
            </div>
        </div>
    </div>

      <div className="bg-[#688F5E] flex-1">
        <div className="max-w-6xl mx-auto pt-10 py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Personal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputField label="First Name" type="text" name="firstName" value={formData.firstName} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div>
                  <InputField label="Last Name" type="text" name="lastName" value={formData.lastName} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Address" type="text" name="address" value={formData.address} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="md:col-span-2">
                  <InputField label="National Code" type="text" name="nationalCode" value={formData.nationalCode} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Education Level" type="text" name="education" value={formData.education} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>
            </div>

            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Contact</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} readOnly={true}  />
                </div>
                
                <div className="flex gap-2 items-stretch">


                    <div className="flex-grow">
                        <InputField label="Phone Number" type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} readOnly={!isEditing} />
                    </div>
                </div>
                <div>
                  <InputField label="Country" type="text" name="country" value={formData.country} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div>
                  <InputField label="City" type="text" name="city" value={formData.city} onChange={handleChange} readOnly={!isEditing}/>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
          <div className="flex justify-center">
            <button onClick={handleSave} className="bg-[#32481F] text-white py-4 px-20 rounded-md hover:bg-[#1f3019] transition font-bold text-xl">
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




