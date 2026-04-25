import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { CreateReviewDto, ReviewResponseDto, StationRatingSummaryDto } from '../types/api/review';

export const reviewApi = {
  getByStation: (stationId: string) =>
    apiFetch<StationRatingSummaryDto>(ENDPOINTS.reviewsByStation(stationId)),

  create: (body: CreateReviewDto) =>
    apiFetch<ReviewResponseDto>(ENDPOINTS.REVIEWS, { method: 'POST', body }),

  remove: (reviewId: string) =>
    apiFetch<null>(ENDPOINTS.reviewDelete(reviewId), { method: 'DELETE' }),
};
