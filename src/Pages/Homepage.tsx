import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import { LineCharts } from "../components/Chart";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import RadarChart from "../components/RadarChart";
import TopBar from "../components/TopBar";
import type { RadarDataPoint, ChartData } from "../models/HomeModel";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";
import Footer from "../components/Footer";

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

  AppointmentStatusUpdater();

  const handleLogout = () => {
    controller.handleLogout();
    navigate("/signin");
  };

  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden"
      style={{ backgroundColor: `#F2EDE2` }}
    >
      <div className="bg-white p-6 text-center">
        <p className="text-6xl font-semibold text-gray-800">
          Selamat Datang, {userName}
        </p>
      </div>

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
      <Footer />
    </div>
  );
};

export default Homepage;
