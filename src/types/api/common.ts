/** Structured error payload from .NET ExceptionHandlingMiddleware */
export interface ApiErrorPayload {
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

/** Generic API envelope returned by all backend endpoints */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  /** Flat message (legacy / success cases) */
  message?: string;
  /** Structured error (from ExceptionHandlingMiddleware) */
  error?: ApiErrorPayload;
  traceId?: string;
}

/** Envelope for operations that return no data (success only) */
export type ApiSuccess = { success: boolean; message?: string };
