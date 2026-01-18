export interface MaterialDto {
  id: number;
  courseRoundId: number;
  createdByAccountId?: number;
  weekId?: number;
  statusId?: number;
  materialTypeStatusId?: number;
  instructorId?: number;
  instructorName?: string;
  title: string;
  description?: string;
  link?: string | null;
  materialType?: string;
  meetingId?: string;
  meetingPassword?: string;
  parentMaterialId?: number | null;
  childMaterials?: MaterialDto[];
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface CreateMaterialRequest {
  courseRoundId: number;
  title: string;
  description?: string;
  link: string;
  materialType?: string;
  createdByAccountId?: number;
  weekId?: number;
  parentMaterialId?: number | null;
  materialTypeStatusId?: number;
  meetingId?: string;
  meetingPassword?: string;
}

export interface UpdateMaterialRequest {
  title: string;
  description?: string;
  link: string;
  materialType?: string;
  materialTypeStatusId?: number;
  isActive: boolean;
}
