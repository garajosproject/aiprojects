import { HttpMethod, ApiStatus } from './types'

export function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'fp_live_'
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'fpt_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function maskValue(val: string): string {
  if (val.length <= 8) return '****'
  return val.slice(0, 4) + '****' + val.slice(-4)
}

export function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getMethodColor(method: HttpMethod): string {
  const colors: Record<HttpMethod, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
    PATCH: 'bg-purple-100 text-purple-700',
  }
  return colors[method] || 'bg-gray-100 text-gray-700'
}

export function getStatusColor(status: ApiStatus | string): { bg: string; text: string } {
  if (status === 'Active') return { bg: '#D8F5CE', text: '#336B1F' }
  if (status === 'Inactive') return { bg: '#FFE5E5', text: '#812222' }
  if (status === 'Revoked') return { bg: '#FFE5E5', text: '#812222' }
  return { bg: '#F0F0F0', text: '#666666' }
}

export function getResponseTimeColor(ms: number): string {
  if (ms < 100) return 'text-green-600'
  if (ms < 500) return 'text-yellow-600'
  return 'text-red-600'
}

interface ApiSetup {
  name: string
  endpoint: string
  method: HttpMethod
  schema: Record<string, { type: string; required: boolean; description: string }>
  description: string
}

export function generateApiSetup(purpose: string): ApiSetup {
  const lower = purpose.toLowerCase()

  if (lower.includes('patient')) {
    return {
      name: 'Patient Data API',
      endpoint: '/api/v1/patients',
      method: 'GET',
      schema: {
        patientId: { type: 'string', required: true, description: 'Unique patient identifier' },
        firstName: { type: 'string', required: true, description: 'Patient first name' },
        lastName: { type: 'string', required: true, description: 'Patient last name' },
        dateOfBirth: { type: 'string', required: true, description: 'Date of birth (YYYY-MM-DD)' },
        diagnosis: { type: 'string', required: false, description: 'Primary diagnosis code' },
      },
      description: 'Retrieves patient demographic and health data',
    }
  }

  if (lower.includes('auth') || lower.includes('login')) {
    return {
      name: 'Authentication API',
      endpoint: '/api/v1/auth/login',
      method: 'POST',
      schema: {
        email: { type: 'string', required: true, description: 'User email address' },
        password: { type: 'string', required: true, description: 'User password' },
        mfaCode: { type: 'string', required: false, description: 'MFA verification code' },
      },
      description: 'Authenticates users and returns JWT tokens',
    }
  }

  if (lower.includes('payment') || lower.includes('billing')) {
    return {
      name: 'Payment Processing API',
      endpoint: '/api/v1/billing/payment',
      method: 'POST',
      schema: {
        amount: { type: 'number', required: true, description: 'Payment amount in cents' },
        currency: { type: 'string', required: true, description: 'ISO currency code (e.g. USD)' },
        patientId: { type: 'string', required: true, description: 'Patient identifier' },
        paymentMethod: { type: 'string', required: true, description: 'Payment method token' },
      },
      description: 'Processes patient billing and insurance payments',
    }
  }

  if (lower.includes('appointment') || lower.includes('schedule')) {
    return {
      name: 'Appointment Scheduling API',
      endpoint: '/api/v1/appointments',
      method: 'POST',
      schema: {
        patientId: { type: 'string', required: true, description: 'Patient identifier' },
        doctorId: { type: 'string', required: true, description: 'Doctor identifier' },
        scheduledAt: { type: 'string', required: true, description: 'Appointment datetime (ISO 8601)' },
        duration: { type: 'number', required: false, description: 'Duration in minutes' },
        notes: { type: 'string', required: false, description: 'Appointment notes' },
      },
      description: 'Creates and manages patient appointment bookings',
    }
  }

  if (lower.includes('report') || lower.includes('analytics')) {
    return {
      name: 'Health Reports API',
      endpoint: '/api/v1/reports',
      method: 'GET',
      schema: {
        reportType: { type: 'string', required: true, description: 'Type of report to generate' },
        startDate: { type: 'string', required: true, description: 'Report start date' },
        endDate: { type: 'string', required: true, description: 'Report end date' },
        patientId: { type: 'string', required: false, description: 'Filter by patient ID' },
      },
      description: 'Generates health analytics and clinical reports',
    }
  }

  return {
    name: 'Generic Resource API',
    endpoint: '/api/v1/resources',
    method: 'GET',
    schema: {
      id: { type: 'string', required: true, description: 'Resource identifier' },
      name: { type: 'string', required: true, description: 'Resource name' },
      data: { type: 'object', required: false, description: 'Resource payload data' },
      createdAt: { type: 'string', required: false, description: 'Creation timestamp' },
    },
    description: 'General purpose CRUD API for resource management',
  }
}
