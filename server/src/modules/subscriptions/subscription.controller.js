import { Subscription } from "./subscription.model.js";

// GET /api/v1/subscriptions/me or /api/subscriptions/me
export async function getMySubscription(req, res) {
  const now = new Date();

  // Automatically mark expired subscriptions as 'expired' if endDate < now
  await Subscription.updateMany(
    {
      userId: req.user._id,
      status: "active",
      endDate: { $lt: now },
    },
    { $set: { status: "expired" } },
  );

  // Retrieve current active subscription
  const activeSub = await Subscription.findOne({
    userId: req.user._id,
    status: "active",
    endDate: { $gte: now },
  })
    .sort({ endDate: -1 })
    .populate("packageId", "name code price currency durationDays features");

  if (!activeSub) {
    return res.json({
      success: true,
      data: {
        isPremium: false,
        subscription: null,
        package: null,
        startDate: null,
        endDate: null,
        daysRemaining: 0,
      },
    });
  }

  // Calculate days remaining
  const diffMs = activeSub.endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  res.json({
    success: true,
    data: {
      isPremium: true,
      subscription: activeSub,
      package: activeSub.packageId,
      startDate: activeSub.startDate,
      endDate: activeSub.endDate,
      daysRemaining,
    },
  });
}
