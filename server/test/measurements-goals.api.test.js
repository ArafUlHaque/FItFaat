import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { User } from "../src/modules/users/user.model.js";
import { MeasurementLog } from "../src/modules/measurements/measurement.model.js";
import { FitnessGoal } from "../src/modules/goals/goal.model.js";

let app;
const testUserId = new mongoose.Types.ObjectId().toString();
const otherUserId = new mongoose.Types.ObjectId().toString();

const validToken = jwt.sign({ sub: testUserId }, env.jwtSecret, { expiresIn: "1h" });

before(async () => {
  process.env.NODE_ENV = "test";
  ({ default: app } = await import("../src/app.js"));
});

// 1. Authentication Protection Tests
for (const [method, path] of [
  ["get", "/api/measurements"],
  ["post", "/api/measurements"],
  ["get", "/api/measurements/progress"],
  ["get", "/api/measurements/665f1c2b9a1e4b0012345678"],
  ["put", "/api/measurements/665f1c2b9a1e4b0012345678"],
  ["delete", "/api/measurements/665f1c2b9a1e4b0012345678"],
  ["get", "/api/goals"],
  ["post", "/api/goals"],
  // Also verify /api/v1 mounts
  ["get", "/api/v1/measurements"],
  ["post", "/api/v1/measurements"],
  ["get", "/api/v1/measurements/progress"],
  ["get", "/api/v1/goals"],
  ["post", "/api/v1/goals"],
]) {
  test(`${method.toUpperCase()} ${path} without token returns 401 Unauthorized`, async () => {
    const res = await request(app)[method](path);
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.error.message, /Sign in required/i);
  });
}

test("Feature 1 endpoint with forged token returns 401", async () => {
  const res = await request(app)
    .get("/api/measurements")
    .set("Authorization", "Bearer fake.invalid.token");
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

// 2. Schema and Model Verification
test("MeasurementLog model validates required weight and formats toJSON with aliases", () => {
  const log = new MeasurementLog({
    userId: new mongoose.Types.ObjectId(),
    date: new Date("2026-10-15"),
    weight: 78.5,
    waist: 83,
    chest: 99,
    hips: 101,
    notes: "Fasted morning check",
  });

  const json = log.toJSON();
  assert.equal(json.weight, 78.5);
  assert.equal(json.weightKg, 78.5);
  assert.equal(json.waist, 83);
  assert.equal(json.waistCm, 83);
  assert.equal(json.chest, 99);
  assert.equal(json.chestCm, 99);
  assert.equal(json.hips, 101);
  assert.equal(json.hipsCm, 101);
  assert.equal(json.date, "2026-10-15");
  assert.ok(json.id);
  assert.equal(json._id, undefined);
  assert.equal(json.__v, undefined);
});

test("MeasurementLog model validation fails when weight is missing", async () => {
  const log = new MeasurementLog({
    userId: new mongoose.Types.ObjectId(),
  });
  let err;
  try {
    await log.validate();
  } catch (e) {
    err = e;
  }
  assert.ok(err.errors.weight);
});

test("FitnessGoal model validates required fields and formats toJSON with aliases", () => {
  const goal = new FitnessGoal({
    userId: new mongoose.Types.ObjectId(),
    targetWeight: 74.0,
    startWeight: 82.5,
    startDate: new Date("2026-09-01"),
    targetDate: new Date("2026-12-31"),
  });

  const json = goal.toJSON();
  assert.equal(json.targetWeight, 74.0);
  assert.equal(json.targetWeightKg, 74.0);
  assert.equal(json.startWeight, 82.5);
  assert.equal(json.startWeightKg, 82.5);
  assert.equal(json.targetDate, "2026-12-31");
  assert.equal(json.deadlineDate, "2026-12-31");
  assert.equal(json.status, "active");
  assert.ok(json.id);
  assert.equal(json._id, undefined);
});

test("FitnessGoal model validation fails when targetWeight or startWeight is missing", async () => {
  const goal = new FitnessGoal({
    userId: new mongoose.Types.ObjectId(),
  });
  let err;
  try {
    await goal.validate();
  } catch (e) {
    err = e;
  }
  assert.ok(err.errors.targetWeight);
  assert.ok(err.errors.startWeight);
});

// 3. Controller & Route Logic Tests with Mocked DB
const originalUserFindById = User.findById;
const originalMeasurementCreate = MeasurementLog.create;
const originalMeasurementFind = MeasurementLog.find;
const originalMeasurementFindById = MeasurementLog.findById;
const originalMeasurementFindOne = MeasurementLog.findOne;
const originalMeasurementDeleteOne = MeasurementLog.deleteOne;

const originalGoalCreate = FitnessGoal.create;
const originalGoalFindOne = FitnessGoal.findOne;

beforeEach(() => {
  // Always mock User.findById to authenticate the valid test user
  User.findById = async (id) => {
    if (id === testUserId) {
      return { id: testUserId, _id: new mongoose.Types.ObjectId(testUserId), email: "test@fitfaat.local" };
    }
    return null;
  };
});

after(() => {
  User.findById = originalUserFindById;
  MeasurementLog.create = originalMeasurementCreate;
  MeasurementLog.find = originalMeasurementFind;
  MeasurementLog.findById = originalMeasurementFindById;
  MeasurementLog.findOne = originalMeasurementFindOne;
  MeasurementLog.deleteOne = originalMeasurementDeleteOne;
  FitnessGoal.create = originalGoalCreate;
  FitnessGoal.findOne = originalGoalFindOne;
});

test("POST /api/measurements creates an entry matching HTML form fields", async () => {
  let createdDoc = null;
  MeasurementLog.create = async (payload) => {
    createdDoc = payload;
    const doc = new MeasurementLog(payload);
    doc._id = new mongoose.Types.ObjectId();
    return doc;
  };

  const res = await request(app)
    .post("/api/measurements")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      date: "2026-10-30",
      weight: 78.4,
      waist: 83.0,
      chest: 99.5,
      hips: 101.0,
      notes: "Latest check-in",
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.measurement.weight, 78.4);
  assert.equal(res.body.data.measurement.weightKg, 78.4);
  assert.equal(res.body.data.measurement.waist, 83.0);
  assert.equal(res.body.data.measurement.notes, "Latest check-in");
  assert.equal(createdDoc.weight, 78.4);
  assert.equal(createdDoc.userId.toString(), testUserId);
});

test("POST /api/measurements accepts weightKg, waistCm, chestCm, hipsCm aliases", async () => {
  MeasurementLog.create = async (payload) => {
    const doc = new MeasurementLog(payload);
    doc._id = new mongoose.Types.ObjectId();
    return doc;
  };

  const res = await request(app)
    .post("/api/measurements")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      weightKg: 80.2,
      waistCm: 85.0,
      chestCm: 101.0,
      hipsCm: 102.5,
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.data.measurement.weight, 80.2);
  assert.equal(res.body.data.measurement.waist, 85.0);
});

test("POST /api/measurements rejects missing or invalid weight", async () => {
  const res = await request(app)
    .post("/api/measurements")
    .set("Authorization", `Bearer ${validToken}`)
    .send({ waist: 80 });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(res.body.error.details.weight);
});

test("GET /api/measurements returns user records sorted ascending by date", async () => {
  let capturedQuery;
  MeasurementLog.find = (query) => {
    capturedQuery = query;
    return {
      sort: () => [
        new MeasurementLog({
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(testUserId),
          date: new Date("2026-09-01"),
          weight: 82.5,
        }),
        new MeasurementLog({
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(testUserId),
          date: new Date("2026-10-30"),
          weight: 78.4,
        }),
      ],
    };
  };

  const res = await request(app)
    .get("/api/measurements?startDate=2026-09-01&endDate=2026-10-31")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.measurements.length, 2);
  assert.equal(capturedQuery.userId.toString(), testUserId);
  assert.ok(capturedQuery.date.$gte);
  assert.ok(capturedQuery.date.$lte);
});

test("PUT /api/measurements/:id updates existing record after verifying ownership", async () => {
  const docId = new mongoose.Types.ObjectId().toString();
  const mockDoc = new MeasurementLog({
    _id: new mongoose.Types.ObjectId(docId),
    userId: new mongoose.Types.ObjectId(testUserId),
    date: new Date("2026-10-01"),
    weight: 80.0,
    waist: 85.0,
  });

  mockDoc.save = async function () {
    return this;
  };

  MeasurementLog.findById = async (id) => (id === docId ? mockDoc : null);

  const res = await request(app)
    .put(`/api/measurements/${docId}`)
    .set("Authorization", `Bearer ${validToken}`)
    .send({ weight: 79.5, waist: 84.0, notes: "Adjusted check-in" });

  assert.equal(res.status, 200);
  assert.equal(res.body.data.measurement.weight, 79.5);
  assert.equal(res.body.data.measurement.waist, 84.0);
  assert.equal(res.body.data.measurement.notes, "Adjusted check-in");
});

test("PUT /api/measurements/:id rejects access if record belongs to another user", async () => {
  const docId = new mongoose.Types.ObjectId().toString();
  const mockDoc = new MeasurementLog({
    _id: new mongoose.Types.ObjectId(docId),
    userId: new mongoose.Types.ObjectId(otherUserId),
    weight: 80.0,
  });

  MeasurementLog.findById = async () => mockDoc;

  const res = await request(app)
    .put(`/api/measurements/${docId}`)
    .set("Authorization", `Bearer ${validToken}`)
    .send({ weight: 75.0 });

  assert.equal(res.status, 403);
});

test("DELETE /api/measurements/:id deletes record after verifying ownership", async () => {
  const docId = new mongoose.Types.ObjectId().toString();
  const mockDoc = new MeasurementLog({
    _id: new mongoose.Types.ObjectId(docId),
    userId: new mongoose.Types.ObjectId(testUserId),
    weight: 80.0,
  });

  let deletedId = null;
  MeasurementLog.findById = async (id) => (id === docId ? mockDoc : null);
  MeasurementLog.deleteOne = async (filter) => {
    deletedId = filter._id;
    return { deletedCount: 1 };
  };

  const res = await request(app)
    .delete(`/api/measurements/${docId}`)
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.deleted, true);
  assert.equal(deletedId, docId);
});

test("POST /api/goals automatically falls back to latest logged weight if startWeight omitted", async () => {
  MeasurementLog.findOne = () => ({
    sort: () => ({ weight: 81.3 }),
  });

  FitnessGoal.findOne = () => null;
  let createdGoal = null;
  FitnessGoal.create = async (payload) => {
    createdGoal = payload;
    const doc = new FitnessGoal(payload);
    doc._id = new mongoose.Types.ObjectId();
    return doc;
  };

  const res = await request(app)
    .post("/api/goals")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      targetWeight: 74.0,
      targetDate: "2026-12-31",
    });

  assert.equal(res.status, 201);
  assert.equal(createdGoal.startWeight, 81.3);
  assert.equal(createdGoal.targetWeight, 74.0);
  assert.equal(res.body.data.goal.startWeight, 81.3);
  assert.equal(res.body.data.goal.targetWeight, 74.0);
});

test("POST /api/goals updates active goal if already present", async () => {
  const existingGoal = new FitnessGoal({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(testUserId),
    targetWeight: 75.0,
    startWeight: 82.5,
    status: "active",
  });
  existingGoal.save = async function () {
    return this;
  };

  FitnessGoal.findOne = async () => existingGoal;

  const res = await request(app)
    .post("/api/goals")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      targetWeight: 73.5,
      startWeight: 82.0,
      targetDate: "2026-12-31",
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.data.goal.targetWeight, 73.5);
  assert.equal(res.body.data.goal.startWeight, 82.0);
});

test("GET /api/goals returns active goal for user", async () => {
  const existingGoal = new FitnessGoal({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(testUserId),
    targetWeight: 74.0,
    startWeight: 82.5,
    targetDate: new Date("2026-12-31"),
    status: "active",
  });

  FitnessGoal.findOne = () => ({
    sort: () => existingGoal,
  });

  const res = await request(app)
    .get("/api/goals")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.goal.targetWeight, 74.0);
  assert.equal(res.body.data.goal.deadlineDate, "2026-12-31");
});

test("GET /api/measurements/progress returns chart datasets and dynamic summary stats", async () => {
  const sampleRecords = [
    new MeasurementLog({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(testUserId),
      date: new Date("2026-09-01"),
      weight: 82.5,
      waist: 88.0,
      chest: 102.0,
      hips: 104.0,
    }),
    new MeasurementLog({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(testUserId),
      date: new Date("2026-09-15"),
      weight: 81.3,
      waist: 86.5,
      chest: 101.5,
      hips: 103.5,
    }),
    new MeasurementLog({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(testUserId),
      date: new Date("2026-10-30"),
      weight: 78.4,
      waist: 83.0,
      chest: 99.5,
      hips: 101.0,
    }),
  ];

  MeasurementLog.find = () => ({
    sort: () => sampleRecords,
  });

  const activeGoal = new FitnessGoal({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(testUserId),
    targetWeight: 74.0,
    startWeight: 82.5,
    targetDate: new Date("2026-12-31"),
    status: "active",
  });

  FitnessGoal.findOne = () => ({
    sort: () => activeGoal,
  });

  const res = await request(app)
    .get("/api/measurements/progress")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);

  const { labels, datasets, startWeight, currentWeight, totalChange, remainingToGoal, progressPercentage, summary } =
    res.body.data;

  // Check chart-ready time-series arrays
  assert.deepEqual(labels, ["2026-09-01", "2026-09-15", "2026-10-30"]);
  assert.deepEqual(datasets.weight, [82.5, 81.3, 78.4]);
  assert.deepEqual(datasets.waist, [88.0, 86.5, 83.0]);
  assert.deepEqual(datasets.chest, [102.0, 101.5, 99.5]);
  assert.deepEqual(datasets.hips, [104.0, 103.5, 101.0]);

  // Check dynamically calculated summary stats matching the HTML page logic
  assert.equal(startWeight, 82.5);
  assert.equal(currentWeight, 78.4);
  assert.equal(totalChange, -4.1);
  assert.equal(remainingToGoal, 4.4);
  assert.equal(progressPercentage, 48.2);

  // Summary object contains matching stats and highlight metrics
  assert.equal(summary.startWeight, 82.5);
  assert.equal(summary.currentWeight, 78.4);
  assert.equal(summary.totalChange, -4.1);
  assert.equal(summary.remainingToGoal, 4.4);
  assert.equal(summary.progressPercentage, 48.2);
  assert.equal(summary.waistDelta, -5.0);
  assert.equal(summary.chestDelta, -2.5);
  assert.ok(typeof summary.weeklyPace === "number");
});
