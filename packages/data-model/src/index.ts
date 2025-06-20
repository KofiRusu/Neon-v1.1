// Export Prisma client
export { db } from './client'

// Re-export Prisma client for direct usage
export { PrismaClient } from '@prisma/client'

// Note: Prisma types will be available after running `prisma generate`
// These exports will work once the Prisma client is generated:
export type { User, Campaign, CampaignMetric, AIEventLog, UserRole, CampaignType, CampaignStatus, Prisma } from '@prisma/client' 