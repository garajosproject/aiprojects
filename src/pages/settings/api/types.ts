export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type AuthType = 'API Key' | 'Bearer Token' | 'None'
export type ApiStatus = 'Active' | 'Inactive'
export type Role = 'Super Admin' | 'Doctor' | 'Coach'

export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description?: string
}

export interface IncomingApi {
  id: string
  name: string
  endpoint: string
  method: HttpMethod
  authType: AuthType
  status: ApiStatus
  apiKey: string
  schema: Record<string, SchemaField>
  createdAt: string
  lastUsed: string
  requestCount: number
}

export interface FieldMapping {
  id: string
  internalField: string
  externalField: string
  transform?: string
}

export interface ApiResponse {
  status: number
  body: string
  time: number
  success: boolean
}

export interface OutgoingApi {
  id: string
  name: string
  endpoint: string
  method: HttpMethod
  authType: AuthType
  status: ApiStatus
  headers: Record<string, string>
  fieldMappings: FieldMapping[]
  createdAt: string
  lastTested: string
  lastResponse?: ApiResponse
}

export interface ApiToken {
  id: string
  name: string
  token: string
  status: 'Active' | 'Revoked'
  role: Role
  createdAt: string
  lastUsed: string
  expiresAt?: string
  usageCount: number
}

export interface ApiLog {
  id: string
  apiId: string
  apiName: string
  endpoint: string
  method: HttpMethod
  status: 'Success' | 'Failed'
  statusCode: number
  responseTime: number
  timestamp: string
  error?: string
  requestBody?: string
}
