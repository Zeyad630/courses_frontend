import type { User, CourseApplication, ApplicationStatus } from 'src/types/user';

import { useMemo, useEffect, useContext, useReducer, useCallback, createContext } from 'react';

import { applicationApi } from 'src/api';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';
import { paymentProofStorage } from 'src/utils/payment-proof-storage';
import { attachReviewer, mapApplicationDtoToUi, mapCreateApplicationInputToRequest, mapUpdateStatusToRequest } from 'src/api/mappers/application.mapper';

// ----------------------------------------------------------------------

export interface ApplicationMetadata {
  fullName?: string;
  email?: string;
  phone?: string;
  experience?: string;
  motivation?: string;
  courseName?: string;
  coursePrice?: number;
}

export interface Application extends CourseApplication {
  metadata?: ApplicationMetadata;
}

type ApplicationsAction =
  | { type: 'SET_APPLICATIONS'; payload: Application[] }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | { type: 'UPDATE_APPLICATION'; payload: Application }
  | { type: 'DELETE_APPLICATION'; payload: { id: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface ApplicationsState {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
}

export type CreateApplicationInput = {
  courseRoundId: number;
  answer1?: string | null;
  answer2?: string | null;
  answer3?: string | null;
  answer4?: string | null;
  answer5?: string | null;
  answer6?: string | null;
  answer7?: string | null;
  answer8?: string | null;
  answer9?: string | null;
  answer10?: string | null;
  studentId?: User['id'];
  courseId?: string; // For UI purposes
  metadata?: ApplicationMetadata;
};

// ----------------------------------------------------------------------

const ApplicationsContext = createContext<ApplicationsContextValue | undefined>(undefined);

function applicationsReducer(state: ApplicationsState, action: ApplicationsAction): ApplicationsState {
  switch (action.type) {
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload, isLoading: false, error: null };
    case 'ADD_APPLICATION':
      return { ...state, applications: [action.payload, ...state.applications], isLoading: false };
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map((a) => (a.id === action.payload.id ? action.payload : a)),
        isLoading: false,
      };
    case 'DELETE_APPLICATION':
      return {
        ...state,
        applications: state.applications.filter((a) => a.id !== action.payload.id),
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

// ----------------------------------------------------------------------

export type ApplicationsContextValue = ApplicationsState & {
  createApplication: (input: CreateApplicationInput) => Promise<Application>;
  updateApplicationStatus: (
    id: string,
    status: ApplicationStatus,
    reviewedBy: User['id'],
    notes?: string
  ) => Promise<Application | undefined>;
  updateApplicationMetadata: (
    id: string,
    metadata: Partial<ApplicationMetadata>
  ) => Promise<Application | undefined>;
  deleteApplication: (id: string) => Promise<void>;
  getApplicationsByStudent: (studentId: string) => Application[];
  getApplicationsByCourse: (courseId: string) => Application[];
};

export function useApplicationsContext(): ApplicationsContextValue {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplicationsContext must be used within an ApplicationsProvider');
  }
  return context;
}

// ----------------------------------------------------------------------

type ApplicationsProviderProps = {
  children: React.ReactNode;
};

export function ApplicationsProvider({ children }: ApplicationsProviderProps) {
  const { user, hasRole } = useAuth();
  const { courses } = useCoursesContext();
  const { rounds } = useCourseRoundsContext();
  const [state, dispatch] = useReducer(applicationsReducer, {
    applications: [],
    isLoading: false,
    error: null,
  });

  const loadApplications = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const accountId = !hasRole('admin') && user?.id ? Number(user.id) : undefined;

    applicationApi
      .getApplications(accountId)
      .then((items) =>
        items.map((item) => {
          const mapped = mapApplicationDtoToUi(item);

          const proof = paymentProofStorage.get(String(mapped.id));

          const round = rounds.find((r) => String(r.id) === String(item.courseRoundId));
          const derivedCourseId = round?.courseId;
          const derivedCourse = derivedCourseId ? courses.find((c) => c.id === derivedCourseId) : undefined;

          const nextCourseId = derivedCourseId ?? mapped.courseId;

          return {
            ...mapped,
            studentId: mapped.studentId || (accountId ? String(accountId) : ''),
            courseId: nextCourseId,
            status: proof && mapped.status !== 'rejected' ? 'payed' : mapped.status,
            paymentProofUrl: proof?.optimizedUrl,
            metadata: {
              ...(mapped.metadata ?? {}),
              courseName: derivedCourse?.name ?? mapped.metadata?.courseName,
              coursePrice: (round?.price ?? derivedCourse?.price ?? mapped.metadata?.coursePrice) as number | undefined,
            },
          };
        })
      )
      .then((apps) => dispatch({ type: 'SET_APPLICATIONS', payload: apps }))
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load applications';
        // Show user-friendly error message
        const friendlyMessage = errorMessage.includes('CORS') || errorMessage.includes('Network Error')
          ? 'Unable to connect to the server. Please ensure the backend server is running at https://localhost:7248'
          : errorMessage;
        dispatch({ type: 'SET_ERROR', payload: friendlyMessage });
        console.error('Failed to load applications:', error);
      });
  }, [courses, hasRole, rounds, user?.id]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const createApplication = useCallback(async (input: CreateApplicationInput): Promise<Application> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const request = mapCreateApplicationInputToRequest({
        courseRoundId: input.courseRoundId,
        answer1: input.answer1 ?? null,
        answer2: input.answer2 ?? null,
        answer3: input.answer3 ?? null,
        answer4: input.answer4 ?? null,
        answer5: input.answer5 ?? null,
        answer6: input.answer6 ?? null,
        answer7: input.answer7 ?? null,
        answer8: input.answer8 ?? null,
        answer9: input.answer9 ?? null,
        answer10: input.answer10 ?? null,
      });

      const accountId = input.studentId ? Number(input.studentId) : undefined;
      const created = await applicationApi.createApplication(request, accountId);

      // Auto-accept application
      let finalDto = created;
      try {
        const updated = await applicationApi.updateApplicationStatus(created.id, { statusId: 3 });
        if (updated) {
          finalDto = updated;
        } else {
          finalDto = { ...created, statusId: 3, status: 'Accepted' };
        }
      } catch (err) {
        console.error('Failed to auto-accept application:', err);
      }

      const mapped: Application = {
        ...mapApplicationDtoToUi(finalDto, input.courseId),
        studentId: input.studentId ?? '',
        courseId: input.courseId ?? '',
        courseRoundId: input.courseRoundId,
        metadata: {
          ...(input.metadata ?? {}),
        },
      };

      dispatch({ type: 'ADD_APPLICATION', payload: mapped });
      return mapped;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create application';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const updateApplicationStatus = useCallback(
    async (
      id: string,
      status: ApplicationStatus,
      reviewedBy: User['id'],
      notes?: string
    ): Promise<Application | undefined> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const request = mapUpdateStatusToRequest(status);
        const updated = await applicationApi.updateApplicationStatus(id, request);
        const next = updated ? mapApplicationDtoToUi(updated) : mapApplicationDtoToUi(await applicationApi.getApplicationById(id));

        const current = state.applications.find((a) => a.id === id);

        const merged: Application = attachReviewer(
          {
            ...(next as Application),
            courseId: current?.courseId ?? (next as Application).courseId,
            studentId: current?.studentId ?? (next as Application).studentId,
            metadata: {
              ...(next.metadata ?? {}),
              ...(current?.metadata ?? {}),
            },
          },
          { reviewedBy, notes }
        ) as Application;

        dispatch({ type: 'UPDATE_APPLICATION', payload: merged });
        return merged;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update application status';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },
    [state.applications]
  );

  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const exists = state.applications.some((a) => a.id === id);
    if (!exists) {
      dispatch({ type: 'SET_ERROR', payload: 'Application not found' });
      return;
    }
    dispatch({ type: 'DELETE_APPLICATION', payload: { id } });
  }, [state.applications]);

  const updateApplicationMetadata = useCallback(
    async (id: string, metadata: Partial<ApplicationMetadata>): Promise<Application | undefined> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      await new Promise((resolve) => setTimeout(resolve, 300));
      const current = state.applications.find((a) => a.id === id);
      if (!current) {
        dispatch({ type: 'SET_ERROR', payload: 'Application not found' });
        return undefined;
      }
      const updated: Application = {
        ...current,
        metadata: {
          ...(current.metadata || {}),
          ...metadata,
        },
      };
      dispatch({ type: 'UPDATE_APPLICATION', payload: updated });
      return updated;
    },
    [state.applications]
  );

  const getApplicationsByStudent = useCallback(
    (studentId: string) => state.applications.filter((a) => a.studentId === studentId),
    [state.applications]
  );

  const getApplicationsByCourse = useCallback(
    (courseId: string) => state.applications.filter((a) => a.courseId === courseId),
    [state.applications]
  );

  const value = useMemo(
    () => ({
      ...state,
      createApplication,
      updateApplicationStatus,
      updateApplicationMetadata,
      deleteApplication,
      getApplicationsByStudent,
      getApplicationsByCourse,
    }),
    [state, createApplication, updateApplicationStatus, updateApplicationMetadata, deleteApplication, getApplicationsByStudent, getApplicationsByCourse]
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}
