import { z } from 'zod'
import { NextRequest } from 'next/server'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      throw new AppError(`Validation failed: ${errors}`, 400)
    }
    throw new AppError('Invalid request body', 400)
  }
}

export function handleError(error: unknown): { error: string; status: number } {
  if (error instanceof AppError) {
    return { error: error.message, status: error.statusCode }
  }
  
  if (error instanceof z.ZodError) {
    const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    return { error: `Validation failed: ${errors}`, status: 400 }
  }
  
  console.error('Unexpected error:', error)
  return { 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error instanceof Error ? error.message : 'Unknown error',
    status: 500 
  }
} 