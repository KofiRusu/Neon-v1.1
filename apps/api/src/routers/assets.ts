import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../server/trpc';

// Input validation schemas
const AssetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'TEXT', 'DOCUMENT', 'TEMPLATE', 'DESIGN', 'ANIMATION', 'DATASET']),
  category: z.string().optional(),
  description: z.string().optional(),
  content: z.record(z.any()),
  fileUrl: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).default([]),
  parentId: z.string().optional(),
  size: z.number().min(0).optional(),
  dimensions: z.record(z.any()).optional(),
  duration: z.number().min(0).optional(),
});

const AssetUpdateSchema = AssetSchema.partial().extend({
  id: z.string(),
});

const AssetApprovalSchema = z.object({
  assetId: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES']),
  comment: z.string().optional(),
});

const AssetQuerySchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'TEXT', 'DOCUMENT', 'TEMPLATE', 'DESIGN', 'ANIMATION', 'DATASET']).optional(),
  category: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED', 'DRAFT']).optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'usage', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const assetsRouter = createTRPCRouter({
  // Create a new asset
  createAsset: protectedProcedure
    .input(AssetSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const asset = await ctx.db.asset.create({
          data: {
            ...input,
            createdBy: ctx.session?.user?.id || 'system',
            status: 'DRAFT',
          },
        });

        // Log the event
        await ctx.db.aIEventLog.create({
          data: {
            agent: 'AssetManager',
            action: 'asset_created',
            metadata: {
              assetId: asset.id,
              assetType: asset.type,
              assetName: asset.name,
              createdBy: asset.createdBy,
            },
          },
        });

        return {
          success: true,
          asset,
        };
      } catch (error) {
        throw new Error(`Failed to create asset: ${error}`);
      }
    }),

  // Get assets with filtering and pagination
  getAssets: publicProcedure
    .input(AssetQuerySchema)
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.type) where.type = input.type;
      if (input.category) where.category = input.category;
      if (input.status) where.status = input.status;
      if (input.createdBy) where.createdBy = input.createdBy;
      if (input.tags && input.tags.length > 0) {
        where.tags = { hasSome: input.tags };
      }
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { tags: { hasSome: [input.search] } },
        ];
      }

      const [assets, totalCount] = await Promise.all([
        ctx.db.asset.findMany({
          where,
          orderBy: { [input.sortBy]: input.sortOrder },
          skip: input.offset,
          take: input.limit,
          include: {
            parent: {
              select: { id: true, name: true, type: true },
            },
            versions: {
              select: { id: true, name: true, version: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
            approvals: {
              select: { 
                id: true, 
                status: true, 
                comment: true, 
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
            _count: {
              select: { 
                versions: true,
                approvals: true,
              },
            },
          },
        }),
        ctx.db.asset.count({ where }),
      ]);

      return {
        assets,
        totalCount,
        hasMore: input.offset + input.limit < totalCount,
      };
    }),

  // Get single asset with full details
  getAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUnique({
        where: { id: input.id },
        include: {
          parent: {
            select: { id: true, name: true, type: true, version: true },
          },
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              name: true,
              version: true,
              thumbnail: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          approvals: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      return asset;
    }),

  // Update asset
  updateAsset: protectedProcedure
    .input(AssetUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        
        const asset = await ctx.db.asset.update({
          where: { id },
          data: updateData,
        });

        // Log the event
        await ctx.db.aIEventLog.create({
          data: {
            agent: 'AssetManager',
            action: 'asset_updated',
            metadata: {
              assetId: asset.id,
              assetName: asset.name,
              updatedFields: Object.keys(updateData),
            },
          },
        });

        return {
          success: true,
          asset,
        };
      } catch (error) {
        throw new Error(`Failed to update asset: ${error}`);
      }
    }),

  // Delete asset
  deleteAsset: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if asset exists and get its info
        const asset = await ctx.db.asset.findUnique({
          where: { id: input.id },
          select: { id: true, name: true, type: true },
        });

        if (!asset) {
          throw new Error('Asset not found');
        }

        // Delete the asset (cascade will handle approvals)
        await ctx.db.asset.delete({
          where: { id: input.id },
        });

        // Log the event
        await ctx.db.aIEventLog.create({
          data: {
            agent: 'AssetManager',
            action: 'asset_deleted',
            metadata: {
              assetId: asset.id,
              assetName: asset.name,
              assetType: asset.type,
            },
          },
        });

        return {
          success: true,
          message: 'Asset deleted successfully',
        };
      } catch (error) {
        throw new Error(`Failed to delete asset: ${error}`);
      }
    }),

  // Submit asset for approval
  submitForApproval: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const asset = await ctx.db.asset.update({
          where: { id: input.assetId },
          data: { status: 'PENDING' },
        });

        // Log the event
        await ctx.db.aIEventLog.create({
          data: {
            agent: 'AssetManager',
            action: 'asset_submitted_for_approval',
            metadata: {
              assetId: asset.id,
              assetName: asset.name,
            },
          },
        });

        return {
          success: true,
          asset,
        };
      } catch (error) {
        throw new Error(`Failed to submit asset for approval: ${error}`);
      }
    }),

  // Approve or reject asset
  reviewAsset: protectedProcedure
    .input(AssetApprovalSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Create approval record
        const approval = await ctx.db.assetApproval.create({
          data: {
            ...input,
            userId: ctx.session?.user?.id || 'system',
          },
        });

        // Update asset status if approved or rejected
        let assetStatus = input.status;
        if (input.status === 'APPROVED') {
          assetStatus = 'APPROVED';
        } else if (input.status === 'REJECTED') {
          assetStatus = 'REJECTED';
        }

        const asset = await ctx.db.asset.update({
          where: { id: input.assetId },
          data: { 
            status: assetStatus,
            approvedBy: input.status === 'APPROVED' ? ctx.session?.user?.id : undefined,
          },
        });

        // Log the event
        await ctx.db.aIEventLog.create({
          data: {
            agent: 'AssetManager',
            action: 'asset_reviewed',
            metadata: {
              assetId: asset.id,
              assetName: asset.name,
              reviewStatus: input.status,
              reviewComment: input.comment,
              reviewedBy: ctx.session?.user?.id,
            },
          },
        });

        return {
          success: true,
          approval,
          asset,
        };
      } catch (error) {
        throw new Error(`Failed to review asset: ${error}`);
      }
    }),

  // Create asset remix/version
  createRemix: protectedProcedure
    .input(AssetSchema.extend({
      parentId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First verify parent exists
        const parent = await ctx.db.asset.findUnique({
          where: { id: input.parentId },
          select: { id: true, name: true, remixCount: true, version: true },
        });

        if (!parent) {
          throw new Error('Parent asset not found');
        }

        // Create new version
        const newVersionNumber = parseFloat(parent.version) + 0.1;
        
        const remix = await ctx.db.asset.create({
          data: {
            ...input,
            version: newVersionNumber.toFixed(1),
            createdBy: ctx.session?.user?.id || 'system',
            status: 'DRAFT',
          },
        });

        // Update parent remix count
        await ctx.db.asset.update({
          where: { id: input.parentId },
          data: { remixCount: { increment: 1 } },
        });

        // Log the event
        await ctx.db.aIEventLog.create({
          data: {
            agent: 'AssetManager',
            action: 'asset_remixed',
            metadata: {
              originalAssetId: parent.id,
              originalAssetName: parent.name,
              remixAssetId: remix.id,
              remixAssetName: remix.name,
              createdBy: remix.createdBy,
            },
          },
        });

        return {
          success: true,
          remix,
        };
      } catch (error) {
        throw new Error(`Failed to create remix: ${error}`);
      }
    }),

  // Get asset statistics
  getAssetStats: publicProcedure
    .input(
      z.object({
        timeRange: z.enum(['24h', '7d', '30d', '90d']).default('30d'),
        type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'TEXT', 'DOCUMENT', 'TEMPLATE', 'DESIGN', 'ANIMATION', 'DATASET']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.type) where.type = input.type;

      // Time filter
      const now = new Date();
      const timeRanges = {
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      };

      where.createdAt = {
        gte: timeRanges[input.timeRange],
      };

      const [assets, totalAssets, approvals] = await Promise.all([
        ctx.db.asset.findMany({
          where,
          select: {
            type: true,
            status: true,
            usage: true,
            rating: true,
            remixCount: true,
            createdAt: true,
          },
        }),
        ctx.db.asset.count(),
        ctx.db.assetApproval.findMany({
          where: {
            createdAt: where.createdAt,
          },
          select: {
            status: true,
            createdAt: true,
          },
        }),
      ]);

      // Calculate statistics
      const stats = {
        totalAssets,
        newAssets: assets.length,
        
        statusDistribution: assets.reduce((acc, asset) => {
          acc[asset.status] = (acc[asset.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        
        typeDistribution: assets.reduce((acc, asset) => {
          acc[asset.type] = (acc[asset.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        
        totalUsage: assets.reduce((sum, asset) => sum + asset.usage, 0),
        totalRemixes: assets.reduce((sum, asset) => sum + asset.remixCount, 0),
        
        avgRating: assets.filter(a => a.rating).reduce((sum, asset) => sum + (asset.rating || 0), 0) / 
                   assets.filter(a => a.rating).length || 0,
        
        approvalStats: {
          pending: approvals.filter(a => a.status === 'PENDING').length,
          approved: approvals.filter(a => a.status === 'APPROVED').length,
          rejected: approvals.filter(a => a.status === 'REJECTED').length,
          requiresChanges: approvals.filter(a => a.status === 'REQUIRES_CHANGES').length,
        },
        
        dailyCreations: assets.reduce((acc, asset) => {
          const date = asset.createdAt.toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        
        topRatedAssets: assets
          .filter(a => a.rating && a.rating > 0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 10),
        
        mostUsedAssets: assets
          .filter(a => a.usage > 0)
          .sort((a, b) => b.usage - a.usage)
          .slice(0, 10),
      };

      return stats;
    }),

  // Search assets
  searchAssets: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'TEXT', 'DOCUMENT', 'TEMPLATE', 'DESIGN', 'ANIMATION', 'DATASET']).optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        AND: [
          {
            OR: [
              { name: { contains: input.query, mode: 'insensitive' } },
              { description: { contains: input.query, mode: 'insensitive' } },
              { tags: { hasSome: [input.query] } },
            ],
          },
        ],
      };

      if (input.type) {
        where.AND.push({ type: input.type });
      }

      const assets = await ctx.db.asset.findMany({
        where,
        take: input.limit,
        orderBy: [
          { usage: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
          description: true,
          thumbnail: true,
          tags: true,
          status: true,
          usage: true,
          rating: true,
          createdAt: true,
        },
      });

      return {
        assets,
        count: assets.length,
      };
    }),
});