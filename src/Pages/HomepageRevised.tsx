import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import type { RadarDataPoint, ChartData } from "../models/HomeModel";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";

const HomepageR: React.FC = () => {
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

  //   const handleLogout = () => {
  //     controller.handleLogout();
  //     navigate("/signin");
  //   };

  return (
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
  );
};

export default HomepageR;
