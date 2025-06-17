import { SurveyModel, SurveyPoints } from "../models/SurveyModel";

export class SurveyController {
  private model: SurveyModel;

  constructor() {
    this.model = new SurveyModel();
  }

  async checkAuthorization(documentId: string | null): Promise<{
    isAuthorized: boolean;
    shouldRedirect: boolean;
  }> {
    if (!documentId) {
      return { isAuthorized: false, shouldRedirect: true };
    }

    try {
      const userData = await this.model.checkUserAuthorization(documentId);

      if (!userData) {
        return { isAuthorized: false, shouldRedirect: true };
      }

      if (userData.lastSurveyTimestamp) {
        const lastSurveyDate = new Date(
          userData.lastSurveyTimestamp
        ).toDateString();
        const todayDate = new Date().toDateString();

        if (lastSurveyDate !== todayDate) {
          await this.model.updateSurveyStatus(documentId, false);
          return { isAuthorized: true, shouldRedirect: false };
        } else {
          return { isAuthorized: true, shouldRedirect: true };
        }
      }

      return { isAuthorized: true, shouldRedirect: false };
    } catch (error) {
      console.error("Authorization check error:", error);
      return { isAuthorized: false, shouldRedirect: true };
    }
  }

  async handleSurveyCompletion(points: SurveyPoints) {
    try {
      const documentId = localStorage.getItem("documentId");
      if (!documentId) return false;

      const calculatedPercentages = this.model.calculatePercentages(points);
      await this.model.saveSurveyResults(documentId, calculatedPercentages);

      return true;
    } catch (error) {
      console.error("Survey completion error:", error);
      return false;
    }
  }

  getPointsScale() {
    return this.model.getPointsScale();
  }
}
