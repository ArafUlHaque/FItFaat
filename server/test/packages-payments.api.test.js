import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { User } from "../src/modules/users/user.model.js";
import { Package } from "../src/modules/packages/package.model.js";
import { PaymentTransaction } from "../src/modules/payments/paymentTransaction.model.js";
import { Subscription } from "../src/modules/subscriptions/subscription.model.js";
import { activateUserSubscription } from "../src/modules/payments/payment.service.js";

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
  ["get", "/api/packages"],
  ["post", "/api/payments/initiate"],
  ["post", "/api/payments/verify"],
  ["get", "/api/payments/history"],
  ["get", "/api/subscriptions/me"],
  // Also verify /api/v1 mounts
  ["get", "/api/v1/packages"],
  ["post", "/api/v1/payments/initiate"],
  ["post", "/api/v1/payments/verify"],
  ["get", "/api/v1/payments/history"],
  ["get", "/api/v1/subscriptions/me"],
]) {
  test(`${method.toUpperCase()} ${path} without token returns 401 Unauthorized`, async () => {
    const res = await request(app)[method](path);
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.error.message, /Sign in required/i);
  });
}

test("Feature 2 endpoint with forged token returns 401", async () => {
  const res = await request(app)
    .get("/api/packages")
    .set("Authorization", "Bearer fake.invalid.token");
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

// 2. Schema and Model Verification
test("Package model validates required fields and toJSON output", async () => {
  const pkg = new Package({
    name: "Monthly Premium",
    code: "monthly",
    price: 499,
    durationDays: 30,
    features: ["50 AI Meal Photo Estimates / day"],
  });

  await pkg.validate();
  const json = pkg.toJSON();
  assert.equal(json.name, "Monthly Premium");
  assert.equal(json.code, "monthly");
  assert.equal(json.price, 499);
  assert.equal(json.currency, "BDT");
  assert.equal(json.durationDays, 30);
  assert.equal(json.isActive, true);
  assert.ok(json.id);
  assert.equal(json._id, undefined);
});

test("Package model validation fails when price or code is missing", async () => {
  const pkg = new Package({ name: "Incomplete" });
  let err;
  try {
    await pkg.validate();
  } catch (e) {
    err = e;
  }
  assert.ok(err.errors.code);
  assert.ok(err.errors.price);
  assert.ok(err.errors.durationDays);
});

test("PaymentTransaction model validates required fields and status enum", async () => {
  const tx = new PaymentTransaction({
    userId: new mongoose.Types.ObjectId(),
    packageId: new mongoose.Types.ObjectId(),
    tranId: "SSLCZ_TEST_12345",
    amount: 3999,
    currency: "BDT",
    status: "pending",
  });

  await tx.validate();
  const json = tx.toJSON();
  assert.equal(json.tranId, "SSLCZ_TEST_12345");
  assert.equal(json.amount, 3999);
  assert.equal(json.gateway, "SSLCOMMERZ_SANDBOX");
  assert.equal(json.status, "pending");
  assert.ok(json.id);
  assert.equal(json._id, undefined);

  // Invalid status
  tx.status = "unknown_status";
  let err;
  try {
    await tx.validate();
  } catch (e) {
    err = e;
  }
  assert.ok(err.errors.status);
});

test("Subscription model validates required dates and status enum", async () => {
  const now = new Date();
  const later = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const sub = new Subscription({
    userId: new mongoose.Types.ObjectId(),
    packageId: new mongoose.Types.ObjectId(),
    startDate: now,
    endDate: later,
    status: "active",
  });

  await sub.validate();
  const json = sub.toJSON();
  assert.equal(json.status, "active");
  assert.ok(json.id);
  assert.equal(json._id, undefined);

  sub.status = "invalid_enum";
  let err;
  try {
    await sub.validate();
  } catch (e) {
    err = e;
  }
  assert.ok(err.errors.status);
});

// 3. Controller & Route Logic Tests with Mocked DB
const originalUserFindById = User.findById;
const originalPackageFind = Package.find;
const originalPackageFindById = Package.findById;
const originalPackageFindOne = Package.findOne;
const originalPackageInsertMany = Package.insertMany;

const originalTxCreate = PaymentTransaction.create;
const originalTxFind = PaymentTransaction.find;
const originalTxFindOne = PaymentTransaction.findOne;

const originalSubCreate = Subscription.create;
const originalSubFindOne = Subscription.findOne;
const originalSubUpdateMany = Subscription.updateMany;

beforeEach(() => {
  User.findById = async (id) => {
    if (id === testUserId) {
      return { id: testUserId, _id: new mongoose.Types.ObjectId(testUserId), email: "test@fitfaat.local" };
    }
    return null;
  };
});

after(() => {
  User.findById = originalUserFindById;
  Package.find = originalPackageFind;
  Package.findById = originalPackageFindById;
  Package.findOne = originalPackageFindOne;
  Package.insertMany = originalPackageInsertMany;
  PaymentTransaction.create = originalTxCreate;
  PaymentTransaction.find = originalTxFind;
  PaymentTransaction.findOne = originalTxFindOne;
  Subscription.create = originalSubCreate;
  Subscription.findOne = originalSubFindOne;
  Subscription.updateMany = originalSubUpdateMany;
});

test("GET /api/packages seeds packages if collection is empty", async () => {
  let callCount = 0;
  let inserted = null;

  Package.find = () => ({
    sort: () => {
      callCount++;
      if (callCount === 1) return []; // First call: empty
      return [
        new Package({ _id: new mongoose.Types.ObjectId(), name: "Monthly Premium", code: "monthly", price: 499, durationDays: 30 }),
        new Package({ _id: new mongoose.Types.ObjectId(), name: "Yearly Premium", code: "yearly", price: 3999, durationDays: 365 }),
      ];
    },
  });

  Package.insertMany = async (docs) => {
    inserted = docs;
    return docs;
  };

  const res = await request(app)
    .get("/api/packages")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.packages.length, 2);
  assert.ok(inserted);
  assert.equal(inserted.length, 2);
  assert.equal(inserted[0].name, "Monthly Premium");
  assert.equal(inserted[1].name, "Yearly Premium");
});

test("POST /api/payments/initiate generates tranId and pending transaction", async () => {
  const pkgId = new mongoose.Types.ObjectId();
  const mockPkg = new Package({
    _id: pkgId,
    name: "Yearly Premium",
    code: "yearly",
    price: 3999,
    durationDays: 365,
    currency: "BDT",
    isActive: true,
  });

  Package.findOne = async () => mockPkg;
  let createdTx = null;

  PaymentTransaction.create = async (payload) => {
    createdTx = payload;
    const doc = new PaymentTransaction(payload);
    doc._id = new mongoose.Types.ObjectId();
    return doc;
  };

  const res = await request(app)
    .post("/api/payments/initiate")
    .set("Authorization", `Bearer ${validToken}`)
    .send({ code: "yearly" });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.transaction.status, "pending");
  assert.equal(res.body.data.transaction.amount, 3999);
  assert.match(res.body.data.transaction.tranId, /^SSLCZ_TEST_/);
  assert.equal(createdTx.userId.toString(), testUserId);
});

test("POST /api/payments/initiate rejects invalid package", async () => {
  Package.findById = async () => null;
  Package.findOne = async () => null;

  const res = await request(app)
    .post("/api/payments/initiate")
    .set("Authorization", `Bearer ${validToken}`)
    .send({ code: "nonexistent" });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(res.body.error.details.package);
});

test("POST /api/payments/verify simulates successful SSLCOMMERZ callback and activates subscription", async () => {
  const pkgId = new mongoose.Types.ObjectId();
  const mockPkg = new Package({
    _id: pkgId,
    name: "Yearly Premium",
    code: "yearly",
    price: 3999,
    durationDays: 365,
  });

  const txId = new mongoose.Types.ObjectId();
  const mockTx = new PaymentTransaction({
    _id: txId,
    userId: new mongoose.Types.ObjectId(testUserId),
    packageId: pkgId,
    tranId: "SSLCZ_TEST_1001",
    amount: 3999,
    status: "pending",
  });
  mockTx.save = async function () {
    return this;
  };

  PaymentTransaction.findOne = async (filter) => {
    if (filter.tranId === "SSLCZ_TEST_1001") return mockTx;
    return null;
  };

  Package.findById = async (id) => (id.toString() === pkgId.toString() ? mockPkg : null);

  // Mock Subscription methods for activateUserSubscription
  Subscription.findOne = () => ({
    sort: () => null, // No existing active subscription
  });
  Subscription.updateMany = async () => ({ modifiedCount: 0 });
  Subscription.create = async (payload) => {
    const doc = new Subscription(payload);
    doc._id = new mongoose.Types.ObjectId();
    return doc;
  };

  const res = await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      tranId: "SSLCZ_TEST_1001",
      status: "success",
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.transaction.status, "success");
  assert.match(res.body.data.transaction.valId, /^SSLCZ_VAL_/);
  assert.ok(res.body.data.subscription);
  assert.equal(res.body.data.subscription.status, "active");
});

test("POST /api/payments/verify handles failed or cancelled payment without activating subscription", async () => {
  const pkgId = new mongoose.Types.ObjectId();
  const mockPkg = new Package({
    _id: pkgId,
    name: "Monthly Premium",
    code: "monthly",
    price: 499,
    durationDays: 30,
  });

  const mockTx = new PaymentTransaction({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(testUserId),
    packageId: pkgId,
    tranId: "SSLCZ_TEST_CANCELLED",
    amount: 499,
    status: "pending",
  });
  mockTx.save = async function () {
    return this;
  };

  PaymentTransaction.findOne = async () => mockTx;
  Package.findById = async () => mockPkg;

  const res = await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      tranId: "SSLCZ_TEST_CANCELLED",
      status: "cancelled",
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.data.transaction.status, "cancelled");
  assert.equal(res.body.data.subscription, null);
});

test("POST /api/payments/verify rejects already-processed transactions", async () => {
  const mockTx = new PaymentTransaction({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(testUserId),
    packageId: new mongoose.Types.ObjectId(),
    tranId: "SSLCZ_TEST_ALREADY_SUCCESS",
    amount: 499,
    status: "success",
  });

  PaymentTransaction.findOne = async () => mockTx;

  const res = await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      tranId: "SSLCZ_TEST_ALREADY_SUCCESS",
      status: "success",
    });

  assert.equal(res.status, 400);
  assert.match(res.body.error.message, /already been processed/);
});

test("POST /api/payments/verify rejects transaction belonging to another user", async () => {
  const mockTx = new PaymentTransaction({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(otherUserId),
    packageId: new mongoose.Types.ObjectId(),
    tranId: "SSLCZ_TEST_OTHER",
    amount: 499,
    status: "pending",
  });

  PaymentTransaction.findOne = async () => mockTx;

  const res = await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      tranId: "SSLCZ_TEST_OTHER",
      status: "success",
    });

  assert.equal(res.status, 403);
});

test("activateUserSubscription extends active subscription if one is already active", async () => {
  const existingEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days remaining
  const existingSub = new Subscription({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(testUserId),
    packageId: new mongoose.Types.ObjectId(),
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    endDate: existingEnd,
    status: "active",
  });
  existingSub.save = async function () {
    return this;
  };

  Subscription.findOne = () => ({
    sort: () => existingSub,
  });

  const packageDoc = { _id: new mongoose.Types.ObjectId(), durationDays: 30 };
  const extended = await activateUserSubscription(testUserId, packageDoc, null);

  assert.equal(extended._id.toString(), existingSub._id.toString());
  // The new endDate should be roughly 10 + 30 = 40 days from now
  const daysFromNow = (extended.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  assert.ok(daysFromNow > 39 && daysFromNow < 41);
});

test("GET /api/payments/history returns user transactions sorted newest first", async () => {
  let queryCaptured;
  PaymentTransaction.find = (query) => {
    queryCaptured = query;
    return {
      sort: () => ({
        populate: () => [
          new PaymentTransaction({
            _id: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(testUserId),
            packageId: new mongoose.Types.ObjectId(),
            tranId: "SSLCZ_TEST_002",
            amount: 3999,
            status: "success",
          }),
        ],
      }),
    };
  };

  const res = await request(app)
    .get("/api/payments/history")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.transactions.length, 1);
  assert.equal(queryCaptured.userId.toString(), testUserId);
});

test("GET /api/subscriptions/me returns isPremium: false when no active subscription", async () => {
  Subscription.updateMany = async () => ({ modifiedCount: 0 });
  Subscription.findOne = () => ({
    sort: () => ({
      populate: () => null,
    }),
  });

  const res = await request(app)
    .get("/api/subscriptions/me")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.isPremium, false);
  assert.equal(res.body.data.daysRemaining, 0);
});

test("GET /api/subscriptions/me returns isPremium: true and calculated daysRemaining when active", async () => {
  const endDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days in future
  const pkgObj = {
    _id: new mongoose.Types.ObjectId(),
    name: "Monthly Premium",
    code: "monthly",
    price: 499,
    durationDays: 30,
  };
  const mockSub = {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(testUserId),
    packageId: pkgObj,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endDate,
    status: "active",
    toJSON() {
      return {
        id: this._id.toString(),
        userId: this.userId.toString(),
        packageId: pkgObj,
        startDate: this.startDate,
        endDate: this.endDate,
        status: this.status,
      };
    },
  };

  Subscription.updateMany = async () => ({ modifiedCount: 0 });
  Subscription.findOne = () => ({
    sort: () => ({
      populate: () => mockSub,
    }),
  });

  const res = await request(app)
    .get("/api/subscriptions/me")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.isPremium, true);
  assert.equal(res.body.data.daysRemaining, 15);
  assert.equal(res.body.data.package.name, "Monthly Premium");
});
