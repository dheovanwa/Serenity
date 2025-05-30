"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import starIcon from "../assets/star.svg";
import briefcase from "../assets/briefcase.svg";

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
// import appointmentsData from "../utils/appointmentsData.json"; // Ini tidak digunakan

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
  alumnus: string; // Tambahkan ini jika belum ada di interface
  str: string; // Tambahkan ini jika belum ada di interface
  metode: string; // Tambahkan ini jika belum ada di interface
  tahunPengalaman: number; // Tambahkan ini jika belum ada di interface
}

interface Appointment {
  psychiatristId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  gejala: string;
  method: string;
  date: number; // Menggunakan timestamp
  time: string;
  dayName: string;
  price: number;
  status: string;
  createdAt: number; // Tambahkan ini agar sesuai dengan penambahan di handleSaveAppointment
}

// Add interface for User
interface User {
  bookedChat: {
    [key: string]: boolean; // date string as key (YYYY-MM-DD format), boolean as value
  };
  firstName?: string;
  lastName?: string;
}

// Add isDarkMode to props
interface ManageAppointmentContentProps {
  isDarkMode: boolean;
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const ManageAppointmentContent = ({
  isDarkMode,
}: ManageAppointmentContentProps) => {
  // Terima prop isDarkMode
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
  const [showModal, setShowModal] = useState(false);

  const handleCancel = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmCancel = () => {
    setDate(undefined);
    setSelectedMethod(null);
    setSelectedTime("");
    setGejala("");
    setTotalPrice(0);
    setCustomSessions(2);
    setShowModal(false);
    // navigate("/schedule-appointment/:id?"); // Ganti dengan halaman yang sesuai
  };
  const handleDateSelectM = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  const getTimeSlotsByDuration = (
    duration: string | null,
    customMinutes?: number,
    selectedDate?: Date
  ): string[] => {
    if (!duration && !customMinutes) return [];
    if (!selectedDate || !psychiatrist?.jadwal) return [];

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

    const daySchedule = psychiatrist.jadwal[dayName];
    if (!daySchedule) return [];

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

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const bookedSlots = psychiatrist?.bookedVideo?.[dateStr] || [];

    for (let i = 0; i <= totalMinutes - sessionMinutes; i += 15) {
      const startTotalMinutes = daySchedule.start + i;
      const endTotalMinutes = startTotalMinutes + sessionMinutes;

      const isSlotBooked =
        Array.isArray(bookedSlots) && bookedSlots.length >= 2
          ? bookedSlots.some((_, index) => {
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
        const docRef = doc(db, "psychiatrists", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPsychiatrist({
            id: docSnap.id,
            ...(docSnap.data() as Psychiatrist),
          } as Psychiatrist); // Cast to Psychiatrist
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
          const user = userSnap.data() as User;
          setUserData(user);
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
        <p
          key={key}
          className="text-base font-regular text-black dark:text-gray-300"
        >
          {" "}
          {/* Schedule text */}
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
        multiplier = 1 + (customSessions - 2) * 0.5;
      } else {
        switch (selectedDuration) {
          case "30m":
            multiplier = 1.5;
            break;
          case "45m":
            multiplier = 2;
            break;
          case "1h":
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
        const docSnap = await getDoc(psychiatristRef);
        if (!docSnap.exists()) {
          throw new Error("Psychiatrist not found");
        }

        const currentData = docSnap.data();
        const currentBookedChat = currentData?.bookedChat || {}; // Use optional chaining
        await updateDoc(psychiatristRef, {
          chatPatientQuota: psychiatrist.chatPatientQuota - 1,
          bookedChat: {
            ...currentBookedChat,
            [dateStr]: (currentBookedChat[dateStr] || 0) + 1,
          },
        });
      } else if (selectedMethod === "Video" && selectedTime) {
        const [startTime, endTime] = selectedTime.split(" - ");
        const [startHour, startMinute] = startTime.split(".").map(Number);
        const [endHour, endMinute] = endTime.split(".").map(Number);

        const startMinutes = startHour * 60 + (startMinute || 0);
        const endMinutes = endHour * 60 + (endMinute || 0);

        const docSnap = await getDoc(psychiatristRef);
        if (!docSnap.exists()) {
          throw new Error("Psychiatrist not found");
        }

        const currentData = docSnap.data();
        const currentBookedVideo = currentData?.bookedVideo || {}; // Use optional chaining
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
        return days[date.getDay()];
      };

      const unixTimestamp = date.getTime();

      const newAppointment: Appointment = {
        psychiatristId: psychiatrist.id,
        patientId: documentId,
        doctorName: psychiatrist.name,
        patientName: patientName || "User",
        gejala,
        method: selectedMethod || "Chat",
        date: unixTimestamp,
        time: selectedMethod === "Chat" ? "today" : selectedTime,
        dayName: getDayName(date),
        price: totalPrice,
        createdAt: Date.now(),
        status: "Menunggu pembayaran",
      };

      console.log(newAppointment);

      const appointmentsRef = collection(db, "appointments");
      await addDoc(appointmentsRef, newAppointment);

      navigate("/manage-appointment");
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to save appointment. Please try again.");
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    console.log("Selected date:", newDate);
    setDate(newDate);
  };

  const isDateDisabled = (day: Date) => {
    const isBeforeToday = day < new Date(new Date().setHours(0, 0, 0, 0));
    const isSameDay = day.toDateString() === new Date().toDateString();
    const dateStr = format(day, "yyyy-MM-dd");

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

    if (daySchedule === null) {
      return true;
    }

    if (selectedMethod === "Chat") {
      const bookedCount = psychiatrist?.bookedChat?.[dateStr] || 0;
      const isFullyBooked = bookedCount >= 5;
      const hasUserBookedChat = userData?.bookedChat?.[dateStr] === true;

      if (isSameDay && psychiatrist?.chatPatientQuota === 0) {
        console.log("Date:", dateStr, hasUserBookedChat);
        return true;
      }

      return isBeforeToday || isFullyBooked || hasUserBookedChat;
    }

    if (selectedMethod === "Video") {
      return isBeforeToday;
    }

    return isBeforeToday;
  };

  const isFormValid = () => {
    if (!selectedMethod) return false;

    if (selectedMethod === "Chat") {
      return !!date;
    }

    if (selectedMethod === "Video") {
      return (
        !!date &&
        (!!selectedDuration || (showCustomInput && customSessions >= 2)) &&
        !!selectedTime
      );
    }

    return false;
  };

  return (
    <div className="w-full flex flex-col items-center px-4 dark:bg-[#161F36] transition-colors duration-300">
      {" "}
      {/* Main page background */}
      <h1 className="w-full max-w-[1200px] text-left text-4xl sm:text-5xl font-bold text-[#161F36] mb-6 mt-6 dark:text-white">
        Manage Appointment
      </h1>
      <div
        className="relative z-1 rounded-3xl shadow-xl p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row gap-8 w-full max-w-[1200px] mb-10
                      bg-[#E4DCCC] dark:bg-[#202f55]"
      >
        {" "}
        {/* Main card background */}
        {/* Left Section */}
        <div className="w-full lg:w-1/4 flex flex-col items-center pr-6 lg:border-r border-black dark:border-gray-600">
          <div className="flex flex-col items-center">
            <img
              src={psychiatrist?.image}
              alt={psychiatrist?.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mt-4"
            />
            <h2 className="text-xl sm:text-2xl font-semibold text-[#000000] mt-2 dark:text-white">
              Dr. {psychiatrist?.name}
            </h2>
            <p className="text-sky-500 font-semibold dark:text-blue-300">
              {psychiatrist?.specialty}
            </p>
            <div className="flex gap-2 mt-2 items-center">
              <div
                className="inline-flex rounded-md justify-center items-center py-1 px-3
                               bg-[#BACBD8] dark:bg-gray-700 dark:text-white"
              >
                <img
                  src={briefcase}
                  alt="icon"
                  className="w-4 h-4 mr-1 dark:filter dark:invert"
                />
                <span className="text-sm">
                  {" "}
                  {psychiatrist?.tahunPengalaman} Tahun
                </span>
              </div>
              <div
                className="inline-flex rounded-md justify-center items-center py-1 px-3
                               bg-[#BACBD8] dark:bg-gray-700 dark:text-white"
              >
                {Array.from({ length: 1 }).map((_, index) => (
                  <img
                    key={index}
                    src={starIcon}
                    alt="star"
                    className={`w-4 h-4 mr-1 dark:filter dark:invert ${
                      index < (psychiatrist?.rating || 0)
                        ? "text-[#161F36] dark:text-yellow-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm text-[#161F36] dark:text-white">
                  {psychiatrist?.rating}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left w-full mt-6">
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-[#000000] dark:text-white">
                Alumnus
              </h1>
              <p className="text-base font-regular text-black mt-1 dark:text-gray-300">
                {psychiatrist?.alumnus}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold text-black dark:text-white">
                Nomor STR
              </p>
              <p className="text-base font-regular text-black mt-1 dark:text-gray-300">
                {psychiatrist?.str}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold text-black dark:text-white">
                Metode Konsultasi
              </p>
              <p className="text-base font-regular text-black mt-1 dark:text-gray-300">
                {psychiatrist?.metode}
              </p>
            </div>
          </div>
        </div>
        {/* Middle Section */}
        <div className="flex flex-col gap-4 w-full lg:w-2/5 pr-6 lg:border-r border-black dark:border-gray-600">
          {/* Method */}
          <div>
            <p className="text-xl font-semibold text-black dark:text-white">
              Metode
            </p>
            {/* Method buttons */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {["Chat", "Video"].map((method) => (
                <Button
                  key={method}
                  variant="outline"
                  onClick={() => setSelectedMethod(method)}
                  className={cn(
                    "py-2 px-6 text-sm sm:text-base bg-[#F2F2E2] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
                    selectedMethod === method
                      ? "bg-[#BACBD8] text-black dark:bg-[#86939c] dark:text-white"
                      : "hover:bg-[#BACBD8] hover:text-black"
                  )}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>

          {/* Only show other sections if a method is selected */}
          {selectedMethod && (
            <>
              {/* Date - Moved here and only show for both Chat and Video */}
              <div>
                <p className="text-xl font-semibold text-black dark:text-white">
                  Tanggal
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal py-5 text-sm sm:text-base mt-2 bg-[#F2F2E2] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
                        !date && "text-muted-foreground dark:text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 dark:text-white" />
                      {date ? (
                        format(date, "PPP")
                      ) : (
                        <span>Pilih tanggal konsultasi</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-[#F2F2E2] dark:bg-gray-800 dark:border-gray-600 dark:text-white" // Calendar content
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={isDateDisabled}
                      dateFormat="dd/MM/YYYY"
                      // Shadcn Calendar internal styling for dark mode might need to be configured
                      // in tailwind.config.js or globals.css if not auto-applied.
                      // For now, ensuring parent PopoverContent is dark should help.
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Video-specific sections */}
              {selectedMethod === "Video" && (
                <>
                  {/* Duration */}
                  <div>
                    <p className="text-xl font-semibold text-black dark:text-white">
                      Durasi
                    </p>
                    {/* Duration buttons */}
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
                            "py-2 px-6 text-sm sm:text-base bg-[#F2F2E2] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
                            selectedDuration === duration ||
                              (duration === "Custom" && showCustomInput)
                              ? "bg-[#86939c] text-black dark:bg-[#86939c] dark:text-white"
                              : "hover:bg-[#BACBD8] hover:text-black"
                          )}
                        >
                          {duration}
                        </Button>
                      ))}
                    </div>

                    {showCustomInput && (
                      <div className="mt-4">
                        <label className="block text-black font-semibold mb-2 dark:text-white">
                          Masukkan jumlah sesi (15 menit per sesi, minimal 2
                          sesi):
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
                          className="border border-gray-300 rounded px-3 py-2 w-24 bg-[#F2F2E2] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
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
                    <p className="text-xl font-semibold text-black dark:text-white">
                      Waktu
                    </p>
                    <Select
                      onValueChange={setSelectedTime}
                      value={selectedTime}
                    >
                      <SelectTrigger className="w-full mt-2 bg-[#F2F2E2] py-5 dark:bg-gray-700 dark:text-white">
                        <SelectValue
                          placeholder="Pilih jam konsultasi"
                          className="dark:text-gray-400"
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto bg-[#F2F2E2] dark:bg-gray-800 dark:text-white">
                        {getTimeSlotsByDuration(
                          selectedDuration,
                          showCustomInput ? customSessions * 15 : undefined,
                          date // Pass the selected date
                        ).map((slot) => (
                          <SelectItem
                            key={slot}
                            value={slot}
                            className="dark:hover:bg-gray-700"
                          >
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        {/* Right Section */}
        <div className="flex flex-col gap-4 w-full lg:w-2/5 ">
          <div>
            <p className="text-xl font-semibold text-black dark:text-white">
              Gejala
            </p>
            <Textarea
              placeholder="Masukkan gejalamu disini..."
              className="resize-y mt-2 h-32 border-gray-600 bg-[#F2F2E2] dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              value={gejala}
              onChange={(e) => setGejala(e.target.value)}
            />
          </div>

          <div className="text-xl font-semibold text-black dark:text-white">
            <h1>Jadwal Konsultasi</h1>
          </div>
          <div className="text-lg mb-3">{renderSchedule()}</div>

          <div className="flex flex-col justify-between items-end mt-4">
            <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              Total Biaya:{" "}
              <span className="text-gray-800 dark:text-white">
                Rp{totalPrice.toLocaleString("id-ID")}
              </span>
            </p>
            {/* Bottom buttons */}
            <div className="flex gap-4 mt-4 flex-wrap">
              <Button
                variant="outline"
                className="bg-[#BACBD8] text-black hover:bg-[#9FB6C6] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={handleCancel}
              >
                Batal
              </Button>
              <Button
                className={cn(
                  // Use cn for conditional classes
                  `h-auto py-2 px-6 rounded-md font-semibold`, // Base button classes
                  isFormValid()
                    ? "bg-[#BACBD8] text-black hover:bg-[#9FB6C6] dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800"
                    : "bg-gray-400 text-white cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                )}
                onClick={handleSaveAppointment}
                disabled={!isFormValid()}
              >
                Lanjut
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Konfirmasi Batal */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-10 backdrop-brightness-10 backdrop-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] sm:w-[400px] dark:bg-gray-800 dark:text-white">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Konfirmasi Batal
            </h2>
            <p className="mt-2 text-black dark:text-gray-300">
              Apakah Anda yakin ingin membatalkan pemesanan?
            </p>
            <div className="flex justify-end gap-5 mt-5">
              <Button
                variant="outline"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 flex-1 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={handleCloseModal}
              >
                Batal
              </Button>
              <Button
                className="px-4 py-2 bg-blue-200 text-black rounded-md hover:bg-blue-300 flex-1 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800"
                onClick={handleConfirmCancel}
              >
                Ya, Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointmentContent;
