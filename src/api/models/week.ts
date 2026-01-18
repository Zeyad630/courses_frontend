import type { MaterialDto } from './material';

export interface WeekDto {
  id: number;
  courseRoundId?: number;
  title?: string;
  weekTitle?: string;
  startDate: string; // DateOnly format: YYYY-MM-DD
  endDate: string; // DateOnly format: YYYY-MM-DD
  businessEntityName?: string;
  accountId?: number;
  courseMaterials?: MaterialDto[];
}

export interface CreateWeekRequest {
  courseRoundId: number;
  title?: string;
  weekTitle?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  businessEntityName?: string;
  accountId?: number;
}

export interface UpdateWeekRequest {
  title?: string;
  weekTitle?: string;
  startDate: string;
  endDate: string;
  businessEntityName?: string;
  accountId?: number;
}
