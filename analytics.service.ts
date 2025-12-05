import { db } from '../db';
import {
  dailyAnalytics,
  creatorMetrics,
  giftAnalytics,
  userEngagement,
  revenueBreakdown,
  retentionCohorts,
  revenueForecasts,
  users,
  videos,
  virtualGifts,
  type DailyAnalytics,
  type CreatorMetrics,
  type VirtualGift,
} from '../../shared/schema';
import { eq, gte, lte, desc, sql } from 'drizzle-orm';

export class AnalyticsService {
  async calculateDailyAnalytics(date: Date): Promise<void> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const totalUsers = await db.select().from(users);
      const activeUsers = await db
        .select()
        .from(userEngagement)
        .where(
          sql`${userEngagement.date} >= ${startOfDay} AND ${userEngagement.date} <= ${endOfDay}`
        );

      const totalGifts = await db
        .select()
        .from(virtualGifts)
        .where(
          sql`${virtualGifts.createdAt} >= ${startOfDay} AND ${virtualGifts.createdAt} <= ${endOfDay}`
        );

      const totalRevenue = totalGifts.reduce(
        (sum: number, gift: VirtualGift) => sum + gift.creditCost,
        0
      );

      const creatorEarnings = totalGifts.reduce(
        (sum: number, gift: VirtualGift) => sum + gift.creatorEarnings,
        0
      );
      const platformEarnings = totalRevenue - creatorEarnings;

      await db.insert(dailyAnalytics).values({
        date: new Date(date),
        totalUsers: totalUsers.length,
        activeUsers: activeUsers.length,
        newUsers: 0,
        totalGiftsSent: totalGifts.length,
        totalRevenue: totalRevenue.toString(),
        creatorEarnings: creatorEarnings.toString(),
        platformEarnings: platformEarnings.toString(),
        averageGiftValue: (totalRevenue / Math.max(totalGifts.length, 1)).toString(),
        engagementRate: ((activeUsers.length / Math.max(totalUsers.length, 1)) * 100).toString(),
      });

      console.log(`✅ Daily analytics calculated for ${date}`);
    } catch (error) {
      console.error('Error calculating daily analytics:', error);
    }
  }

  async calculateCreatorMetrics(creatorId: string, date: Date): Promise<void> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const creatorVideos = await db
        .select()
        .from(videos)
        .where(eq(videos.userId, creatorId));

      const totalViews = creatorVideos.reduce((sum: number, v) => sum + v.viewCount, 0);
      const totalLikes = creatorVideos.reduce((sum: number, v) => sum + v.likeCount, 0);
      const totalComments = creatorVideos.reduce((sum: number, v) => sum + v.commentCount, 0);

      const giftsReceived = await db
        .select()
        .from(virtualGifts)
        .where(eq(virtualGifts.receiverId, creatorId));

      const giftRevenue = giftsReceived.reduce(
        (sum: number, gift: VirtualGift) => sum + gift.creatorEarnings,
        0
      );

      await db.insert(creatorMetrics).values({
        creatorId,
        date: new Date(date),
        videoViews: totalViews,
        videoLikes: totalLikes,
        videoComments: totalComments,
        giftsReceived: giftsReceived.length,
        giftRevenue: giftRevenue.toString(),
        engagementRate: (
          ((totalLikes + totalComments) / Math.max(totalViews, 1)) *
          100
        ).toString(),
      });

      console.log(`✅ Creator metrics calculated for creator ${creatorId}`);
    } catch (error) {
      console.error('Error calculating creator metrics:', error);
    }
  }

  async forecastRevenue(days: number = 30): Promise<void> {
    try {
      const analytics = await db
        .select()
        .from(dailyAnalytics)
        .orderBy(desc(dailyAnalytics.date))
        .limit(30);

      if (analytics.length < 7) {
        console.log('Not enough data for forecasting');
        return;
      }

      const revenues = analytics
        .reverse()
        .map((a: typeof dailyAnalytics.$inferSelect) => Number(a.totalRevenue));

      const n = revenues.length;
      const x = Array.from({ length: n }, (_: unknown, i: number) => i);
      const y = revenues;

      const xMean = x.reduce((a: number, b: number) => a + b) / n;
      const yMean = y.reduce((a, b) => a + b) / n;

      const numerator = x.reduce(
        (sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean),
        0
      );
      const denominator = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);

      const slope = numerator / denominator;
      const intercept = yMean - slope * xMean;

      for (let i = 1; i <= days; i++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + i);

        const projectedRevenue = slope * (n + i) + intercept;
        const confidence = Math.max(0.5, 1 - i / days * 0.5);

        await db.insert(revenueForecasts).values({
          forecastDate,
          projectedRevenue: Math.max(0, projectedRevenue).toString(),
          confidence: (confidence * 100).toString(),
          method: 'linear_regression',
        });
      }

      console.log(`✅ Revenue forecast generated for ${days} days`);
    } catch (error) {
      console.error('Error forecasting revenue:', error);
    }
  }

  async getDashboardData(): Promise<any> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAnalytics = await db
        .select()
        .from(dailyAnalytics)
        .where(eq(dailyAnalytics.date, today));

      const last30Days = await db
        .select()
        .from(dailyAnalytics)
        .orderBy(desc(dailyAnalytics.date))
        .limit(30);

      const forecast = await db
        .select()
        .from(revenueForecasts)
        .orderBy(desc(revenueForecasts.forecastDate))
        .limit(30);

      return {
        today: todayAnalytics[0],
        last30Days,
        forecast,
        metrics: {
          totalRevenue: last30Days.reduce(
            (sum: number, a: typeof dailyAnalytics.$inferSelect) => sum + Number(a.totalRevenue),
            0
          ),
          avgDailyRevenue: last30Days.reduce(
            (sum: number, a: typeof dailyAnalytics.$inferSelect) => sum + Number(a.totalRevenue),
            0
          ) / Math.max(last30Days.length, 1),
          totalCreatorEarnings: last30Days.reduce(
            (sum: number, a: typeof dailyAnalytics.$inferSelect) => sum + Number(a.creatorEarnings),
            0
          ),
          avgEngagementRate:
            last30Days.reduce((sum: number, a: typeof dailyAnalytics.$inferSelect) => sum + Number(a.engagementRate), 0) /
            Math.max(last30Days.length, 1),
        },
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();
