import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { PricingSettingsForm } from "@/components/admin/pricing-settings-form";
import { getPricingSettings } from "@/lib/settings/pricing-settings";
import { StorefrontSettingsForm } from "@/components/admin/storefront-settings-form";
import { getStorefrontSettings } from "@/lib/settings/storefront-settings";
import { ReviewRewardSettingsForm } from "@/components/admin/review-reward-settings-form";
import { getReviewRewardSettings } from "@/lib/settings/review-reward-settings";
import { CouponMinimumsForm } from "@/components/admin/coupon-minimums-form";
import { getCouponMinimums } from "@/lib/settings/coupon-settings";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  const [session, pricingSettings, storefrontSettings, reviewRewardSettings, couponMinimums] = await Promise.all([
    getAdminSession(),
    getPricingSettings(),
    getStorefrontSettings(),
    getReviewRewardSettings(),
    getCouponMinimums(),
  ]);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Settings
      </h1>
      <p className="mb-6 text-sm text-ink-400">
        Signed in as {session?.user?.email}
      </p>

      <div className="mb-8">
        <PricingSettingsForm settings={pricingSettings} />
      </div>

      <div className="mb-8">
        <StorefrontSettingsForm settings={storefrontSettings} />
      </div>

      <div className="mb-8">
        <ReviewRewardSettingsForm settings={reviewRewardSettings} />
      </div>

      <div className="mb-8">
        <CouponMinimumsForm minimums={couponMinimums} />
      </div>

      <div className="max-w-md">
        <h2 className="mb-3 font-display text-base font-semibold text-ink-600">
          Change password
        </h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
