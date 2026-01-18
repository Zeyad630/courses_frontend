import type { Course, CourseLevel, CourseStatus } from 'src/types/course';

import type { CourseDto, CourseLevelId, CreateCourseRequest, UpdateCourseRequest } from '../models/course';

const levelIdToLevel = (levelId: CourseLevelId): CourseLevel => {
  switch (levelId) {
    case 1:
      return 'beginner';
    case 2:
      return 'intermediate';
    case 3:
    default:
      return 'advanced';
  }
};

const levelToLevelId = (level: CourseLevel): CourseLevelId => {
  switch (level) {
    case 'beginner':
      return 1;
    case 'intermediate':
      return 2;
    case 'advanced':
    default:
      return 3;
  }
};

const toCourseStatus = (value: unknown): CourseStatus => {
  if (value === 'inactive' || value === 'archived' || value === 'active') return value;
  return 'active';
};

const toDate = (value: unknown): Date => {
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
};

export const mapCourseDtoToCourse = (dto: CourseDto): Course => ({
  id: String(dto.id),
  name: dto.title ?? '',
  code: dto.code ?? '',
  description: dto.description ?? '',
  category: dto.category ?? '',
  level: levelIdToLevel((dto.levelStatusId as CourseLevelId) ?? 3),
  price: dto.price ?? 0,
  instructor: dto.instructor ?? '',
  instructorId: dto.instructorId != null ? String(dto.instructorId) : '',
  duration: dto.durationHours ?? 0,
  students: dto.students ?? 0,
  rating: dto.rating ?? 0,
  status: toCourseStatus(dto.status),
  image: undefined,
  createdAt: toDate(dto.createdAt),
  updatedAt: toDate(dto.updatedAt),
  content: undefined,
});

export const mapCreateCourseInputToRequest = (input: {
  name: string;
  description: string;
  level: CourseLevel;
  duration: number;
  price: number;
  maxStudents?: number;
}): CreateCourseRequest => ({
  title: input.name,
  description: input.description,
  levelStatusId: levelToLevelId(input.level),
  durationHours: input.duration,
  maxStudents: input.maxStudents ?? 35,
  price: input.price,
});

export const mapUpdateCourseInputToRequest = (input: {
  name?: string;
  description?: string;
  level?: CourseLevel;
  duration?: number;
  price?: number;
  maxStudents?: number;
}): UpdateCourseRequest => {
  const payload: UpdateCourseRequest = {};

  if (typeof input.name === 'string') payload.title = input.name;
  if (typeof input.description === 'string') payload.description = input.description;
  if (typeof input.level === 'string') payload.levelStatusId = levelToLevelId(input.level);
  if (typeof input.duration === 'number') payload.durationHours = input.duration;
  if (typeof input.price === 'number') payload.price = input.price;
  if (typeof input.maxStudents === 'number') payload.maxStudents = input.maxStudents;

  return payload;
};
