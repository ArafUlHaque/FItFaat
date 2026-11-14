import mongoose from "mongoose";

const fitnessGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    startWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    targetBodyFat: {
      type: Number,
      default: null,
    },
    goalType: {
      type: String,
      default: "weight_loss",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "achieved"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        if (ret.startDate instanceof Date) {
          ret.startDate = ret.startDate.toISOString().split("T")[0];
        } else if (typeof ret.startDate === "string") {
          ret.startDate = ret.startDate.split("T")[0];
        }
        if (ret.targetDate instanceof Date) {
          ret.targetDate = ret.targetDate.toISOString().split("T")[0];
          ret.deadlineDate = ret.targetDate;
        } else if (typeof ret.targetDate === "string") {
          ret.targetDate = ret.targetDate.split("T")[0];
          ret.deadlineDate = ret.targetDate;
        }
        // Aliases matching measurements_goals_progress.html keys
        ret.targetWeightKg = ret.targetWeight;
        ret.startWeightKg = ret.startWeight;
        return ret;
      },
    },
  },
);

fitnessGoalSchema.index({ userId: 1, status: 1 });

export const FitnessGoal = mongoose.model("FitnessGoal", fitnessGoalSchema);
export const Goal = FitnessGoal;

