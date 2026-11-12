import { prisma } from "@/lib/db/prisma";

export const DEFAULT_REVIEW_REWARD_PERCENTAGE = 10;
export const DEFAULT_FIRST_REVIEW_REWARD_PERCENTAGE = 20;
export const DEFAULT_REVIEW_REWARD_VALID_DAYS = 60;

export const REVIEW_REWARD_PERCENTAGE_KEY = "REVIEW_REWARD_PERCENTAGE";
export const FIRST_REVIEW_REWARD_PERCENTAGE_KEY = "FIRST_REVIEW_REWARD_PERCENTAGE";
export const REVIEW_REWARD_VALID_DAYS_KEY = "REVIEW_REWARD_VALID_DAYS";

/** Percent off the next order for an approved review. 0 turns that reward off. */
export interface ReviewRewardSettings {
  rewardPercentage: number;
  firstReviewRewardPercentage: number;
  rewardValidDays: number;
}

function parseNumber(value: string | undefined, fallback: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= max ? parsed : fallback;
}

export async function getReviewRewardSettings(): Promise<ReviewRewardSettings> {
  const rows = await prisma.appSetting.findMany({
    where: {
      key: { in: [REVIEW_REWARD_PERCENTAGE_KEY, FIRST_REVIEW_REWARD_PERCENTAGE_KEY, REVIEW_REWARD_VALID_DAYS_KEY] },
    },
  });
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  return {
    rewardPercentage: parseNumber(byKey.get(REVIEW_REWARD_PERCENTAGE_KEY), DEFAULT_REVIEW_REWARD_PERCENTAGE, 90),
    firstReviewRewardPercentage: parseNumber(
      byKey.get(FIRST_REVIEW_REWARD_PERCENTAGE_KEY),
      DEFAULT_FIRST_REVIEW_REWARD_PERCENTAGE,
      90
    ),
    rewardValidDays: parseNumber(byKey.get(REVIEW_REWARD_VALID_DAYS_KEY), DEFAULT_REVIEW_REWARD_VALID_DAYS, 365),
  };
}

export async function updateReviewRewardSettings(settings: ReviewRewardSettings) {
  const entries = [
    [REVIEW_REWARD_PERCENTAGE_KEY, settings.rewardPercentage],
    [FIRST_REVIEW_REWARD_PERCENTAGE_KEY, settings.firstReviewRewardPercentage],
    [REVIEW_REWARD_VALID_DAYS_KEY, settings.rewardValidDays],
  ] as const;

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );
}
