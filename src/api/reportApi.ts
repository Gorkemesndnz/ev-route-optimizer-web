import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { CreateStationReportDto, StationReportResponseDto } from '../types/api/report';

export const reportApi = {
  create: (body: CreateStationReportDto) =>
    apiFetch<StationReportResponseDto>(ENDPOINTS.REPORTS, { method: 'POST', body }),
};
