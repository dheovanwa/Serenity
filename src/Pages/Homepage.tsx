import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { HomeController } from "../controllers/HomeController";
import backgroundImage from "../assets/Master Background11.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import { LineCharts } from "../components/Chart";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import RadarChart from "../components/RadarChart";
import TopBar from "../components/TopBar";
import type { RadarDataPoint, ChartData } from "../models/HomeModel";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";

const Homepage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([
    { Health: "Mood & Energy", Percentage: 0 },
    { Health: "Mental Calmness", Percentage: 0 },
    { Health: "Emotional Wellbeing", Percentage: 0 },
    { Health: "Social Support", Percentage: 0 },
    { Health: "Coping Mechanisms", Percentage: 0 },
  ]);
  const [lineChartData, setLineChartData] = useState<{
    who5: ChartData[];
    gad7: ChartData[];
    phq9: ChartData[];
    mspss: ChartData[];
    cope: ChartData[];
  }>({
    who5: [],
    gad7: [],
    phq9: [],
    mspss: [],
    cope: [],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCallEndedDialog, setShowCallEndedDialog] = useState(false);

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

      const { radarData: radar, lineChartData: lineData } =
        await controller.fetchChartData(documentId);

      setRadarData(radar);
      setLineChartData(lineData);
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Check if user was redirected due to psychiatrist ending the call
    if (searchParams.get("callEnded") === "psychiatrist") {
      setShowCallEndedDialog(true);
      // Remove the query parameter from URL
      searchParams.delete("callEnded");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Add useEffect to listen for calls with matching appointmentId
  useEffect(() => {
    const documentId = localStorage.getItem("documentId");
    if (!documentId) return;

    let unsubscribe: (() => void) | undefined;

    const setupCallListener = async () => {
      try {
        // Get user's active appointments
        const userAppointmentsQuery = query(
          collection(db, "appointments"),
          where("patientId", "==", documentId),
          where("status", "in", ["Sedang berlangsung"])
        );
        console.log("Listening for user appointments...");

        // Listen for user appointments to get appointmentIds
        const unsubAppointments = onSnapshot(
          userAppointmentsQuery,
          (appointmentSnapshot) => {
            const appointmentIds = appointmentSnapshot.docs.map(
              (doc) => doc.id
            );

            console.log("Active appointmentIds:", appointmentIds);

            if (appointmentIds.length === 0) return;

            // Listen for calls with matching appointmentIds
            const callsQuery = query(
              collection(db, "calls"),
              where("appointmentId", "in", appointmentIds)
            );

            if (unsubscribe) {
              unsubscribe();
            }

            unsubscribe = onSnapshot(callsQuery, (callSnapshot) => {
              callSnapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                  const callDoc = change.doc;
                  const callData = callDoc.data();

                  // Navigate to the video call
                  console.log(
                    `Found matching call for appointmentId: ${callData.appointmentId}`
                  );
                  navigate(`/video-call/${callDoc.id}`);
                }
              });
            });
          }
        );

        // Return cleanup function for appointments listener
        return () => {
          unsubAppointments();
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error("Error setting up call listener:", error);
      }
    };

    setupCallListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigate]);

  AppointmentStatusUpdater();

  const handleLogout = () => {
    controller.handleLogout();
    navigate("/signin");
  };

  const handleCloseCallEndedDialog = () => {
    setShowCallEndedDialog(false);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <TopBar userName={userName} onLogout={handleLogout} />
      <div className="flex justify-center items-center mt-60 font-krub">
        <h1 className="text-white text-8xl font-bold text-center leading-snug">
          Welcome to
          <br /> <span>Serenity</span>
        </h1>
      </div>

      {/* Radar Chart */}
      <h1 className="mt-20 font-bold text-4xl text-center leading-snug text-black pt-110">
        Radar Chart
      </h1>
      <div className="flex justify-center items-center text-white pt-10">
        <RadarChart
          data={radarData}
          dataKey="Percentage"
          labelKey="Health"
          strokeColor="black"
          fillColor="white"
          width="100%"
          height={750}
          marginTop={100}
        />
      </div>

      {/* Statistics */}
      <div className="mt-5 ml-15">
        <h1 className="text-7xl text-white font-semibold drop-shadow-md mb-10">
          Statistics
        </h1>
        <div className="grid md:grid-cols-3 gap-15 mr-20">
          {/* Mood & Energy */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Mood & Energy
            </h1>
            <div className="w-full h-150">
              <LineCharts
                data={lineChartData.who5}
                title="Mood & Energy"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>

          {/* Mental Calmness */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Mental Calmness
            </h1>
            <div className="w-full h-150">
              <LineCharts
                data={lineChartData.gad7}
                title="Mental Calmness"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>

          {/* Emotional Wellbeing */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Emotional Wellbeing
            </h1>
            <div className="w-full h-150">
              <LineCharts
                data={lineChartData.phq9}
                title="Emotional Wellbeing"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-15 mr-20 mb-25">
          {/* Mood & Energy */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Social Support
            </h1>
            <div className="w-3/4 h-150">
              <LineCharts
                data={lineChartData.mspss}
                title="Social Support"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>

          {/* Coping Mechanisms */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Coping Mechanisms
            </h1>
            <div className="w-3/4 h-150">
              <LineCharts
                data={lineChartData.cope}
                title="Coping Mechanisms"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Psychiatrists */}
      <div className="mt-30 ml-6 sm:ml-15">
        <h1
          className="text-5xl text-white font-semibold mb-10"
          style={{ textShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)" }}
        >
          Recommended Psychiatrists
        </h1>
        <div className="flex justify-center items-center mb-10">
          {/* Ensure the carousel container is responsive */}
          <div className="w-full" style={{ maxWidth: "1200px" }}>
            <CarouselDemo />
          </div>
        </div>
      </div>

      <footer className="bg-[#453A2F] text-white pt-5">
        <div className="mx-auto ml-20 mr-20 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Section: Website Name and Social Links */}
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

            {/* Middle Section: Consumer Complaints Service */}
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
            Â© 2024 - 2025 Mental Health J&D Sp. co.
          </p>
        </div>
      </footer>

      {/* Call Ended Dialog */}
      {showCallEndedDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[300px] sm:w-[400px] max-w-md mx-4">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Video Call Berakhir
            </h2>
            <p className="text-black dark:text-gray-300 mb-6">
              Psikolog telah mengakhiri sesi video call. Jika ini adalah
              kesalahan, Anda dapat bergabung kembali atau menghubungi customer
              support.
            </p>
            <div className="flex justify-center">
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                onClick={handleCloseCallEndedDialog}
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
