import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import backgroundImage from "../assets/Master Background11.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import TopBar from "../components/Topbar2";
import CancelAppointmentModal from "../components/Cancel";
import foto1 from "../assets/p1.png";
import foto2 from "../assets/p2.png";
import foto3 from "../assets/p3.png";
import foto4 from "../assets/p4.png";
import foto5 from "../assets/p5.png";

const dashboardPsychiatrist: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([
    {
    date: "19",
    day: "SEN",
    doctor: "Andikapram Tusunomi",
    appointmentDate: "Senin, 19 May 2025",
    service: "Pesan",
    action: "Kelola"
  },
  {
    date: "26",
    day: "FRI",
    doctor: "Maria Lestari",
    appointmentDate: "Senin, 26 May 2025",
    service: "Video Call",
    time: "13:20 - 15.00",
    action: "Kelola"
  },
  {
    date: "3",
    day: "SAT",
    doctor: "Rafiandes Jugija",
    appointmentDate: "Senin, 3 Juni 2025",
    service: "Pesan",
    action: "Kelola"
  },
  {
    date: "10",
    day: "SUN",
    doctor: "Sylvia Puraini",
    appointmentDate: "Senin, 10 Juni 2025",
    service: "Pesan",
    action: "Kelola"
  },
  {
    date: "6",
    day: "WED",
    doctor: "Lestari Selamnan",
    appointmentDate: "Senin, 26 May 2025",
    service: "Video Call",
    time: "13:20 - 15.00",
    action: "Kelola"
  }
  ]);

  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([
    {
      title: "Hormone Therapy Consultation",
      patientName: "Kristina Stokes",
      service: "Video Call",
      date: "05 Feb, 2024",
      time: "11:00 AM - 11:30 AM",
      symptoms: "Hot flashes, Night sweats",
    },
    {
      title: "Anti-Aging Consultation",
      patientName: "Johnathan Mcgee",
      service: "Chat",
      date: "05 Feb, 2024",
      time: "11:00 AM - 11:30 AM",
      symptoms: "Wrinkles, Skin texture issues",
    },
  ]);
  const [messages, setMessages] = useState<any[]>([
    {
      from: "David Brown",
      date: "4:00 PM",
      content: "Anda : Sampai ketemu minggu depan",
      profileImage: foto1,
      isRead: false,
    },
    {
      from: "Regan Roberts",
      date: "3:28 PM",
      content: "Megan: Saya merasakan keresahan yang sangat mendalam!!!",
      profileImage: foto2,
      isRead: true,
    },
    {
      from: "Alexander Preston",
      date: "13:18 PM",
      content:
        "Alexander: Kenapa dunia ini begitu tidak adil untuk saya???",
      profileImage: foto3,
      isRead: true,
    },
    {
      from: "Kristina Stokes",
      date: "12:12 PM",
      content: "Kristina: Saya mengalami insomnia",
      profileImage: foto4,
      isRead: true,
    },
    {
      from: "Johnathan Mcgee",
      date: "8:11 AM",
      content: "Anda: Cobalah untuk tidur meskipun sebentar",
      profileImage: foto5,
      isRead: false,
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null);
  const navigate = useNavigate();
  const controller = new HomeController();

  useEffect(() => {
    const checkAuth = async () => {
      const documentId = localStorage.getItem("documentId");
      const isAuthenticated = await controller.checkAuthentication(documentId);

      if (!isAuthenticated) {
        navigate("/signin");
        return;
      }

      const name = await controller.fetchUserName(documentId);
      setUserName(name);

      const schedule = await controller.fetchTodaySchedule(documentId);
      const appointments = await controller.fetchUpcomingAppointments(
        documentId
      );
      const userMessages = await controller.fetchMessages(documentId);

      setTodaySchedule(schedule || []);
      setUpcomingAppointments(appointments || []);
      setMessages(userMessages || []);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    controller.handleLogout();
    navigate("/signin");
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleCancelAppointment = (appointment: any) => {
    setAppointmentToCancel(appointment);
    setIsModalOpen(true);
  };
  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      console.log("Appointment canceled:", appointmentToCancel);

      setUpcomingAppointments((prev) =>
        prev.filter((apt) => apt !== appointmentToCancel)
      );
    }
    setIsModalOpen(false);
    setAppointmentToCancel(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAppointmentToCancel(null);
  };
  
  return (
    
    <div className="min-h-screen bg-[#F2EDE2] w-full bg-cover flex flex-col overflow-x-hidden">
      <div className="h-[370px] bg-white w-full bg-cover flex flex-col overflow-x-hidden">
          <h1 className="text-[#161F36] text-4xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-snug mt-40 sm:mt-20 md:mt-32 lg:mt-40">
          Selamat datang,
          <br /> <span>dr. Andika Prasetya, Sp.KJ</span>
        </h1>
      </div>

      {/* Today's Schedule */}
      <section className="w-full mt-30 mb-40">
        <h1 className="text-6xl text-[#161F36] font-bold  mb-8 text-center">
          Jadwal Mendatang
        </h1>
        {!isMobile && (
    <div className="bg-[#E4DCCC] bg-opacity-90 p-5 rounded-md shadow-lg w-[80%] max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        {todaySchedule.map((appointment, index) => (
          <div key={index} className="flex flex-row">
            <div className="text-center w-[8%] bg-[#F9F1E0] pt-4 rounded-xs pb-2 flex flex-col">
              <span className="font-medium text-sm sm:text-base md:text-lg text-[#161F36]">{appointment.day}</span>
              <span className="text-5xl sm:text-4xl md:text-6xl font-medium text-[#161F36]">{appointment.date}</span>
            </div>
            <div className="ml-3 w-full bg-[#F9F1E0] rounded-xs grid grid-cols-3">
              <div className="text-2xl grid grid-row ml-3 mt-4">
                <span className="font-medium text-[#161F36]">{appointment.doctor}</span>
                <span className="font-medium text-[#161F36]">{appointment.appointmentDate}</span>
              </div>
              <div className="ml-20 flex flex-col justify-center items-center">
                <span className="text-2xl">{appointment.time}</span>
                <span className="text-lg">{appointment.service}</span>
              </div>
              <button className="text-2xl justify-end items-end text-end mr-20 text-[#161F36] rounded-md">
                <span className="hover:cursor-pointer hover:text-[#187DA8] p-2 rounded-md">{appointment.action}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Mobile Layout */}
  {isMobile && (
    <div className="bg-[#E4DCCC] bg-opacity-90 p-5 rounded-md shadow-lg w-[90%] max-w-md mx-auto">
      {todaySchedule.map((appointment, index) => (
        <div key={index} className=" bg-[#F9F1E0] rounded-md p-4 mb-4 shadow-lg">
          <div className="text-left flex flex-col">
            <span className="font-medium text-[#161F36] text-lg">{appointment.doctor}</span>

            <div className="grid grid-cols-3">
              <span className="text-md mt-1 mr-6">{appointment.service}</span>
              <span className="text-md">{appointment.time}</span>
              <button className="text-xl justify-end items-end text-end mr-1  text-[#161F36] rounded-md">
                <span className="hover:cursor-pointer hover:text-[#187DA8] p-2 rounded-md">{appointment.action}</span>
              </button>

            </div>
            
            
            <span className="font-medium text-[#161F36]">{appointment.appointmentDate}</span>
            <span className="font-medium text-lg text-[#161F36]"></span>
          
          </div>
        </div>
      ))}
    </div>
  )}

      </section>



      {/* Upcoming Appointments */}
      <section className=" ml-4 mr-4 mb-30">
        <h1 className="text-6xl text-[#161F36] font-bold mb-8 text-center ">
          Sesi yang sedang Aktif
        </h1>
        <div className="bg-[#E4DCCC] bg-opacity-90 p-8 rounded-xl shadow-lg max-w-7xl mx-auto">
          {upcomingAppointments.length > 0 ? (
            isMobile ? (
              upcomingAppointments.map((apt, idx) => (
                <div
                  key={idx}
                  className="bg-[#F9F1E0] p-6 rounded-lg mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <h2 className="text-2xl font-semibold text-[#161F36]">
                    {apt.patientName}
                  </h2>
                  <p className="text-gray-800 text-sm">
                    Gejala: {apt.symptoms}
                  </p>
                  <p className="text-gray-800 text-sm">
                    Metode: {apt.service}
                  </p>
                  <p className="text-gray-800 text-sm">
                    {apt.date} | {apt.time}
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <button className="px-6 py-2 bg-[#187DA8] text-white rounded-lg font-semibold hover:bg-[#5a7da1] transition-colors duration-300 w-full sm:w-auto">
                      Gabung Sesi
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(apt)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 w-full sm:w-auto sm:ml-auto"
                    >
                      Batalkan Janji Temu
                    </button>
                  </div>
                </div>
              ))
            ) : (
              upcomingAppointments.map((apt, idx) => (
                <div
                  key={idx}
                  className="bg-[#F9F1E0] p-6 rounded-lg mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex justify-between items-center"
                >
                  <div className="flex flex-col text-left">
                    <h2 className="text-2xl font-semibold text-[#161F36]">
                      {apt.patientName}
                    </h2>
                    <p className="text-gray-800 text-sm">
                      Gejala: {apt.symptoms}
                    </p>
                    <p className="text-gray-800 text-sm">
                      Metode: {apt.service}
                    </p>
                    <p className="text-gray-800 text-sm">
                      {apt.date} | {apt.time}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-6 py-2 bg-[#187DA8] text-white rounded-lg font-semibold hover:bg-[#186ca8] transition-colors duration-300 w-auto">
                      Gabung Sesi
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(apt)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 w-auto"
                    >
                      Batalkan Janji Temu
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            <p className="text-gray-700 text-lg">Belum ada janji temu yang akan datang</p>
          )}
        </div>
      </section>
      <CancelAppointmentModal
        isModalOpen={isModalOpen}
        appointmentToCancel={appointmentToCancel}
        handleConfirmCancel={handleConfirmCancel}
        handleCloseModal={handleCloseModal}
      />

      {/*Messages */}
      <section className="mt-10 ml-15 mr-15 mb-30 ">
        <h1 className="text-6xl text-[#161F36] font-semibold drop-shadow-md mb-8 text-center">
          Pesan
        </h1>
        <div className="bg-[#E4DCCC] bg-opacity-90 p-8 rounded-xl shadow-lg max-w-5xl mx-auto">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className="border-b border-gray-600 py-3 last:border-none"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                    <img
                      src={msg.profileImage}
                      alt={msg.from}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold">{msg.from}</h3>
                        {!msg.isRead && (
                          <span className="p-2 rounded-full bg-red-500   mr-2 mx-auto" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{msg.date}</p>
                    </div>

                    {/* Message Content */}
                    <p className="text-black font-medium mt-1">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-700 text-lg">Anda tidak memiliki pesan baru.</p>
          )}
        </div>
      </section>

      <footer className="bg-[#453A2F] text-white pt-5">
        <div className="mx-auto ml-20 mr-20 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Section*/}
            <div className="text-left">
              <h2 className="text-5xl font-bold mb-6">Serenity</h2>
              <ul className="flex flex-col space-y-6">
                <li className="flex items-center space-x-4">
                  <img src={Instagram} alt="Instagram" className="w-10 h-10" />
                  <span>@mentalhealth.id</span>
                </li>
                <li className="flex items-center space-x-4">
                  <img src={Whatsapp} alt="Whatsapp" className="w-10 h-10" />
                  <span>+628529320581</span>
                </li>
                <li className="flex items-center space-x-4">
                  <img src={email} alt="email" className="w-10 h-10" />
                  <span>mentalhealth@serenity.co.id</span>
                </li>
              </ul>
            </div>

            {/* Middle Section*/}
            <div className="">
              <h3 className="text-3xl font-semibold mb-4">
                Consumer Complaints Service
              </h3>
              <p className="text-sm">
                PT Mental Health Corp <br />
                Jl. Raya Kb. Jeruk No.27, RT.1/RW.9, Kemanggisan, Kec. Palmerah,
                Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11530
              </p>
            </div>

            {/* Right Section: Site Map */}
            <div className="text-right">
              <h3 className="text-3xl font-semibold mb-4">Site Map</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2">
                <li>
                  <a href="#" className="hover:opacity-75">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Terms & Condition
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Media
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Partnership
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Promotions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom Section: Copyright */}
        <div className="mt-16 text-center bg-[#525252] py-2">
          <p className="text-sm font-bold">
            © 2024 - 2025 Mental Health J&D Sp. co.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default dashboardPsychiatrist;
