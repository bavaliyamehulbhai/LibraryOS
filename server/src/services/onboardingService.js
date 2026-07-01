const User = require("../models/User");
const Library = require("../models/Library");
const Organization = require("../models/Organization");
const Subscription = require("../models/Subscription");
const LibrarySettings = require("../models/LibrarySettings");
const Onboarding = require("../models/Onboarding");
const OnboardingAnalytics = require("../models/OnboardingAnalytics");
const trialService = require("./trialService");
const bcrypt = require("bcryptjs");

const TOTAL_STEPS = 6; 

exports.registerLibrary = async ({ libraryName, adminName, email, phone, password }) => {
  // 1. Validation check
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email is already registered");

  // 2. Generate Tenant Code
  const count = await Library.countDocuments();
  const tenantCode = `TEN-${String(count + 1).padStart(6, '0')}`;
  
  // 3. Create Tenant (Library model)
  const tenant = new Library({
    name: libraryName,
    code: tenantCode,
    email: email, // Using admin email as tenant contact
    phone: phone,
    address: "Pending",
    city: "Pending",
    state: "Pending",
    pincode: "Pending",
    status: "TRIAL",
    // We pass a dummy ObjectId for createdBy temporarily, will update after Admin user is created
  });
  
  // We need to bypass some validation for createdBy for the first user
  tenant.createdBy = tenant._id; // Temp workaround since admin doesn't exist yet
  await tenant.save();

  // 4. Create Organization Profile
  const orgCount = await Organization.countDocuments();
  const organizationCode = `ORG-${String(orgCount + 1).padStart(6, '0')}`;
  const organization = new Organization({
    libraryId: tenant._id,
    organizationCode,
    name: libraryName,
    email: email,
    phone: phone,
    status: "ACTIVE"
  });
  await organization.save();

  // 5. Create 14-Day Trial Subscription — find or create trial plan
  const Plan = require("../models/Plan");
  let trialPlan = await Plan.findOne({ planCode: "PLAN-TRIAL" });
  if (!trialPlan) {
    trialPlan = new Plan({
      planCode: "PLAN-TRIAL",
      planName: "Trial Plan",
      price: 0,
      billingCycle: "MONTHLY",
      maxBooks: 200,
      maxMembers: 50,
      maxBranches: 1,
      status: "ACTIVE"
    });
    await trialPlan.save();
  }

  const trialExpires = new Date();
  trialExpires.setDate(trialExpires.getDate() + 14);
  
  const subscription = new Subscription({
    libraryId: tenant._id,
    planId: trialPlan._id,
    status: "ACTIVE",
    expiryDate: trialExpires,
    autoRenew: false
  });
  await subscription.save();

  // Activate Tracking Trial Record
  await trialService.activateTrial(tenant._id, 14);

  // Link subscription to Tenant
  tenant.subscriptionId = subscription._id;
  await tenant.save();

  // 6. Create Admin User
  const adminUser = new User({
    name: adminName,
    email,
    phone,
    password: password,
    role: "LIBRARY_ADMIN",
    libraryId: tenant._id,
    isActive: true
  });
  await adminUser.save();

  // 7. Create Default Settings
  const settings = new LibrarySettings({
    libraryId: tenant._id,
    language: "en",
    timezone: "Asia/Kolkata",
    currency: "INR"
  });
  await settings.save();

  // 8. Initialize Onboarding Logs & Wizard Tracker
  await Onboarding.create({ libraryId: tenant._id });
  await OnboardingAnalytics.create({ libraryId: tenant._id });

  // Return limited data
  return {
    tenantId: tenant._id,
    tenantCode: tenant.code,
    organizationCode: organization.organizationCode,
    adminEmail: adminUser.email
  };
};

exports.getOnboardingStatus = async (libraryId) => {
  let onboarding = await Onboarding.findOne({ libraryId }).lean();
  if (!onboarding) {
    onboarding = await Onboarding.create({ libraryId });
    await OnboardingAnalytics.create({ libraryId });
  }
  return onboarding;
};

exports.updateProgress = async (libraryId, stepCompleted, nextStep) => {
  const onboarding = await Onboarding.findOne({ libraryId });
  
  if (!onboarding.completedSteps.includes(stepCompleted)) {
    onboarding.completedSteps.push(stepCompleted);
  }
  
  onboarding.currentStep = nextStep;
  onboarding.completionPercentage = Math.round((onboarding.completedSteps.length / TOTAL_STEPS) * 100);

  if (onboarding.completionPercentage >= 100) {
    onboarding.completionPercentage = 100;
    onboarding.isCompleted = true;
    onboarding.currentStep = "COMPLETE";
  }

  await onboarding.save();
  return onboarding;
};
