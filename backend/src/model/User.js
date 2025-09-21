import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    nic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    termsAccepted: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      default: "customer",
    },
  },
  { timestamps: true }
);

// 🔹 Pre-save hook to auto-generate userId like C001, C002, ...
userSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const lastUser = await this.constructor.findOne(
      {},
      {},
      { sort: { createdAt: -1 } }
    );
    let nextId = "C001";

    if (lastUser && lastUser.userId) {
      const lastNum = parseInt(lastUser.userId.replace("C", ""), 10);
      const newNum = lastNum + 1;
      nextId = "C" + newNum.toString().padStart(3, "0");
    }

    this.userId = nextId;
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
