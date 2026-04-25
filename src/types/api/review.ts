// ── Request types ───────────────────────────────────────────────

export interface CreateReviewDto {
  stationId: string;
  stationTitle: string;
  rating: number;
  comment?: string;
  tags?: string[];
  photos?: string[];
}

// ── Response types ──────────────────────────────────────────────

export interface ReviewResponseDto {
  id: string;
  userId: string;
  userFullName: string;
  userInitials: string;
  rating: number;
  comment: string | null;
  tags: string[];
  photos: string[];
  createdAt: string;
}

export interface StationRatingSummaryDto {
  averageRating: number;
  totalReviews: number;
  reviews: ReviewResponseDto[];
}
