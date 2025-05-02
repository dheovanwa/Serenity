import Navbar from "../components/Navbar";
import InputField from "../components/inputField";

const UserProfile = () => {
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
                <h1 className="text-3xl sm:text-5xl font-extrabold mb-2">Elon Musk</h1>
                <p className="text-lg sm:text-2xl font-bold">Your account is ready, you can now apply for advice.</p>
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
                  <InputField label="First Name" type="text" name="firstName" value="" onChange={() => {}} placeholder="Elon" />
                </div>
                <div>
                  <InputField label="Last Name" type="text" name="lastName" value="" onChange={() => {}} placeholder="Musk" />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Address" type="text" name="address" value="" onChange={() => {}} placeholder="Jl. Anggrek No. 5" />
                </div>
                <div className="md:col-span-2">
                  <InputField label="National Code" type="text" name="nationalCode" value="" onChange={() => {}} placeholder="123456789" />
                </div>
                <div className="md:col-span-2">
                  <InputField label="Education Level" type="text" name="education" value="" onChange={() => {}} placeholder="Bachelor, Master, etc" />
                </div>
              </div>
            </div>

            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Contact</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <InputField label="Email" type="email" name="email" value="" onChange={() => {}} placeholder="elon@example.com" />
                </div>
                
                <div className="flex gap-2 items-stretch">
                    <div className="flex-shrink-0 w-1/4">
                        <InputField label="Countrycode" type="text" name="countryCode" value="" onChange={() => {}} placeholder="+62" />
                    </div>

                    <div className="flex-grow">
                        <InputField label="Phone Number" type="text" name="phoneNumber" value="" onChange={() => {}} placeholder="812xxxxxxx" />
                    </div>
                </div>
                <div>
                  <InputField label="Country" type="text" name="country" value="" onChange={() => {}} placeholder="Indonesia" />
                </div>
                <div>
                  <InputField label="City" type="text" name="city" value="" onChange={() => {}} placeholder="Jakarta" />
                </div>
              </div>
            </div>
          </div>

          
          <div className="flex justify-center">
            <button className="bg-[#32481F] text-white py-4 px-20 rounded-md hover:bg-[#1f3019] transition font-bold text-xl">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;




