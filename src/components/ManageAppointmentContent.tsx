"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../config/firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
// import { psychiatristsData } from "../utils/storePsychiatrists";

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
import appointmentsData from "../utils/appointmentsData.json";

interface Psychiatrist {
  name: string;
  specialty: string;
  image: string;
  price: number;
  basePrice: number; // Add basePrice to interface
  rating: number;
  chatPatientQuota: number;
  bookedChat: {
    [key: string]: number; // date string as key (YYYY-MM-DD format), number of bookings as value
  };
  bookedVideo: {
    [key: string]: number[]; // date as key (YYYY-MM-DD format), array of [startMinutes, endMinutes]
  };
}

interface Appointment {
  psychiatristId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  gejala: string;
  method: string;
  date: string;
  time: string;
  dayName: string;
  price: number;
  status: string;
}

// Add interface for User
interface User {
  bookedChat: {
    [key: string]: boolean; // date string as key (YYYY-MM-DD format), boolean as value
  };
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const ManageAppointmentContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [psychiatrist, setPsychiatrist] = useState<Psychiatrist | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = React.useState<Date>();
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = React.useState<string | null>(
    null
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [gejala, setGejala] = useState("");

  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customSessions, setCustomSessions] = React.useState(2); // minimal 2 x 15m = 30m

  const getTimeSlotsByDuration = (
    duration: string | null,
    customMinutes?: number,
    selectedDate?: Date
  ): string[] => {
    if (!duration && !customMinutes) return [];
    if (!selectedDate || !psychiatrist?.jadwal) return [];

    // Get the day of week
    const days = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    const dayName = days[selectedDate.getDay()];

    // Get schedule for the selected day
    const daySchedule = psychiatrist.jadwal[dayName];
    if (!daySchedule) return []; // Return empty array if no schedule for this day

    const sessionMinutes =
      customMinutes ??
      (duration === "15m"
        ? 15
        : duration === "30m"
        ? 30
        : duration === "45m"
        ? 45
        : duration === "1h"
        ? 60
        : 0);
    if (sessionMinutes === 0) return [];

    const startHour = Math.floor(daySchedule.start / 60);
    const endHour = Math.floor(daySchedule.end / 60);
    const slots: string[] = [];
    const totalMinutes = daySchedule.end - daySchedule.start;

    // Get booked slots for the selected date
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const bookedSlots = psychiatrist?.bookedVideo?.[dateStr] || [];

    for (let i = 0; i <= totalMinutes - sessionMinutes; i += 15) {
      const startTotalMinutes = daySchedule.start + i;
      const endTotalMinutes = startTotalMinutes + sessionMinutes;

      // Check if this time slot overlaps with any booked slots
      const isSlotBooked =
        Array.isArray(bookedSlots) && bookedSlots.length >= 2
          ? bookedSlots.some((_, index) => {
              // Only check even indices (0, 2, 4, etc.) as they represent start times
              if (index % 2 === 0 && index + 1 < bookedSlots.length) {
                const bookedStart = bookedSlots[index];
                const bookedEnd = bookedSlots[index + 1];
                return (
                  (startTotalMinutes >= bookedStart &&
                    startTotalMinutes < bookedEnd) ||
                  (endTotalMinutes > bookedStart &&
                    endTotalMinutes <= bookedEnd) ||
                  (startTotalMinutes <= bookedStart &&
                    endTotalMinutes >= bookedEnd)
                );
              }
              return false;
            })
          : false;

      if (!isSlotBooked) {
        const startH = Math.floor(startTotalMinutes / 60);
        const startM = startTotalMinutes % 60;
        const endH = Math.floor(endTotalMinutes / 60);
        const endM = endTotalMinutes % 60;

        if (endTotalMinutes <= daySchedule.end) {
          const start = `${startH.toString().padStart(2, "0")}.${
            startM === 0 ? "00" : startM
          }`;
          const end = `${endH.toString().padStart(2, "0")}.${
            endM === 0 ? "00" : endM
          }`;

          slots.push(`${start} - ${end}`);
        }
      }
    }

    return slots;
  };

  useEffect(() => {
    const fetchPsychiatrist = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Try fetching from Firestore directly
        const docRef = doc(db, "psychiatrists", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPsychiatrist({
            id: docSnap.id,
            ...(docSnap.data() as Psychiatrist),
          });
        } else {
          console.error("No psychiatrist found with ID:", id);
        }
      } catch (error) {
        console.error("Error fetching psychiatrist:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      const documentId = localStorage.getItem("documentId");
      if (!documentId) return;

      try {
        const userRef = doc(db, "users", documentId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const user = userSnap.data() as User & {
            firstName?: string;
            lastName?: string;
          };
          setUserData(user);
          // Set patientName from firstName + lastName if available
          if (user.firstName && user.lastName) {
            setPatientName(`${user.firstName} ${user.lastName}`.trim());
          } else if (user.firstName) {
            setPatientName(user.firstName);
          } else {
            setPatientName("User");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchPsychiatrist();
    fetchUserData();
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

  const renderSchedule = () => {
    if (!psychiatrist?.jadwal) return null;

    const days = {
      senin: "Senin",
      selasa: "Selasa",
      rabu: "Rabu",
      kamis: "Kamis",
      jumat: "Jumat",
      sabtu: "Sabtu",
      minggu: "Minggu",
    };

    return Object.entries(days).map(([key, label]) => {
      const schedule = psychiatrist.jadwal[key];
      return (
        <p key={key}>
          {label}
          {schedule
            ? `, ${formatTime(schedule.start)} - ${formatTime(schedule.end)}`
            : ", Libur"}
        </p>
      );
    });
  };

  useEffect(() => {
    if (!psychiatrist?.basePrice) return;

    if (selectedMethod === "Chat") {
      setTotalPrice(psychiatrist.basePrice);
    } else if (selectedMethod === "Video") {
      let multiplier = 1;
      if (showCustomInput) {
        // Custom sessions calculation (15 minutes per session)
        multiplier = 1 + (customSessions - 2) * 0.5; // -2 because base is 2 sessions
      } else {
        // Standard duration calculation
        switch (selectedDuration) {
          case "30m": // 2 sessions
            multiplier = 1.5;
            break;
          case "45m": // 3 sessions
            multiplier = 2;
            break;
          case "1h": // 4 sessions
            multiplier = 2.5;
            break;
          default:
            multiplier = 1;
        }
      }
      setTotalPrice(psychiatrist.basePrice * multiplier);
    }
  }, [
    psychiatrist?.basePrice,
    selectedMethod,
    selectedDuration,
    showCustomInput,
    customSessions,
  ]);

  const handleSaveAppointment = async () => {
    try {
      const documentId = localStorage.getItem("documentId");
      if (!documentId || !psychiatrist?.id || !date) return;

      const psychiatristRef = doc(db, "psychiatrists", psychiatrist.id);
      const dateStr = format(date, "yyyy-MM-dd");

      if (selectedMethod === "Chat") {
        // Get current psychiatrist data
        const docSnap = await getDoc(psychiatristRef);
        if (!docSnap.exists()) {
          throw new Error("Psychiatrist not found");
        }

        const currentData = docSnap.data();
        const currentBookedChat = currentData.bookedChat || {};

        // Update bookedChat field, incrementing the count for this date
        await updateDoc(psychiatristRef, {
          chatPatientQuota: psychiatrist.chatPatientQuota - 1,
          bookedChat: {
            ...currentBookedChat,
            [dateStr]: (currentBookedChat[dateStr] || 0) + 1,
          },
        });
      } else if (selectedMethod === "Video" && selectedTime) {
        // Parse the time range
        const [startTime, endTime] = selectedTime.split(" - ");
        const [startHour, startMinute] = startTime.split(".").map(Number);
        const [endHour, endMinute] = endTime.split(".").map(Number);

        const startMinutes = startHour * 60 + (startMinute || 0);
        const endMinutes = endHour * 60 + (endMinute || 0);

        // Get current psychiatrist data
        const docSnap = await getDoc(psychiatristRef);
        if (!docSnap.exists()) {
          throw new Error("Psychiatrist not found");
        }

        const currentData = docSnap.data();
        const currentBookedVideo = currentData.bookedVideo || {};

        // Update bookedVideo field, creating new date entry if it doesn't exist
        await updateDoc(psychiatristRef, {
          bookedVideo: {
            ...currentBookedVideo,
            [dateStr]: [
              ...(currentBookedVideo[dateStr] || []),
              startMinutes,
              endMinutes,
            ],
          },
        });
      }

      const getDayName = (date: Date): string => {
        const days = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        console.log("Date:", date);
        return days[date.getDay()];
      };

      // Convert to Unix timestamp (milliseconds since epoch)
      const unixTimestamp = date.getTime();

      const newAppointment: Appointment = {
        psychiatristId: psychiatrist.id,
        patientId: documentId,
        doctorName: psychiatrist.name,
        patientName: patientName || "User", // Use fetched patient name
        gejala,
        method: selectedMethod || "Chat",
        date: unixTimestamp,
        time: selectedMethod === "Chat" ? "today" : selectedTime,
        dayName: getDayName(date),
        price: totalPrice,
        createdAt: Date.now(), // Add creation timestamp
        status: "Menunggu pembayaran",
      };

      console.log(newAppointment);

      const appointmentsRef = collection(db, "appointments");
      await addDoc(appointmentsRef, newAppointment);

      // Navigate to manage-appointment after successful creation
      navigate("/manage-appointment");
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to save appointment. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/Search-psi");
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    console.log("Selected date:", newDate);
    setDate(newDate);
  };

  const isDateDisabled = (day: Date) => {
    const isBeforeToday = day < new Date(new Date().setHours(0, 0, 0, 0));
    const isSameDay = day.toDateString() === new Date().toDateString();
    const dateStr = format(day, "yyyy-MM-dd");

    // Get the day's schedule
    const days = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    const dayName = days[day.getDay()];
    const daySchedule = psychiatrist?.jadwal?.[dayName];

    // Disable if it's a holiday (schedule is null)
    if (daySchedule === null) {
      return true;
    }

    // Chat appointment validation
    if (selectedMethod === "Chat") {
      const bookedCount = psychiatrist?.bookedChat?.[dateStr] || 0;
      const isFullyBooked = bookedCount >= 5;
      const hasUserBookedChat = userData?.bookedChat?.[dateStr] === true;

      // If it's today, check chat quota
      if (isSameDay && psychiatrist?.chatPatientQuota === 0) {
        console.log("Date:", dateStr, hasUserBookedChat);
        return true;
      }

      // Disable if date is before today, fully booked, or user already has chat booking
      return isBeforeToday || isFullyBooked || hasUserBookedChat;
    }

    // Video appointment validation
    if (selectedMethod === "Video") {
      // Disable past dates and holidays
      return isBeforeToday;
    }

    // Default behavior if no method selected
    return isBeforeToday;
  };

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
            <h2 className="text-xl sm:text-2xl font-semibold text-[#000000] mt-2">
              Dr. {psychiatrist?.name}
            </h2>
            <p className="text-sky-500 font-semibold">
              {psychiatrist?.specialty}
            </p>
            <div className="flex gap-2 mt-2 items-center">
              <span className="bg-[#BACBD8] text-gray-700 px-2 py-1 rounded text-xs">
                {psychiatrist?.tahunPengalaman} tahun
              </span>
              <span className="bg-[#BACBD8] text-gray-700 px-2 py-1 rounded text-xs">
                ⭐ {psychiatrist?.rating}
              </span>
            </div>
          </div>

          <div className="text-left w-full mt-6">
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-[#000000]">Alumnus</h1>
              <p className="text-base font-regular text-black mt-1">
                {psychiatrist?.alumnus}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold text-black">Nomor STR</p>
              <p className="text-base font-regular text-black mt-1">
                {psychiatrist?.str}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold text-black">
                Metode Konsultasi
              </p>
              <p className="text-base font-regular text-black mt-1">
                {psychiatrist?.metode}
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col gap-4 w-full lg:w-2/5 pr-6 lg:border-r border-black">
          {/* Method */}
          <div>
            <p className="text-xl font-semibold text-black">Metode</p>
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
                <p className="text-xl font-semibold text-black">Durasi</p>
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
                        (selectedDuration === duration ||
                          (duration === "Custom" && showCustomInput)) &&
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
                        : `${Math.floor((customSessions * 15) / 60)} jam ${
                            (customSessions * 15) % 60
                          } menit`}{" "}
                      ({customSessions} x 15 menit)
                    </p>
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="mt-1">
                <p className="text-xl font-semibold text-black">Waktu</p>
                <Select onValueChange={setSelectedTime} value={selectedTime}>
                  <SelectTrigger className="w-full mt-2 bg-[#F2F2E2] py-5">
                    <SelectValue placeholder="Pilih jam konsultasi" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto bg-[#F2F2E2]">
                    {getTimeSlotsByDuration(
                      selectedDuration,
                      showCustomInput ? customSessions * 15 : undefined,
                      date // Pass the selected date
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
            <p className="text-xl font-semibold text-black">Tanggal</p>
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
                  {date ? (
                    format(date, "PPP")
                  ) : (
                    <span>Pilih tanggal konsultasi</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#F2F2E2]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={isDateDisabled}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-4 w-full lg:w-2/5 ">
          <div>
            <p className="text-xl font-semibold text-black">Gejala</p>
            <Textarea
              placeholder="Masukkan gejalamu disini..."
              className="resize-y mt-2 h-32 border-gray-600 bg-[#F2F2E2]"
              value={gejala}
              onChange={(e) => setGejala(e.target.value)}
            />
          </div>

          <div className="text-xl font-semibold">
            <h1>Jadwal Konsultasi</h1>
          </div>
          <div className="text-lg mb-3">{renderSchedule()}</div>

          <div className="flex flex-col justify-between items-end mt-4">
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              Total Biaya:{" "}
              <span className="text-gray-800">
                Rp{totalPrice.toLocaleString("id-ID")}
              </span>
            </p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <Button
                variant="outline"
                className="bg-[#187DA8] text-white hover:bg-sky-600"
                onClick={handleCancel}
              >
                Batal
              </Button>
              <Button
                className="bg-[#187DA8] text-white hover:bg-sky-600"
                onClick={handleSaveAppointment}
              >
                Lanjut
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAppointmentContent;
