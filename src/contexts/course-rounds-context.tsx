import type { User } from 'src/types/user';

import { useMemo, useEffect, useContext, useReducer, useCallback, createContext } from 'react';

type CourseRoundStatus = 'scheduled' | 'active' | 'finished' | 'cancelled';

export type CourseRound = {
  id: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  details: string;
  status: CourseRoundStatus;
  createdBy: string;
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

type UpdateRoundInput = Partial<Pick<CourseRound, 'name' | 'startDate' | 'endDate' | 'details' | 'status'>>;

type AssignStudentsInput = {
  courseId: string;
  roundId: string;
  studentIds: Array<User['id']>;
};

type CourseRoundsAction =
  | { type: 'SET_STATE'; payload: CourseRoundsState }
  | { type: 'ADD_ROUND'; payload: CourseRound }
  | { type: 'UPDATE_ROUND'; payload: { id: string; updates: UpdateRoundInput } }
  | { type: 'DELETE_ROUND'; payload: { id: string } }
  | { type: 'UPSERT_ASSIGNMENTS'; payload: RoundAssignment[] }
  | { type: 'DELETE_ASSIGNMENTS_FOR_ROUND'; payload: { roundId: string } };

type CourseRoundsContextValue = CourseRoundsState & {
  createRound: (input: CreateRoundInput) => CourseRound;
  updateRound: (id: string, updates: UpdateRoundInput) => void;
  deleteRound: (id: string) => void;
  getRoundsByCourse: (courseId: string) => CourseRound[];
  getRoundById: (roundId: string) => CourseRound | undefined;
  assignStudentsToRound: (input: AssignStudentsInput) => void;
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

function reducer(state: CourseRoundsState, action: CourseRoundsAction): CourseRoundsState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
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
  const [state, dispatch] = useReducer(reducer, undefined, () => safeParseState(localStorage.getItem(STORAGE_KEY)));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const createRound = useCallback((input: CreateRoundInput): CourseRound => {
    const created: CourseRound = {
      id: uid(),
      courseId: input.courseId,
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      details: input.details,
      status: 'scheduled',
      createdBy: input.createdBy,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    dispatch({ type: 'ADD_ROUND', payload: created });
    return created;
  }, []);

  const updateRound = useCallback((id: string, updates: UpdateRoundInput) => {
    dispatch({ type: 'UPDATE_ROUND', payload: { id, updates } });
  }, []);

  const deleteRound = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ROUND', payload: { id } });
  }, []);

  const getRoundsByCourse = useCallback(
    (courseId: string) => state.rounds.filter((r) => r.courseId === courseId),
    [state.rounds]
  );

  const getRoundById = useCallback(
    (roundId: string) => state.rounds.find((r) => r.id === roundId),
    [state.rounds]
  );

  const assignStudentsToRound = useCallback((input: AssignStudentsInput) => {
    const createdAt = nowIso();
    const assignments: RoundAssignment[] = input.studentIds.map((studentId) => ({
      id: uid(),
      courseId: input.courseId,
      roundId: input.roundId,
      studentId,
      assignedAt: createdAt,
    }));

    dispatch({ type: 'UPSERT_ASSIGNMENTS', payload: assignments });
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
