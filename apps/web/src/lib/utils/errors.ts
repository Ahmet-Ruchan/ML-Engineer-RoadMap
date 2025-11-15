export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function handleApiError(error: unknown) {
  if (isAppError(error)) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    }
  }
  
  console.error('Unexpected error:', error)
  
  return {
    success: false,
    error: 'Internal server error',
    status: 500,
  }
}

