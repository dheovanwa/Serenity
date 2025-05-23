// "use client";

// import * as React from "react";
// import { format } from "date-fns";
// import { CalendarIcon } from "lucide-react";
// import AuthLayoutapt from "../components/AptBackground";
// import { useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../config/firebase";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

// interface Psychiatrist {
//   name: string;
//   specialty: string;
//   image: string;
//   price: string;
//   rating: number;
// }

// const ManageAppointmentContent = () => {
//   const { id } = useParams();
//   const [psychiatrist, setPsychiatrist] = React.useState<Psychiatrist | null>(
//     null
//   );
//   const [loading, setLoading] = React.useState(true);
//   const [date, setDate] = React.useState<Date>();
//   const [selectedMethod, setSelectedMethod] = React.useState<string | null>(
//     null
//   );
//   const [selectedDuration, setSelectedDuration] = React.useState<string | null>(
//     null
//   );
//   const [selectedPayment, setSelectedPayment] = React.useState<string | null>(
//     null
//   );

//   const fullyBookedDates = [
//     new Date(2025, 4, 15), // 15 Mei 2025
//     new Date(2025, 4, 18), // 18 Mei 2025
//     new Date(2025, 4, 21), // 21 Mei 2025
//   ];

//   useEffect(() => {
//     const fetchPsychiatrist = async () => {
//       if (!id) return;
//       try {
//         const docRef = doc(db, "psychiatrists", id);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           setPsychiatrist(docSnap.data() as Psychiatrist);
//         }
//       } catch (error) {
//         console.error("Error fetching psychiatrist:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPsychiatrist();
//   }, [id]);

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

//   return (
//     <AuthLayoutapt>
//       <div className="w-full flex flex-col items-center px-4">
//         <h1 className="text-4xl sm:text-5xl font-bold text-[#ffffff] text-center mb-6 mt-6">
//           Manage Appointment
//         </h1>

//         <div className="relative z-1 bg-white rounded-3xl shadow-xl p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row gap-8 w-full max-w-[1200px] mb-10">
//           {/* Left Section */}
//           <div className="w-full lg:w-1/4 flex flex-col items-center pr-6 lg:border-r border-gray-300">
//             <div className="flex flex-col items-center">
//               <img
//                 src={psychiatrist?.image}
//                 alt={psychiatrist?.name}
//                 className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mt-4"
//               />
//               <h2 className="text-xl sm:text-2xl font-bold text-[#083A50] mt-2">
//                 Dr. {psychiatrist?.name}
//               </h2>
//               <p className="text-sky-500 font-semibold">
//                 {psychiatrist?.specialty}
//               </p>
//               <div className="flex gap-2 mt-2 items-center">
//                 <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
//                   2+ years
//                 </span>
//                 <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
//                   ⭐ {psychiatrist?.rating}.0
//                 </span>
//               </div>
//             </div>

//             <div className="text-left w-full mt-6">
//               <div className="mb-4">
//                 <h1 className="text-lg font-bold text-[#083A50]">Workplace</h1>
//                 <p className="text-base font-semibold text-[#358DB3] mt-1">
//                   Mondstdat, 2024
//                 </p>
//               </div>

//               <div className="mb-4">
//                 <p className="text-lg font-bold text-[#083A50]">SIP</p>
//                 <p className="text-base font-semibold text-[#358DB3] mt-1">
//                   00018283912381293
//                 </p>
//               </div>

//               <div className="mb-4">
//                 <p className="text-lg font-bold text-[#083A50]">
//                   Consultation Method
//                 </p>
//                 <p className="text-base font-semibold text-[#358DB3] mt-1">
//                   Online (Video / Chat)
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Middle Section */}
//           <div className="flex flex-col gap-4 w-full lg:w-2/5 pr-6 lg:border-r border-gray-300">
//             <div>
//               <p className="text-xl font-bold text-[#358DB3]">Method</p>
//               <div className="flex gap-2 mt-2 flex-wrap">
//                 {["Chat", "Video"].map((method) => (
//                   <Button
//                     key={method}
//                     variant="outline"
//                     onClick={() => setSelectedMethod(method)}
//                     className={cn(
//                       "py-2 px-6 text-sm sm:text-base",
//                       selectedMethod === method && "bg-sky-500 text-white"
//                     )}
//                   >
//                     {method}
//                   </Button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <p className="text-xl font-bold text-[#358DB3]">Duration</p>
//               <div className="flex gap-2 mt-2 flex-wrap">
//                 {["15m", "30m", "1h"].map((duration) => (
//                   <Button
//                     key={duration}
//                     variant="outline"
//                     onClick={() => setSelectedDuration(duration)}
//                     className={cn(
//                       "py-2 px-6 text-sm sm:text-base",
//                       selectedDuration === duration && "bg-sky-500 text-white"
//                     )}
//                   >
//                     {duration}
//                   </Button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <p className="text-xl font-bold text-[#358DB3]">Date</p>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal py-3 text-sm sm:text-base mt-2",
//                       !date && "text-muted-foreground"
//                     )}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {date ? format(date, "PPP") : <span>Pick a date</span>}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={date}
//                     onSelect={setDate}
//                     initialFocus
//                     // 🔽 Modifikasi: Gabungan tanggal sebelum hari ini & yang sudah penuh
//                     disabled={(day) => {
//                       const isBeforeToday =
//                         day < new Date(new Date().setHours(0, 0, 0, 0));
//                       const isFullyBooked = fullyBookedDates.some(
//                         (booked) =>
//                           booked.getDate() === day.getDate() &&
//                           booked.getMonth() === day.getMonth() &&
//                           booked.getFullYear() === day.getFullYear()
//                       );
//                       return isBeforeToday || isFullyBooked;
//                     }}
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>

//             <div>
//               <p className="text-xl font-bold text-[#358DB3]">Symptoms</p>
//               <Textarea
//                 placeholder="Type symptoms here..."
//                 className="resize-none mt-2 h-32"
//               />
//             </div>
//           </div>

//           {/* Right Section */}
//           <div className="flex flex-col gap-4 w-full lg:w-2/5">
//             <div>
//               <p className="text-xl font-bold text-[#358DB3]">Payment Method</p>
//               <div className="flex gap-2 mt-2 flex-wrap">
//                 {["CC", "Debit"].map((method) => (
//                   <Button
//                     key={method}
//                     variant="outline"
//                     onClick={() => setSelectedPayment(method)}
//                     className={cn(
//                       "py-3 px-6 text-sm sm:text-base",
//                       selectedPayment === method && "bg-sky-500 text-white"
//                     )}
//                   >
//                     {method}
//                   </Button>
//                 ))}
//               </div>

//               <p className="text-xl font-bold text-[#358DB3] mt-4">
//                 Card information
//               </p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
//                 <Input placeholder="First Name" />
//                 <Input placeholder="Last Name" />
//                 <Input placeholder="Card Number" className="sm:col-span-2" />
//                 <Input placeholder="Exp Date" />
//                 <Input placeholder="CVV" />
//               </div>
//             </div>

//             <div className="flex flex-col justify-between items-end mt-4">
//               <p className="text-lg sm:text-xl font-bold text-gray-800">
//                 Total Price: <span className="text-gray-800">$27.99</span>
//               </p>
//               <div className="flex gap-4 mt-4 flex-wrap">
//                 <Button
//                   variant="outline"
//                   className="bg-blue-100 text-blue-700 hover:bg-blue-200"
//                 >
//                   Cancel
//                 </Button>
//                 <Button className="bg-sky-500 text-white hover:bg-sky-600">
//                   Confirm
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AuthLayoutapt>
//   );
// };

// export default ManageAppointmentContent;
