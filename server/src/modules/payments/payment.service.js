import { Subscription } from "../subscriptions/subscription.model.js";

/**
 * Reusable helper to activate or extend a user's subscription.
 * When a user already has an active subscription, extend its endDate by packageDoc.durationDays;
 * otherwise create a new active Subscription starting now.
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {object} packageDoc - Package document containing _id and durationDays
 * @param {object} [transactionDoc] - Optional PaymentTransaction document
 * @returns {Promise<Subscription>}
 */
export async function activateUserSubscription(userId, packageDoc, transactionDoc) {
  const now = new Date();

  // Look for any active subscription for this user that has not expired yet
  const activeSub = await Subscription.findOne({
    userId,
    status: "active",
    endDate: { $gt: now },
  }).sort({ endDate: -1 });

  if (activeSub) {
    // Extend existing active subscription
    const currentEnd = new Date(activeSub.endDate);
    currentEnd.setDate(currentEnd.getDate() + packageDoc.durationDays);
    activeSub.endDate = currentEnd;
    activeSub.packageId = packageDoc._id;
    if (transactionDoc) {
      activeSub.transactionId = transactionDoc._id;
    }
    await activeSub.save();
    return activeSub;
  }

  // Mark any past active subscriptions with endDate <= now as expired
  await Subscription.updateMany(
    { userId, status: "active", endDate: { $lte: now } },
    { $set: { status: "expired" } },
  );

  // Create a new active subscription starting now
  const startDate = now;
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + packageDoc.durationDays);

  const newSub = await Subscription.create({
    userId,
    packageId: packageDoc._id,
    transactionId: transactionDoc ? transactionDoc._id : undefined,
    startDate,
    endDate,
    status: "active",
  });

  return newSub;
}
