"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import AuthLayoutapt from "../components/AptBackground";


import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ManageAppointmentContent = () => {
  const [date, setDate] = React.useState<Date>();
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = React.useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = React.useState<string | null>(null);

  const fullyBookedDates = [
  new Date(2025, 4, 15), // 15 Mei 2025
  new Date(2025, 4, 18), // 18 Mei 2025
  new Date(2025, 4, 21), // 21 Mei 2025
];

  return (
    <AuthLayoutapt>
      <div className="w-full flex flex-col items-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#ffffff] text-center mb-6 mt-6">
          Manage Appointment
        </h1>

        <div className="relative z-1 bg-white rounded-3xl shadow-xl p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row gap-8 w-full max-w-[1200px] mb-10">
          {/* Left Section */}
          <div className="w-full lg:w-1/4 flex flex-col items-center pr-6 lg:border-r border-gray-300">
            <div className="flex flex-col items-center">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Dr. Elon"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mt-4"
              />
              <h2 className="text-xl sm:text-2xl font-bold text-[#083A50] mt-2">Dr. Elon</h2>
              <p className="text-sky-500 font-semibold">Psychiatrist</p>
              <div className="flex gap-2 mt-2 items-center">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  2+ years
                </span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  ⭐ 5.0
                </span>
              </div>
            </div>

            <div className="text-left w-full mt-6">
              <div className="mb-4">
                <h1 className="text-lg font-bold text-[#083A50]">Workplace</h1>
                <p className="text-base font-semibold text-[#358DB3] mt-1">
                  Mondstdat, 2024
                </p>
              </div>

              <div className="mb-4">
                <p className="text-lg font-bold text-[#083A50]">SIP</p>
                <p className="text-base font-semibold text-[#358DB3] mt-1">
                  00018283912381293
                </p>
              </div>

              <div className="mb-4">
                <p className="text-lg font-bold text-[#083A50]">Consultation Method</p>
                <p className="text-base font-semibold text-[#358DB3] mt-1">
                  Online (Video / Chat)
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="flex flex-col gap-4 w-full lg:w-2/5 pr-6 lg:border-r border-gray-300">
            <div>
              <p className="text-xl font-bold text-[#358DB3]">Method</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {["Chat", "Video"].map((method) => (
                  <Button
                    key={method}
                    variant="outline"
                    onClick={() => setSelectedMethod(method)}
                    className={cn(
                      "py-2 px-6 text-sm sm:text-base",
                      selectedMethod === method && "bg-sky-500 text-white"
                    )}
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xl font-bold text-[#358DB3]">Duration</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {["15m", "30m", "1h"].map((duration) => (
                  <Button
                    key={duration}
                    variant="outline"
                    onClick={() => setSelectedDuration(duration)}
                    className={cn(
                      "py-2 px-6 text-sm sm:text-base",
                      selectedDuration === duration && "bg-sky-500 text-white"
                    )}
                  >
                    {duration}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xl font-bold text-[#358DB3]">Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal py-3 text-sm sm:text-base mt-2",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    // 🔽 Modifikasi: Gabungan tanggal sebelum hari ini & yang sudah penuh
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

            <div>
              <p className="text-xl font-bold text-[#358DB3]">Symptoms</p>
              <Textarea
                placeholder="Type symptoms here..."
                className="resize-none mt-2 h-32"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col gap-4 w-full lg:w-2/5">
            <div>
              <p className="text-xl font-bold text-[#358DB3]">Payment Method</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {["CC", "Debit"].map((method) => (
                  <Button
                    key={method}
                    variant="outline"
                    onClick={() => setSelectedPayment(method)}
                    className={cn(
                      "py-3 px-6 text-sm sm:text-base",
                      selectedPayment === method && "bg-sky-500 text-white"
                    )}
                  >
                    {method}
                  </Button>
                ))}
              </div>

              <p className="text-xl font-bold text-[#358DB3] mt-4">Card information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <Input placeholder="First Name" />
                <Input placeholder="Last Name" />
                <Input placeholder="Card Number" className="sm:col-span-2" />
                <Input placeholder="Exp Date" />
                <Input placeholder="CVV" />
              </div>
            </div>

            <div className="flex flex-col justify-between items-end mt-4">
              <p className="text-lg sm:text-xl font-bold text-gray-800">
                Total Price: <span className="text-gray-800">$27.99</span>
              </p>
              <div className="flex gap-4 mt-4 flex-wrap">
                <Button
                  variant="outline"
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Cancel
                </Button>
                <Button className="bg-sky-500 text-white hover:bg-sky-600">
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayoutapt>
  );
};

export default ManageAppointmentContent;
