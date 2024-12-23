import { ObjectId } from "mongodb";
import { errorHandling } from "../../../utils/errorHandling.js";
import postModel from "../../../DB/model/post.model.js";

import mongoose from "mongoose";
import userModel from "../../../DB/model/user.model.js";

//___________________________________________________________________
export const bulkPosts = async (req, res, next) => {
  try {
    const posts = await postModel.insertMany(req.body);

    return res.status(201).json({ message: "Posts added successfully", posts });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const getPotById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract ID from route parameters

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Find the post by ID
    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res
      .status(201)
      .json({ message: "Post retrieved successfully", post });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const postsWithUser = async (req, res, next) => {
  try {
    // Retrieve all posts and populate the associated user's email
    const posts = await postModel
      .find({})
      .select("title userId createdAt") // Select only the specified fields from the Post collection
      .populate({
        path: "userId",
        projection: { _id: 0 },
        select: "email -_id", // Include email and exclude _id from the User collection
      });

    return res
      .status(200)
      .json({
        message: "Posts with associated user emails retrieved successfully",
        posts,
      });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const aggregateBYTitle = async (req, res, next) => {
  try {
    const { title } = req.query; // Extract the title query parameter if provided
    const posts = await postModel.aggregate([
      // Match posts by title
      { $match: { title } },
      // Lookup to join with the User collection
      {
        $lookup: {
          from: "users", // Name of the User collection in MongoDB
          localField: "userId", // Field in the Post collection
          foreignField: "_id", // Field in the User collection
          as: "user", // Resulting field in the output
        },
      },
      // Project the fields to include in the final output
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: 1,
          "user.userName": 1,
          "user.email": 1,
        },
      },
      // Unwind the user array to get a single user object
      { $unwind: "$user" },
    ]);

    return res.status(200).json({
      message: "Posts with associated user emails retrieved successfully",
      posts,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const updateTitle = async (req, res, next) => {
  try {
    const { userId, title } = req.body; // Extract userId and new title from the request body

    // Validate inputs
    if (!userId || !title) {
      return res.status(400).json({
        message: "Invalid input. Both userId and title are required.",
      });
    }
    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // Update the title for all posts associated with the userId
    const updatedPosts = await postModel.updateMany(
      { userId }, // Filter by userId
      { title } // Update the title field
    );

    // Check if any posts were updated
    if (updatedPosts.matchedCount === 0) {
      return res.status(404).json({
        message: "No posts found for the provided userId.",
      });
    }

    // Respond with the number of updated posts
    res.status(200).json({
      message: "Titles updated successfully.",
      updatedCount: updatedPosts.modifiedCount,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const { postId } = req.params; // Extract postId from the URL
    const { content } = req.body; // Extract new content from the request body
    // Validate the content
    if (!content) {
      return res.status(400).json({
        message: "Content is required.",
      });
    }

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }

   
    // Update the content of the specific post
    const updatedPost = await postModel.findByIdAndUpdate(
      postId, // Find the post by ID
      { content }, // Update the content field
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    // Check if the post exists
    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    // Respond with the updated post
    res.status(200).json({
      message: "Post content updated successfully.",
      post: updatedPost,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};
export const replacePOST = async (req, res, next) => {
  try {
    const { postId } = req.params; // Extract postId from the URL
    const newPostData = req.body; // Extract the new post data from the request body
    // Validate the new post data
    if (!newPostData.title || !newPostData.content || !newPostData.userId) {
      return res.status(400).json({
        message:
          "Invalid input. 'title', 'content', and 'userId' are required fields.",
      });
    }
    // Check if the user id exist
    if (!(await userModel.findById(newPostData.userId))) {
      return res.status(400).json({ message: "User not found by userid in new post" });
    }

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }

    // Replace the post document
    const replacedPost = await postModel.findOneAndReplace(
      { _id: postId }, // Find the post by ID
      { ...newPostData }, // Replace with the new data
      { new: true, runValidators: true } // Return the new document and run validators
    );

    // Check if the post exists
    if (!replacedPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    // Respond with the updated post
    res.status(200).json({
      message: "Post replaced successfully.",
      post: replacedPost,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const deletePostById = async (req, res, next) => {
  try {
    const { postId } = req.params; // Extract postId from the URL

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post Id" });
    }

    const deletedPost = await postModel.findByIdAndDelete(postId);
    // Check if the user exists
    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    // Respond with success message
    res.status(200).json({
      message: "Post deleted successfully.",
      post: deletedPost,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const deleteAllPostsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params; // Extract postId from the URL

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user Id" });
    }

    const result = await postModel.deleteMany({
      userId,
    });
    // Check if posts were deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Post not found initiate by this user id",
      });
    }
    // Respond with success message
    res.status(200).json({
      message: "Posts deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

