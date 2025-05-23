import { HomeModel, ChartData, RadarDataPoint } from "../models/HomeModel";

export class HomeController {
  private model: HomeModel;

  constructor() {
    this.model = new HomeModel();
  }

  async checkAuthentication(documentId: string | null): Promise<boolean> {
    return documentId !== null;
  }

  async fetchUserName(documentId: string | null): Promise<string> {
    if (!documentId) return "User";
    return await this.model.getUserName(documentId);
  }

  async fetchChartData(documentId: string | null): Promise<{
    radarData: RadarDataPoint[];
    lineChartData: {
      who5: ChartData[];
      gad7: ChartData[];
      phq9: ChartData[];
      mspss: ChartData[];
      cope: ChartData[];
    };
  }> {
    if (!documentId) {
      return {
        radarData: [],
        lineChartData: { who5: [], gad7: [], phq9: [], mspss: [], cope: [] },
      };
    }

    const historyData = await this.model.getStressHistory(documentId);

    if (historyData.length === 0) {
      return {
        radarData: [],
        lineChartData: { who5: [], gad7: [], phq9: [], mspss: [], cope: [] },
      };
    }

    const radarData = this.model.transformToRadarData(historyData[0]);
    const lineChartData = this.model.transformToLineChartData(historyData);

    return { radarData, lineChartData };
  }

  handleLogout(): void {
    localStorage.removeItem("documentId");
  }
}
