import type { AxiosError } from 'axios';

export type ValidationErrors = Record<string, string[]>;

export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
};

export type ValidationProblemDetails = ProblemDetails & {
  errors?: ValidationErrors;
  traceId?: string;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, params?: { status?: number; data?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = params?.status;
    this.data = params?.data;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found', params?: { status?: number; data?: unknown }) {
    super(message, params);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  readonly errors: ValidationErrors;

  constructor(message = 'Validation error', params: { status?: number; data?: unknown; errors?: ValidationErrors }) {
    super(message, { status: params.status, data: params.data });
    this.name = 'ValidationError';
    this.errors = params.errors ?? {};
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractProblemMessage = (data: unknown): string | undefined => {
  if (typeof data === 'string') return data;
  if (!isRecord(data)) return undefined;
  const message = typeof data.message === 'string' ? data.message : undefined;
  const error = typeof data.error === 'string' ? data.error : undefined;
  const errorMessage = typeof data.errorMessage === 'string' ? data.errorMessage : undefined;
  const title = typeof data.title === 'string' ? data.title : undefined;
  const detail = typeof data.detail === 'string' ? data.detail : undefined;

  const errors = isRecord(data.errors) ? (data.errors as Record<string, unknown>) : undefined;
  if (errors) {
    const parts = Object.entries(errors)
      .slice(0, 3)
      .map(([k, v]) => {
        if (Array.isArray(v)) return `${k}: ${v.filter((x) => typeof x === 'string').join(', ')}`;
        if (typeof v === 'string') return `${k}: ${v}`;
        return undefined;
      })
      .filter((x): x is string => Boolean(x));
    if (parts.length) return parts.join(' | ');
  }

  if (message) return message;
  if (error) return error;
  if (errorMessage) return errorMessage;
  if (title && detail) return `${title}: ${detail}`;
  if (detail) return detail;
  if (title) return title;
  return undefined;
};

export const toApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError | undefined;
  const status = axiosError?.response?.status;
  const data = axiosError?.response?.data;
  const code = axiosError?.code;
  const message = axiosError?.message;

  // Handle network errors (CORS, connection refused, etc.)
  if (!status && (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || message?.includes('Network Error'))) {
    const isCorsError = message?.includes('CORS') || message?.includes('Access-Control-Allow-Origin');
    if (isCorsError) {
      return new ApiError(
        'Unable to connect to the server. This may be due to CORS configuration. Please ensure the backend server is running and configured to allow requests from this origin.',
        { status: 0, data }
      );
    }
    return new ApiError(
      'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.',
      { status: 0, data }
    );
  }

  if (status === 404) {
    return new NotFoundError('The requested resource was not found.', { status, data });
  }

  if (status === 400) {
    const maybe = data as unknown;
    if (isRecord(maybe) && isRecord(maybe.errors)) {
      return new ValidationError('Please check your input and try again.', {
        status,
        data,
        errors: maybe.errors as ValidationErrors,
      });
    }

    return new ValidationError('Invalid request. Please check your input and try again.', { status, data, errors: {} });
  }

  if (status === 401) {
    return new ApiError('Your session has expired. Please sign in again.', { status, data });
  }

  if (status === 403) {
    return new ApiError('You do not have permission to perform this action.', { status, data });
  }

  if (status === 429) {
    return new ApiError('Too many requests. Please wait a moment and try again.', { status, data });
  }

  if (status === 423) {
    return new ApiError('Your account is temporarily locked. Please try again later.', { status, data });
  }

  if (typeof status === 'number' && status >= 500) {
    return new ApiError('Server error. Please try again later. If the problem persists, contact support.', { status, data });
  }

  if (typeof status === 'number') {
    const problem = extractProblemMessage(data);
    const finalMessage =
      problem
        ? problem
        : `Request failed with status ${status}. Please try again.`;
    return new ApiError(finalMessage, { status, data });
  }

  if (error instanceof Error) {
    // Check for CORS or network errors in the message
    if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
      return new ApiError(
        'Unable to connect to the server. Please ensure the backend server is running and configured to allow requests from this origin.',
        { status: 0, data: error.message }
      );
    }
    if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
      return new ApiError(
        'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.',
        { status: 0, data: error.message }
      );
    }
    return new ApiError(error.message || 'An unexpected error occurred. Please try again.');
  }

  return new ApiError('An unexpected error occurred. Please try again.');
};
