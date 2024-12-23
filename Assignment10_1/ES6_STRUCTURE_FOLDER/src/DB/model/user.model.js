import mongoose, { model, Schema } from "mongoose";

const roleTypes = {
  admin: "admin",
  user: "user",
  //   HR: "hr",
  //   moderator: "moderator",
};

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "Please enter your name"],
      minLength: 2,
      maxLength: 20,
      validate: {
        validator: function (v) {
          if (v == "admin") {
            return false;
          } else if (v == "ADMIN") {
            throw new Error("ADMIN is not allowed");
          } else {
            return true;
          }
        },
        message: "userName cant be admin",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, //not validator but its just query helper
      trim: true,
    },
    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [60, "Age must not exceed 60"],
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: "user",
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    image: String,
    phone: String,
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
