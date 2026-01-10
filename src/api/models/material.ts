export interface MaterialDto {
  id: number;
  courseRoundId: number;
  instructorId: number;
  instructorName: string;
  title: string;
  description?: string;
  link: string;
  materialType: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface CreateMaterialRequest {
  courseRoundId: number;
  title: string;
  description?: string;
  link: string;
  materialType?: string;
}

export interface UpdateMaterialRequest {
  title: string;
  description?: string;
  link: string;
  materialType?: string;
  isActive: boolean;
}
