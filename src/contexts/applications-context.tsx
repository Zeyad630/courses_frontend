import type { User, CourseApplication, ApplicationStatus } from 'src/types/user';

import { useMemo, useContext, useReducer, useCallback, createContext } from 'react';

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
  studentId: User['id'];
  courseId: string;
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
  const [state, dispatch] = useReducer(applicationsReducer, {
    applications: [],
    isLoading: false,
    error: null,
  });

  const createApplication = useCallback(async (input: CreateApplicationInput): Promise<Application> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newApp: Application = {
      id: `app_${Date.now()}`,
      studentId: input.studentId,
      courseId: input.courseId,
      status: 'pending',
      appliedAt: new Date(),
      notes: input.metadata?.motivation,
      metadata: input.metadata,
    };

    dispatch({ type: 'ADD_APPLICATION', payload: newApp });
    return newApp;
  }, []);

  const updateApplicationStatus = useCallback(
    async (
      id: string,
      status: ApplicationStatus,
      reviewedBy: User['id'],
      notes?: string
    ): Promise<Application | undefined> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      await new Promise((resolve) => setTimeout(resolve, 400));

      const current = state.applications.find((a) => a.id === id);
      if (!current) {
        dispatch({ type: 'SET_ERROR', payload: 'Application not found' });
        return undefined;
      }

      const updated: Application = {
        ...current,
        status,
        reviewedAt: new Date(),
        reviewedBy,
        notes: notes ?? current.notes,
      };

      dispatch({ type: 'UPDATE_APPLICATION', payload: updated });
      return updated;
    },
    [state.applications]
  );

  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
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
