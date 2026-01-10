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

  if (status === 404) {
    return new NotFoundError('Not found', { status, data });
  }

  if (status === 400) {
    const maybe = data as unknown;
    if (isRecord(maybe) && isRecord(maybe.errors)) {
      return new ValidationError('Validation error', {
        status,
        data,
        errors: maybe.errors as ValidationErrors,
      });
    }

    return new ValidationError('Validation error', { status, data, errors: {} });
  }

  if (typeof status === 'number') {
    const problem = extractProblemMessage(data);
    const message =
      problem
        ? `Request failed with status ${status}: ${problem}`
        : isRecord(data)
          ? `Request failed with status ${status}: ${JSON.stringify(data)}`
          : `Request failed with status ${status}`;
    return new ApiError(message, { status, data });
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Unexpected error');
};
