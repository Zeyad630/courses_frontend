export interface WeekDto {
  id: number;
  courseRoundId: number;
  title: string;
  startDate: string; // DateOnly format: YYYY-MM-DD
  endDate: string; // DateOnly format: YYYY-MM-DD
  businessEntityName: string;
}

export interface CreateWeekRequest {
  courseRoundId: number;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  businessEntityName?: string;
}

export interface UpdateWeekRequest {
  title: string;
  startDate: string;
  endDate: string;
  businessEntityName?: string;
}
