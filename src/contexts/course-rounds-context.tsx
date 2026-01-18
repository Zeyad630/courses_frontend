import type { User } from 'src/types/user';
import type { CourseRoundDto } from 'src/api/models/course-round';
import type { CourseRoundStudentDto } from 'src/api/models/course-round-student';

import { useMemo, useEffect, useContext, useReducer, useCallback, createContext, useState } from 'react';

import { ApiError } from 'src/api/errors';
import { useAuth } from 'src/contexts/simple-auth-context';
import { courseRoundApi, courseRoundStudentApi } from 'src/api';

type CourseRoundStatus = 'scheduled' | 'active' | 'finished' | 'cancelled';

export type CourseRound = {
  id: string;
  courseId: string;
  roundNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  details: string;
  status: CourseRoundStatus;
  statusId?: number;
  statusName?: string;
  minStudents?: number | null;
  maxStudents?: number | null;
  price?: number | null;
  question1?: string | null;
  question2?: string | null;
  question3?: string | null;
  question4?: string | null;
  question5?: string | null;
  question6?: string | null;
  question7?: string | null;
  question8?: string | null;
  question9?: string | null;
  question10?: string | null;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
};

export type RoundAssignment = {
  id: string;
  courseId: string;
  roundId: string;
  studentId: string;
  assignedAt: string;
};

type CourseRoundsState = {
  rounds: CourseRound[];
  assignments: RoundAssignment[];
};

type CreateRoundInput = {
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  details: string;
  createdBy: User['id'];
};

type UpdateRoundInput = Partial<Pick<CourseRound, 'name' | 'startDate' | 'endDate' | 'details' | 'status'>> & {
  maxStudents?: number | null;
};

type AssignStudentsInput = {
  courseId: string;
  roundId: string;
  studentIds: Array<User['id']>;
};

type CourseRoundsAction =
  | { type: 'SET_STATE'; payload: CourseRoundsState }
  | { type: 'SET_ROUNDS'; payload: CourseRound[] }
  | { type: 'ADD_ROUND'; payload: CourseRound }
  | { type: 'UPDATE_ROUND'; payload: { id: string; updates: UpdateRoundInput } }
  | { type: 'DELETE_ROUND'; payload: { id: string } }
  | { type: 'UPSERT_ASSIGNMENTS'; payload: RoundAssignment[] }
  | { type: 'DELETE_ASSIGNMENTS_FOR_ROUND'; payload: { roundId: string } };

type CourseRoundsContextValue = CourseRoundsState & {
  createRound: (input: CreateRoundInput) => Promise<CourseRound>;
  updateRound: (id: string, updates: UpdateRoundInput) => Promise<void>;
  deleteRound: (id: string) => Promise<void>;
  getRoundsByCourse: (courseId: string) => CourseRound[];
  getRoundById: (roundId: string) => CourseRound | undefined;
  assignStudentsToRound: (input: AssignStudentsInput) => Promise<void>;
  getAssignmentForStudent: (courseId: string, studentId: string) => RoundAssignment | undefined;
  getRoundForStudent: (courseId: string, studentId: string) => CourseRound | undefined;
  getAssignmentsByRound: (roundId: string) => RoundAssignment[];
};

const STORAGE_KEY = 'course_rounds_v1';

const safeParseState = (raw: string | null): CourseRoundsState => {
  if (!raw) return { rounds: [], assignments: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<CourseRoundsState>;
    const rounds = Array.isArray(parsed.rounds) ? (parsed.rounds as CourseRound[]) : [];
    const assignments = Array.isArray(parsed.assignments) ? (parsed.assignments as RoundAssignment[]) : [];
    return { rounds, assignments };
  } catch {
    return { rounds: [], assignments: [] };
  }
};

const nowIso = () => new Date().toISOString();

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const toDateOnly = (value: string) => (value.includes('T') ? value.split('T')[0] : value);

function reducer(state: CourseRoundsState, action: CourseRoundsAction): CourseRoundsState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'SET_ROUNDS':
      return { ...state, rounds: action.payload };
    case 'ADD_ROUND':
      return { ...state, rounds: [action.payload, ...state.rounds] };
    case 'UPDATE_ROUND':
      return {
        ...state,
        rounds: state.rounds.map((r) =>
          r.id === action.payload.id
            ? { ...r, ...action.payload.updates, updatedAt: nowIso() }
            : r
        ),
      };
    case 'DELETE_ROUND':
      return {
        ...state,
        rounds: state.rounds.filter((r) => r.id !== action.payload.id),
        assignments: state.assignments.filter((a) => a.roundId !== action.payload.id),
      };
    case 'UPSERT_ASSIGNMENTS': {
      const next = [...state.assignments];
      action.payload.forEach((incoming) => {
        const idx = next.findIndex(
          (a) => a.courseId === incoming.courseId && a.studentId === incoming.studentId
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], ...incoming };
        } else {
          next.push(incoming);
        }
      });
      return { ...state, assignments: next };
    }
    case 'DELETE_ASSIGNMENTS_FOR_ROUND':
      return { ...state, assignments: state.assignments.filter((a) => a.roundId !== action.payload.roundId) };
    default:
      return state;
  }
}

const CourseRoundsContext = createContext<CourseRoundsContextValue | undefined>(undefined);

export function useCourseRoundsContext(): CourseRoundsContextValue {
  const ctx = useContext(CourseRoundsContext);
  if (!ctx) throw new Error('useCourseRoundsContext must be used within a CourseRoundsProvider');
  return ctx;
}

export function CourseRoundsProvider({ children }: { children: React.ReactNode }) {
  const { user, hasRole } = useAuth();
  const [state, dispatch] = useReducer(reducer, { rounds: [], assignments: [] });
  const [loading, setLoading] = useState(false);

  // Load course rounds from API
  const loadCourseRounds = useCallback(async () => {
    try {
      setLoading(true);
      const rounds: CourseRoundDto[] = await courseRoundApi.getAll();
      // Map backend DTOs to frontend CourseRound type
      const mappedRounds: CourseRound[] = rounds.map((r) => ({
        id: String(r.id),
        courseId: String(r.courseId),
        roundNumber: r.roundNumber,
        name: `Round ${r.roundNumber}`,
        startDate: r.startDate,
        endDate: r.endDate,
        details: '',
        status: mapStatusNameToStatus(r.statusId ?? r.status),
        statusId: r.statusId,
        statusName: typeof r.status === 'string' ? r.status : undefined,
        minStudents: r.minStudents ?? null,
        maxStudents: r.maxStudents ?? null,
        price: r.price ?? null,
        question1: r.question1 ?? null,
        question2: r.question2 ?? null,
        question3: r.question3 ?? null,
        question4: r.question4 ?? null,
        question5: r.question5 ?? null,
        question6: r.question6 ?? null,
        question7: r.question7 ?? null,
        question8: r.question8 ?? null,
        question9: r.question9 ?? null,
        question10: r.question10 ?? null,
        createdBy:
          r.instructorId != null
            ? String(r.instructorId)
            : r.InstructorId != null
              ? String(r.InstructorId)
              : r.mainInstructorId != null
                ? String(r.mainInstructorId)
                : '',
        createdByName: typeof r.instructorName === 'string' ? r.instructorName : undefined,
        createdAt: r.createdAt ?? '',
        updatedAt: '',
      }));
      dispatch({ type: 'SET_ROUNDS', payload: mappedRounds });
    } catch (error) {
      console.error('Failed to load course rounds:', error);
      // Don't show error to user here - let components handle it
      // The error will be caught by error boundaries or individual components
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourseRounds();
  }, []);

  const mapStudentAssignments = useCallback(
    (dtos: CourseRoundStudentDto[], rounds: CourseRound[]): RoundAssignment[] =>
      dtos
        .map((dto) => {
          const roundId = String(dto.courseRoundId);
          const round = rounds.find((r) => r.id === roundId);
          return {
            id: String(dto.id),
            courseId: round?.courseId ?? '',
            roundId,
            studentId: String(dto.studentId),
            assignedAt: dto.assignedAt,
          };
        })
        .filter((a) => a.courseId !== ''),
    []
  );

  const loadAssignmentsForStudent = useCallback(async () => {
    if (!hasRole('student')) return;
    const studentId = Number(user?.id);
    if (!Number.isFinite(studentId) || studentId <= 0) return;
    if (state.rounds.length === 0) return;

    try {
      const dtos = await courseRoundStudentApi.getByStudentId(studentId);
      const mapped = mapStudentAssignments(dtos, state.rounds);
      dispatch({ type: 'UPSERT_ASSIGNMENTS', payload: mapped });
    } catch (error) {
      console.error('Failed to load course round assignments for student:', error);
    }
  }, [hasRole, mapStudentAssignments, state.rounds, user?.id]);

  useEffect(() => {
    loadAssignmentsForStudent();
  }, [loadAssignmentsForStudent]);

  // Helper to map backend statusId or status name to frontend status
  const mapStatusNameToStatus = (statusName: string | number | undefined): CourseRoundStatus => {
    if (typeof statusName === 'number') {
      // Map statusId to status based on backend IDs
      if (statusName === 18) return 'scheduled'; // Open for Enrollment
      if (statusName === 38) return 'scheduled'; // Scheduled
      if (statusName === 20) return 'active'; // Active
      if (statusName === 21) return 'finished'; // Completed
      if (statusName === 19) return 'cancelled'; // Cancelled

      // Legacy / fallback mappings
      if (statusName === 1 || statusName === 7) return 'scheduled';
      if (statusName === 2 || statusName === 4) return 'active';
      if (statusName === 3 || statusName === 5) return 'finished';
      if (statusName === 6) return 'cancelled';
      return 'scheduled';
    }
    const lower = String(statusName || '').toLowerCase();
    if (lower.includes('open') || lower.includes('enrollment')) return 'scheduled'; // openToEnrollment maps to scheduled
    if (lower.includes('active')) return 'active';
    if (lower.includes('finished') || lower.includes('completed')) return 'finished';
    if (lower.includes('cancelled') || lower.includes('canceled')) return 'cancelled';
    return 'scheduled';
  };

  const createRound = useCallback(async (input: CreateRoundInput): Promise<CourseRound> => {
    let payload:
      | {
          courseId: number;
          roundNumber: number;
          startDate: string;
          endDate: string;
          mainInstructorId: number;
          statusId: number;
        }
      | undefined;

    try {
      const courseId = Number(input.courseId);
      if (!Number.isFinite(courseId)) throw new Error('Invalid courseId');

      const userId = Number(input.createdBy);
      if (!Number.isFinite(userId) || userId <= 0) throw new Error('Invalid instructor id');

      const rounds = await courseRoundApi.getAll();
      const courseRounds = rounds.filter((r) => r.courseId === courseId);
      const maxRoundNumber = courseRounds.reduce((acc, r) => (r.roundNumber > acc ? r.roundNumber : acc), 0);
      const roundNumber = maxRoundNumber + 1;

      payload = {
        courseId,
        roundNumber,
        startDate: toDateOnly(input.startDate),
        endDate: toDateOnly(input.endDate),
        mainInstructorId: userId,
        statusId: 7,
      };

      const response = await courseRoundApi.create(payload);

      const created: CourseRound = {
        id: String(response.id),
        courseId: input.courseId,
        roundNumber,
        name: input.name || `Round ${roundNumber}`,
        startDate: toDateOnly(input.startDate),
        endDate: toDateOnly(input.endDate),
        details: input.details,
        status: 'scheduled',
        statusId: 7,
        maxStudents: null,
        minStudents: null,
        price: null,
        question1: null,
        question2: null,
        question3: null,
        question4: null,
        question5: null,
        question6: null,
        question7: null,
        question8: null,
        question9: null,
        question10: null,
        createdBy: input.createdBy,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      
      dispatch({ type: 'ADD_ROUND', payload: created });
      await loadCourseRounds(); // Reload from API
      return created;
    } catch (error) {
      const maybeApiError = error as ApiError;
      console.error('Failed to create course round:', {
        payload,
        error,
        status: maybeApiError?.status,
        data: maybeApiError?.data,
      });
      throw error;
    }
  }, [state.rounds, loadCourseRounds]);

  const updateRound = useCallback(async (id: string, updates: UpdateRoundInput) => {
    try {
      const roundId = Number(id);

      const normalizedMaxStudents =
        updates.maxStudents === undefined
          ? undefined
          : updates.maxStudents === null
            ? null
            : Number(updates.maxStudents);
      if (updates.status) {
        // Map frontend status to backend statusId (this is a simplification)
        const statusIdMap: Record<string, number> = {
          scheduled: 7,
          active: 4,
          finished: 5,
          cancelled: 6,
        };
        await courseRoundApi.patch(roundId, { statusId: statusIdMap[updates.status] || 1 });
      }
      
      if (updates.startDate || updates.endDate || updates.maxStudents !== undefined) {
        await courseRoundApi.update(roundId, {
          startDate: updates.startDate?.split('T')[0],
          endDate: updates.endDate?.split('T')[0],
          maxStudents: normalizedMaxStudents === null ? undefined : normalizedMaxStudents,
        });
      }

      const nextUpdates: UpdateRoundInput = {
        ...updates,
        ...(normalizedMaxStudents !== undefined ? { maxStudents: normalizedMaxStudents } : {}),
      };

      dispatch({ type: 'UPDATE_ROUND', payload: { id, updates: nextUpdates } });
      await loadCourseRounds(); // Reload from API
    } catch (error) {
      console.error('Failed to update course round:', error);
      throw error;
    }
  }, [loadCourseRounds]);

  const deleteRound = useCallback(async (id: string) => {
    try {
      await courseRoundApi.delete(Number(id));
      dispatch({ type: 'DELETE_ROUND', payload: { id } });
      await loadCourseRounds(); // Reload from API
    } catch (error) {
      console.error('Failed to delete course round:', error);
      throw error;
    }
  }, [loadCourseRounds]);

  const getRoundsByCourse = useCallback(
    (courseId: string) => state.rounds.filter((r) => r.courseId === courseId),
    [state.rounds]
  );

  const getRoundById = useCallback(
    (roundId: string) => state.rounds.find((r) => r.id === roundId),
    [state.rounds]
  );

  const assignStudentsToRound = useCallback(async (input: AssignStudentsInput) => {
    try {
      const roundId = Number(input.roundId);
      
      // Assign each student using the API
      for (const studentId of input.studentIds) {
        try {
          await courseRoundStudentApi.assignStudent(roundId, {
            studentId: Number(studentId),
          });
          
          // Update local state
          const assignment: RoundAssignment = {
            id: uid(),
            courseId: input.courseId,
            roundId: input.roundId,
            studentId,
            assignedAt: nowIso(),
          };
          dispatch({ type: 'UPSERT_ASSIGNMENTS', payload: [assignment] });
        } catch (error) {
          console.error(`Failed to assign student ${studentId}:`, error);
          // Continue with other students even if one fails
        }
      }
    } catch (error) {
      console.error('Failed to assign students:', error);
      throw error;
    }
  }, []);

  const getAssignmentForStudent = useCallback(
    (courseId: string, studentId: string) =>
      state.assignments.find((a) => a.courseId === courseId && a.studentId === studentId),
    [state.assignments]
  );

  const getAssignmentsByRound = useCallback(
    (roundId: string) => state.assignments.filter((a) => a.roundId === roundId),
    [state.assignments]
  );

  const getRoundForStudent = useCallback(
    (courseId: string, studentId: string) => {
      const assignment = state.assignments.find((a) => a.courseId === courseId && a.studentId === studentId);
      if (!assignment) return undefined;
      return state.rounds.find((r) => r.id === assignment.roundId);
    },
    [state.assignments, state.rounds]
  );

  const value = useMemo(
    () => ({
      ...state,
      createRound,
      updateRound,
      deleteRound,
      getRoundsByCourse,
      getRoundById,
      assignStudentsToRound,
      getAssignmentForStudent,
      getRoundForStudent,
      getAssignmentsByRound,
    }),
    [
      state,
      createRound,
      updateRound,
      deleteRound,
      getRoundsByCourse,
      getRoundById,
      assignStudentsToRound,
      getAssignmentForStudent,
      getRoundForStudent,
      getAssignmentsByRound,
    ]
  );

  return <CourseRoundsContext.Provider value={value}>{children}</CourseRoundsContext.Provider>;
}
