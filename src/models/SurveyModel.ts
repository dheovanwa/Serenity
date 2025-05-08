import { doc, collection, getDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export interface SurveyPoints {
  who5: number;
  gad7: number;
  phq9: number;
  mspss: number;
  cope: number;
  highRisk: number;
}

export class SurveyModel {
  private pointsScale = [4, 3, 2, 1, 0];

  async checkUserAuthorization(documentId: string) {
    const userDocRef = doc(db, "users", documentId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      lastSurveyTimestamp: userData.lastSurveyTimestamp || null,
      dailySurveyCompleted: userData.dailySurveyCompleted,
    };
  }

  async updateSurveyStatus(documentId: string, status: boolean) {
    const userDocRef = doc(db, "users", documentId);
    await updateDoc(userDocRef, { dailySurveyCompleted: status });
  }

  calculatePercentages(points: SurveyPoints) {
    return {
      who5: parseFloat(((((points.who5 / 15) * 100) / 80) * 100).toFixed(2)),
      gad7: parseFloat(((((points.gad7 / 15) * 100) / 80) * 100).toFixed(2)),
      phq9: parseFloat(((((points.phq9 / 10) * 100) / 80) * 100).toFixed(2)),
      mspss: parseFloat(((((points.mspss / 10) * 100) / 80) * 100).toFixed(2)),
      cope: parseFloat(((((points.cope / 10) * 100) / 80) * 100).toFixed(2)),
      highRisk: points.highRisk,
    };
  }

  async saveSurveyResults(documentId: string, results: any) {
    const userDocRef = doc(db, "users", documentId);
    const historyCollectionRef = collection(userDocRef, "history_stress");
    const timestamp = Date.now();

    await addDoc(historyCollectionRef, {
      timestamp,
      ...results,
    });

    await updateDoc(userDocRef, {
      dailySurveyCompleted: true,
      lastSurveyTimestamp: timestamp,
    });
  }

  getPointsScale() {
    return this.pointsScale;
  }
}
