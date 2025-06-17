import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface ChartData {
  x: string;
  y: number;
}

export interface RadarDataPoint {
  Health: string;
  Percentage: number;
}

export interface UserData {
  firstName: string;
  lastName: string;
}

export interface StressHistoryData {
  who5: number;
  gad7: number;
  phq9: number;
  mspss: number;
  cope: number;
  timestamp: number;
}

export class HomeModel {
  async getUserName(documentId: string): Promise<string> {
    try {
      const userDocRef = doc(db, "users", documentId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        return `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
      }
      return "User";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "User";
    }
  }

  async getStressHistory(documentId: string) {
    try {
      const userDocRef = doc(db, "users", documentId);
      const historyCollectionRef = collection(userDocRef, "history_stress");
      const latestQuery = query(
        historyCollectionRef,
        orderBy("timestamp", "desc"),
        limit(7)
      );
      const querySnapshot = await getDocs(latestQuery);

      if (!querySnapshot.empty) {
        return querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          timestamp: new Date(doc.data().timestamp).toLocaleDateString(),
        })) as StressHistoryData[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching stress history:", error);
      return [];
    }
  }

  transformToRadarData(latestData: StressHistoryData): RadarDataPoint[] {
    return [
      { Health: "Mood & Energy", Percentage: latestData.who5 || 0 },
      { Health: "Mental Calmness", Percentage: latestData.gad7 || 0 },
      { Health: "Emotional Wellbeing", Percentage: latestData.phq9 || 0 },
      { Health: "Social Support", Percentage: latestData.mspss || 0 },
      { Health: "Coping Mechanisms", Percentage: latestData.cope || 0 },
    ];
  }

  transformToLineChartData(historyData: StressHistoryData[]) {
    return {
      who5: historyData.map((doc) => ({ x: doc.timestamp, y: doc.who5 || 0 })),
      gad7: historyData.map((doc) => ({ x: doc.timestamp, y: doc.gad7 || 0 })),
      phq9: historyData.map((doc) => ({ x: doc.timestamp, y: doc.phq9 || 0 })),
      mspss: historyData.map((doc) => ({
        x: doc.timestamp,
        y: doc.mspss || 0,
      })),
      cope: historyData.map((doc) => ({ x: doc.timestamp, y: doc.cope || 0 })),
    };
  }
}
