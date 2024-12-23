import mongoose, { model, Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      validate: {
          validator: function (value) {
              if (value == value.toUpperCase()) {
                  return false
              } else {
                  return true
              }
              //or
          return value !== value.toUpperCase(); // Custom validator: Ensure title is not all uppercase RETURN false if value--> upper
        },
        message: "Title cannot be entirely uppercase",
      },
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User collection
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

const postModel = mongoose.models.Post || model("Post", postSchema);
export default postModel;
