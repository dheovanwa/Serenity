"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Psychiatrist {
  name: string;
  specialty: string;
  image: string;
  price: string;
  rating: number;
}

const ManageAppointmentContent = () => {
  const { id } = useParams();
  const [psychiatrist, setPsychiatrist] = React.useState<Psychiatrist | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [date, setDate] = React.useState<Date>();
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = React.useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");

  const fullyBookedDates = [
    new Date(2025, 4, 27), // 27 Mei 2025
    new Date(2025, 4, 29), // 29 Mei 2025
    new Date(2025, 4, 30), // 30 Mei 2025
  ];


const [showCustomInput, setShowCustomInput] = React.useState(false);
const [customSessions, setCustomSessions] = React.useState(2); // minimal 2 x 15m = 30m




 const getTimeSlotsByDuration = (duration: string | null, customMinutes?: number): string[] => {
  if (!duration && !customMinutes) return [];


  const sessionMinutes = customMinutes ?? (duration === "15m" ? 15 : duration === "30m" ? 30 : duration === "45m" ? 45 : duration === "1h" ? 60 : 0);
  if (sessionMinutes === 0) return [];

  const startHour = 9;
  const endHour = 17;

  const slots: string[] = [];
  const totalMinutes = (endHour - startHour) * 60;

  for (let i = 0; i <= totalMinutes - sessionMinutes; i += 15) {
    const startTotalMinutes = startHour * 60 + i;
    const endTotalMinutes = startTotalMinutes + sessionMinutes;

    const startH = Math.floor(startTotalMinutes / 60);
    const startM = startTotalMinutes % 60;
    const endH = Math.floor(endTotalMinutes / 60);
    const endM = endTotalMinutes % 60;

    if (endH > endHour) break;

    const start = `${startH.toString().padStart(2, "0")}.${startM === 0 ? "00" : startM}`;
    const end = `${endH.toString().padStart(2, "0")}.${endM === 0 ? "00" : endM}`;

    slots.push(`${start} - ${end}`);
  }

  return slots;
};

  useEffect(() => {
    const fetchPsychiatrist = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "psychiatrists", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPsychiatrist(docSnap.data() as Psychiatrist);
        }
      } catch (error) {
        console.error("Error fetching psychiatrist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychiatrist();
  }, [id]);


  //   if (loading) {
//     return (
//       <AuthLayoutapt>
//         <div className="w-full flex flex-col items-center px-4">
//           {/* Skeleton for title */}
//           <div className="h-12 w-64 bg-gray-300 rounded-lg animate-pulse mb-6 mt-6"></div>

//           <div className="relative z-1 bg-white rounded-3xl shadow-xl p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row gap-8 w-full max-w-[1200px] mb-10">
//             {/* Left section skeleton */}
//             <div className="w-full lg:w-1/4 flex flex-col items-center pr-6 lg:border-r border-gray-300">
//               <div className="w-32 h-32 rounded-full bg-gray-300 animate-pulse mb-4"></div>
//               <div className="w-48 h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
//               <div className="w-32 h-4 bg-gray-300 rounded animate-pulse mb-4"></div>
//               <div className="w-full space-y-4">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="space-y-2">
//                     <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
//                     <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Middle section skeleton */}
//             <div className="w-full lg:w-2/5 space-y-6 pr-6 lg:border-r border-gray-300">
//               {[1, 2, 3, 4].map((i) => (
//                 <div key={i} className="space-y-3">
//                   <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
//                   <div className="w-full h-12 bg-gray-300 rounded animate-pulse"></div>
//                 </div>
//               ))}
//             </div>

//             {/* Right section skeleton */}
//             <div className="w-full lg:w-2/5 space-y-6">
//               <div className="space-y-3">
//                 <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
//                 <div className="grid grid-cols-2 gap-2">
//                   {[1, 2, 3, 4].map((i) => (
//                     <div
//                       key={i}
//                       className="h-12 bg-gray-300 rounded animate-pulse"
//                     ></div>
//                   ))}
//                 </div>
//               </div>
//               <div className="flex justify-end space-x-4">
//                 <div className="w-24 h-10 bg-gray-300 rounded animate-pulse"></div>
//                 <div className="w-24 h-10 bg-gray-300 rounded animate-pulse"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </AuthLayoutapt>
//     );
//   }	



  return (
    <div className="w-full flex flex-col items-center px-4">
      <h1 className="w-full max-w-[1200px] text-left text-4xl sm:text-5xl font-bold text-[#161F36] mb-6 mt-6">
        Manage Appointment
      </h1>

      <div className="relative z-1 bg-[#E4DCCC] rounded-3xl shadow-xl p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row gap-8 w-full max-w-[1200px] mb-10">
        {/* Left Section */}
        <div className="w-full lg:w-1/4 flex flex-col items-center pr-6 lg:border-r border-black">
          <div className="flex flex-col items-center">
            <img
              src={psychiatrist?.image}
              alt={psychiatrist?.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mt-4"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-[#000000] mt-2">
              Dr. {psychiatrist?.name}
            </h2>
            <p className="text-sky-500 font-semibold">{psychiatrist?.specialty}</p>
            <div className="flex gap-2 mt-2 items-center">
              <span className="bg-[#BACBD8] text-gray-700 px-2 py-1 rounded text-xs">2+ years</span>
              <span className="bg-[#BACBD8] text-gray-700 px-2 py-1 rounded text-xs">
                ⭐ {psychiatrist?.rating}.0
              </span>
            </div>
          </div>

          <div className="text-left w-full mt-6">
            <div className="mb-4">
              <h1 className="text-lg font-bold text-[#000000]">Alumnus</h1>
              <p className="text-base font-semibold text-black mt-1">Universitas Indonesia</p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-bold text-black">Nomor STR</p>
              <p className="text-base font-semibold text-black mt-1">00018283912381293</p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-bold text-black">Metode Konsultasi</p>
              <p className="text-base font-semibold text-black mt-1">Online (Video / Chat)</p>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col gap-4 w-full lg:w-2/5 pr-6 lg:border-r border-black">
          {/* Method */}
          <div>
            <p className="text-xl font-bold text-black">Metode</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {["Chat", "Video"].map((method) => (
                <Button
                  key={method}
                  variant="outline"
                  onClick={() => setSelectedMethod(method)}
                  className={cn(
                    "py-2 px-6 text-sm sm:text-base bg-[#F2F2E2]",
                    selectedMethod === method && "bg-[#187DA8] text-white"
                  )}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>

          {selectedMethod === "Video" && (
  <>
            {/* Duration */}
            <div>
            <p className="text-xl font-bold text-black">Durasi</p>
            <div className="flex gap-2 mt-2 flex-wrap">
                {["30m", "45m", "1h", "Custom"].map((duration) => (
                <Button
                    key={duration}
                    variant="outline"
                    onClick={() => {
                    if (duration === "Custom") {
                        setShowCustomInput(true);
                        setSelectedDuration(null);
                        setSelectedTime("");
                    } else {
                        setShowCustomInput(false);
                        setSelectedDuration(duration);
                    }
                    }}
                    className={cn(
                    "py-2 px-6 text-sm sm:text-base bg-[#F2F2E2]",
                    (selectedDuration === duration || (duration === "Custom" && showCustomInput)) &&
                        "bg-[#187DA8] text-white"
                    )}
                >
                    {duration}
                </Button>
                ))}
            </div>

            {showCustomInput && (
                <div className="mt-4">
                <label className="block text-black font-semibold mb-2">
                    Masukkan jumlah sesi (15 menit per sesi, minimal 2 sesi):
                </label>
                <input
                    type="number"
                    min={2}
                    step={1}
                    value={customSessions}
                    onChange={(e) => {
                    const val = Math.max(2, Number(e.target.value));
                    setCustomSessions(val);
                    }}
                    className="border border-gray-300 rounded px-3 py-2 w-24 bg-[#F2F2E2]"
                />
                <p className="mt-2 text-gray-700">
                    Total durasi:{" "}
                    {customSessions * 15 < 60
                    ? `${customSessions * 15} menit`
                    : `${Math.floor((customSessions * 15) / 60)} jam ${(customSessions * 15) % 60} menit`}{" "}
                    ({customSessions} x 15 menit)
                </p>
                </div>
            )}
            </div>

            {/* Time */}
            <div className="mt-1">
            <p className="text-xl font-bold text-black">Waktu</p>
            <Select
                onValueChange={setSelectedTime}
                value={selectedTime}
            >
                <SelectTrigger className="w-full mt-2 bg-[#F2F2E2] py-5">
                <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-[#F2F2E2]">
                {getTimeSlotsByDuration(
                    selectedDuration,
                    showCustomInput ? customSessions * 15 : undefined
                ).map((slot) => (
                    <SelectItem key={slot} value={slot}>
                    {slot}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </>
        )}


          

          {/* Date */}
          <div>
            <p className="text-xl font-bold text-black">Tanggal</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal py-5 text-sm sm:text-base mt-2 bg-[#F2F2E2] ",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#F2F2E2]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(day) => {
                    const isBeforeToday = day < new Date(new Date().setHours(0, 0, 0, 0));
                    const isFullyBooked = fullyBookedDates.some(
                      (booked) =>
                        booked.getDate() === day.getDate() &&
                        booked.getMonth() === day.getMonth() &&
                        booked.getFullYear() === day.getFullYear()
                    );
                    return isBeforeToday || isFullyBooked;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>


        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-4 w-full lg:w-2/5 ">
          <div>
            <p className="text-xl font-bold text-black">Symptoms</p>
            <Textarea
              placeholder="Type symptoms here..."
              className="resize-none mt-2 h-32 border-gray-600 bg-[#F2F2E2]"
            />
          </div>

          <div className="text-2xl font-semibold">
            <h1>Jadwal Konsultasi</h1>
          </div>
          <div className="text-lg mb-3">
            <p>Senin, 09:00 - 16:00</p>
            <p>Selasa, Libur</p>
            <p>Rabu, 09:00 - 16:00</p>
            <p>Kamis: Libur</p>
            <p>Jumat, 09:00 - 16:00</p>
            <p>Sabtu, 09:00 - 16:00</p>
            <p>Minggu, 09:00 - 16:00</p>
          </div>

          <div className="flex flex-col justify-between items-end mt-4">
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              Total Biaya: <span className="text-gray-800">IDR.2.700.000</span>
            </p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <Button variant="outline" className="bg-[#187DA8] text-white hover:bg-sky-600">
                Cancel
              </Button>
              <Button className="bg-[#187DA8] text-white hover:bg-sky-600">Confirm</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAppointmentContent;
