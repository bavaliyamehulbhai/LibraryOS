const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const ROLES = require("../constants/roles");

const userSchema = new mongoose.Schema(
{
  name:{
    type:String,
    required:true,
    trim:true
  },

  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
  },

  password:{
    type:String,
    required:[true, "Password is required"],
    minlength:[8, "Password must be at least 8 characters"],
    select: false
  },

  phone:{
    type:String
  },

  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.MEMBER,
  },

  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
  },

  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },

  memberProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },

  libraryId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Library",
    required:true
  },

  avatar:{
    type:String,
    default:""
  },

  isActive:{
    type:Boolean,
    default:true
  },

  lastLogin:{
    type:Date
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: {
    type: Date
  },

  twoFactorEnabled: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
    default: "ACTIVE",
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
  },
  profilePhoto: { type: String },
  designation: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  joiningDate: { type: Date, default: Date.now },
  passwordChangedAt: Date,

  twoFactorMethod: {
    type: String,
    enum: ["EMAIL", "TOTP", "AUTHENTICATOR"],
    default: "EMAIL"
  },

  twoFactorSecret: {
    type: String
  },

  passkeys: [{
    credentialId: String,
    publicKey: String,
    counter: { type: Number, default: 0 }
  }],

  recoveryCodes: [{
    type: String
  }],

  trustedDevices: [{
    deviceId: String,
    browser: String,
    expiresAt: Date
  }],

  emailVerified: {
    type: Boolean,
    default: false
  },

  provider: {
    type: String,
    enum: ["LOCAL", "GOOGLE", "MICROSOFT", "LINKEDIN"],
    default: "LOCAL"
  },

  providerId: {
    type: String,
    default: null
  },

  isBlocked: {
    type: Boolean,
    default: false
  },

  blockReason: {
    type: String,
    default: null
  }

},
{
  timestamps:true
}
);

// Indexes for performance
userSchema.index({ libraryId: 1, role: 1 });

// Virtual fields
userSchema.virtual("fullName").get(function(){
  return this.name;
});

// Password Hash Middleware
userSchema.pre("save", async function() {
  if(!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password Method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
