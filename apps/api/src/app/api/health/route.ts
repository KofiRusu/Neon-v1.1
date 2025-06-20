import { NextResponse } from 'next/server'
import { db } from '@neon/data-model'

export async function GET(): Promise<NextResponse> {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'healthy',
        api: 'healthy',
      },
      uptime: process.uptime(),
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unhealthy',
        api: 'healthy',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
    }

    return NextResponse.json(errorData, { status: 503 })
  }
} 