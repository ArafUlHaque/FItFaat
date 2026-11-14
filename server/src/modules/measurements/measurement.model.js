import mongoose from "mongoose";

const measurementLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    waist: {
      type: Number,
      default: null,
    },
    chest: {
      type: Number,
      default: null,
    },
    hips: {
      type: Number,
      default: null,
    },
    bodyFat: {
      type: Number,
      default: null,
    },
    arms: {
      type: Number,
      default: null,
    },
    bmi: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        if (ret.date instanceof Date) {
          ret.date = ret.date.toISOString().split("T")[0];
        } else if (typeof ret.date === "string") {
          ret.date = ret.date.split("T")[0];
        }
        // Aliases matching measurements_goals_progress.html keys
        ret.weightKg = ret.weight;
        ret.waistCm = ret.waist;
        ret.chestCm = ret.chest;
        ret.hipsCm = ret.hips;
        return ret;
      },
    },
  },
);

measurementLogSchema.index({ userId: 1, date: 1 });

export const MeasurementLog = mongoose.model("MeasurementLog", measurementLogSchema);
export const Measurement = MeasurementLog;

