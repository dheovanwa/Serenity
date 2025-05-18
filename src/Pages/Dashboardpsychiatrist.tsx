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

const Homepage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([
    {
    patient: "Kristina Stokes",
    service: "Consultation",
    date: "05/02/2022",
    time: "09:30",
    symptoms: "Headache, Nausea", 
  },
  {
    patient: "Alexander Preston",
    service: "Consultation",
    date: "05/02/2022",
    time: "12:00",
    symptoms: "Fatigue, Cough", 
  },
  {
    patient: "Johnathan Mcgee",
    service: "Consultation",
    date: "05/02/2022",
    time: "16:30",
    symptoms: "Shortness of breath", 
  },
  {
    patient: "Regan Roberts",
    service: "Therapy",
    date: "05/02/2022",
    time: "10:30",
    symptoms: "Anxiety, Insomnia", 
  },
  {
    patient: "David Brown",
    service: "Consultation",
    date: "05/02/2022",
    time: "14:00",
    symptoms: "Joint pain, Swelling", 
  },
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
    content: "You : Alright see you next week",
    profileImage: foto1,
    isRead: false,
  },
  {
    from: "Regan Roberts",
    date: "3:28 PM",
    content: "Megan: How About my illness?!",
    profileImage: foto2,
    isRead: true,
  },
  {
    from: "Alexander Preston",
    date: "13:18 PM",
    content: "Alexander: Everything feels overwhelming I’m lost in a world that doesn’t care",
    profileImage: foto3,
    isRead: true,
  },
  {
    from: "Kristina Stokes",
    date: "12:12 PM",
    content: "Kristina: I feel useless in this world",
    profileImage: foto4,
    isRead: true,
  },
  {
    from: "Johnathan Mcgee",
    date: "8:11 AM",
    content: "You: Try to sleep a litte more",
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
      const appointments = await controller.fetchUpcomingAppointments(documentId);
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
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <TopBar userName={userName} onLogout={handleLogout} />
      <div className="flex justify-center items-center mt-40 font-krub">
        <h1 className="text-white text-8xl font-bold text-center leading-snug">
          Welcome to
          <br /> <span>Serenity</span>
        </h1>
      </div>

      {/* Today's Schedule */}
      <section className="mt-220 ml-15 mr-15 mb-100">
  <h1 className="text-6xl text-white font-semibold drop-shadow-md mb-8">
    Today's Schedule
  </h1>
  <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-5xl mx-auto overflow-x-auto">
    {todaySchedule.length > 0 ? (
      <table className="min-w-full table-auto text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-gray-700">Patient</th>
            <th className="px-4 py-2 text-left text-gray-700">Service</th>
            <th className="px-4 py-2 text-left text-gray-700">Date</th>
            <th className="px-4 py-2 text-left text-gray-700">Time</th>
            <th className="px-4 py-2 text-left text-gray-700">Symptoms</th>
            <th className="px-4 py-2 text-center text-gray-700">Action</th> 
          </tr>
        </thead>
        <tbody>
          {todaySchedule.map((item, index) => (
            <tr
              key={index}
              className="border-b border-gray-300 hover:bg-gray-50"
            >
              <td className="px-4 py-2 font-medium text-gray-900 text-left">{item.patient}</td>
              <td className="px-4 py-2 text-gray-600 text-left">{item.service}</td>
              <td className="px-4 py-2 text-gray-600 text-left">{item.date}</td>
              <td className="px-4 py-2 text-gray-600 text-left">{item.time}</td>
              <td className="px-4 py-2 text-gray-600 text-left">{item.symptoms}</td>
              <td className="px-4 py-2 text-center">
                <button className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300">
                  Start
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="text-gray-700 text-lg">No schedule for today.</p>
    )}
  </div>
</section>
      {/* Upcoming Appointments */}
       <section className=" ml-4 mr-4 mb-50">
          <h1 className="text-6xl text-white font-semibold drop-shadow-md mb-8">
            Upcoming Appointments
          </h1>
          <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-5xl mx-auto">
            {upcomingAppointments.length > 0 ? (
              isMobile ? (
                upcomingAppointments.map((apt, idx) => (
                  <div key={idx} className="bg-gray-100 p-6 rounded-lg mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold text-gray-800">{apt.patientName}</h2>
                    <p className="text-gray-600 text-sm">Symptoms: {apt.symptoms}</p>
                    <p className="text-gray-600 text-sm">Service: {apt.service}</p>
                    <p className="text-gray-500 text-sm">
                      {apt.date} | {apt.time}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 w-full sm:w-auto">
                        Join Session
                      </button>
                      <button onClick={() => handleCancelAppointment(apt)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 w-full sm:w-auto sm:ml-auto">
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                upcomingAppointments.map((apt, idx) => (
                  <div key={idx} className="bg-gray-100 p-6 rounded-lg mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex justify-between items-center">
                    <div className="flex flex-col text-left">
                      <h2 className="text-2xl font-semibold text-gray-800">{apt.patientName}</h2>
                      <p className="text-gray-600 text-sm">Symptoms: {apt.symptoms}</p>
                      <p className="text-gray-600 text-sm">Service: {apt.service}</p>
                      <p className="text-gray-500 text-sm">
                        {apt.date} | {apt.time}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 w-auto">
                        Join Session
                      </button>
                      <button onClick={() => handleCancelAppointment(apt)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 w-auto">
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              <p className="text-gray-700 text-lg">No upcoming appointments.</p>
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
   <section className="mt-20 ml-15 mr-15 mb-20">
  <h1 className="text-6xl text-white font-semibold drop-shadow-md mb-8">
    Messages
  </h1>
  <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-5xl mx-auto">
    {messages.length > 0 ? (
      messages.map((msg, index) => (
        <div key={index} className="border-b border-gray-300 py-4 last:border-none">
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
                  <h3 className="text-xl font-semibold">{msg.from}</h3>
                  {!msg.isRead && (
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 mt-1 mx-auto" />)}
                </div>
                <p className="text-gray-500 text-sm">{msg.date}</p>
              </div>

              {/* Message Content */}
              <p className="text-gray-800 mt-1">{msg.content}</p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-700 text-lg">You have no new messages.</p>
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
          <p className="text-sm font-bold">© 2024 - 2025 Mental Health J&D Sp. co.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
