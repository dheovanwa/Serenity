import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import Loading from "../components/Loading";

interface DashboardProps {
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("documentId");
        if (!userId) {
          navigate("/signin");
          return;
        }

        const q = query(
          collection(db, "appointments"),
          where("patientId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const appointmentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAppointments(appointmentsData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Show loading screen while data is being fetched
  if (loading) {
    return <Loading isDarkMode={isDarkMode} />;
  }

  return (
    <div className="min-h-screen bg-[#F2EDE2] dark:bg-[#161F36] transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-center text-[#161F36] dark:text-white mb-8">
          Dashboard
        </h1>

        {/* Appointments section */}
        <div className="bg-white dark:bg-[#1A2947] rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#161F36] dark:text-white mb-4">
            Upcoming Appointments
          </h2>

          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No upcoming appointments found.
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#F9FAFB] dark:bg-[#2B3442] rounded-lg p-4 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {appointment.doctorName}
                    </p>
                    <h3 className="text-lg font-semibold text-[#161F36] dark:text-white truncate">
                      {appointment.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(appointment.dateTime).toLocaleString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-4">
                    <button
                      onClick={() =>
                        navigate(`/chat?appointmentId=${appointment.id}`)
                      }
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#BACBD8] text-[#161F36] hover:bg-[#9FB6C6] transition-colors"
                    >
                      Join Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other sections can be added here */}
      </div>
    </div>
  );
};

export default Dashboard;
