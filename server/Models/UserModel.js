import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "analyst", "viewer"],
      default: "viewer"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});



const UserModel = mongoose.model("User", userSchema);

export default UserModel;