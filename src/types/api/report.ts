export interface CreateStationReportDto {
  stationId: string;
  issueType: string;
  customDescription?: string;
}

export interface StationReportResponseDto {
  id: string;
  stationId: string;
  issueType: string;
  customDescription: string | null;
  createdAt: string;
}
