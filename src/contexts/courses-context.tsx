import type { Course, CreateCourseInput, UpdateCourseInput } from 'src/types/course';

import { useMemo, useCallback, createContext, useContext, useReducer } from 'react';

import { mockCourses } from 'src/_mock/courses';

// ----------------------------------------------------------------------

type CoursesAction =
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface CoursesState {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
}

type CoursesContextValue = CoursesState & {
  getCourses: () => void;
  getCourseById: (id: string) => Course | undefined;
  createCourse: (input: CreateCourseInput) => Promise<Course>;
  updateCourse: (input: UpdateCourseInput) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
};

// ----------------------------------------------------------------------

function coursesReducer(state: CoursesState, action: CoursesAction): CoursesState {
  switch (action.type) {
    case 'SET_COURSES':
      return {
        ...state,
        courses: action.payload,
        isLoading: false,
        error: null,
      };
    case 'ADD_COURSE':
      return {
        ...state,
        courses: [...state.courses, action.payload],
      };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter((c) => c.id !== action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

// ----------------------------------------------------------------------

const CoursesContext = createContext<CoursesContextValue | undefined>(undefined);

export function useCoursesContext(): CoursesContextValue {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCoursesContext must be used within a CoursesProvider');
  }
  return context;
}

// ----------------------------------------------------------------------

type CoursesProviderProps = {
  children: React.ReactNode;
};

export function CoursesProvider({ children }: CoursesProviderProps) {
  const [state, dispatch] = useReducer(coursesReducer, {
    courses: mockCourses,
    isLoading: false,
    error: null,
  });

  const getCourses = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Simulate API call
    setTimeout(() => {
      dispatch({ type: 'SET_COURSES', payload: mockCourses });
    }, 500);
  }, []);

  const getCourseById = useCallback(
    (id: string) => state.courses.find((course) => course.id === id),
    [state.courses]
  );

  const createCourse = useCallback(async (input: CreateCourseInput): Promise<Course> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newCourse: Course = {
        id: `course_${Date.now()}`,
        name: input.name,
        code: input.code,
        description: input.description,
        category: input.category,
        level: input.level,
        price: input.price,
        instructorId: input.instructorId,
        duration: input.duration,
        image: input.image,
        instructor: 'Instructor', // This will be fetched from instructorId in real app
        students: 0,
        rating: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_COURSE', payload: newCourse });
      return newCourse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const updateCourse = useCallback(async (input: UpdateCourseInput): Promise<Course> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const existingCourse = state.courses.find((c) => c.id === input.id);
      if (!existingCourse) {
        throw new Error('Course not found');
      }

      const updatedCourse: Course = {
        ...existingCourse,
        ...input,
        updatedAt: new Date(),
      };

      dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
      return updatedCourse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.courses]);

  const deleteCourse = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      dispatch({ type: 'DELETE_COURSE', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      getCourses,
      getCourseById,
      createCourse,
      updateCourse,
      deleteCourse,
    }),
    [state, getCourses, getCourseById, createCourse, updateCourse, deleteCourse]
  );

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
}
