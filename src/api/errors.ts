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
    const message = `Request failed with status ${status}`;
    return new ApiError(message, { status, data });
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Unexpected error');
};
