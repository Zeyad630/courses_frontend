import type { Course, CreateCourseInput, UpdateCourseInput } from 'src/types/course';

import { useMemo, useEffect, useContext, useReducer, useCallback, createContext } from 'react';

import { courseApi } from 'src/api';
import { mapCourseDtoToCourse, mapCreateCourseInputToRequest, mapUpdateCourseInputToRequest } from 'src/api/mappers/course.mapper';

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
    courses: [],
    isLoading: false,
    error: null,
  });

  const getCourses = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });

    courseApi
      .getAvailableCourses()
      .then((items) => items.map(mapCourseDtoToCourse))
      .then((courses) => dispatch({ type: 'SET_COURSES', payload: courses }))
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load courses';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      });
  }, []);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const getCourseById = useCallback(
    (id: string) => state.courses.find((course) => course.id === id),
    [state.courses]
  );

  const createCourse = useCallback(async (input: CreateCourseInput): Promise<Course> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const request = mapCreateCourseInputToRequest({
        name: input.name,
        description: input.description,
        level: input.level,
        duration: input.duration,
        price: input.price,
      });

      const created = await courseApi.createCourse(request);

      const mapped = mapCourseDtoToCourse({
        ...created,
        code: input.code,
        category: input.category,
        instructorId: input.instructorId,
      });

      dispatch({ type: 'ADD_COURSE', payload: mapped });
      return mapped;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const updateCourse = useCallback(async (input: UpdateCourseInput): Promise<Course> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const request = mapUpdateCourseInputToRequest({
        name: input.name,
        description: input.description,
        level: input.level,
        duration: input.duration,
        price: input.price,
      });

      const updated = await courseApi.updateCourse(input.id, request);
      const next = updated ? mapCourseDtoToCourse(updated) : mapCourseDtoToCourse(await courseApi.getCourseById(input.id));

      const merged: Course = {
        ...next,
        code: typeof input.code === 'string' ? input.code : next.code,
        category: typeof input.category === 'string' ? input.category : next.category,
        instructorId: typeof input.instructorId === 'string' ? input.instructorId : next.instructorId,
        image: typeof input.image === 'string' ? input.image : next.image,
        status: input.status ?? next.status,
      };

      dispatch({ type: 'UPDATE_COURSE', payload: merged });
      return merged;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.courses]);

  const deleteCourse = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await courseApi.deleteCourse(id);
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
