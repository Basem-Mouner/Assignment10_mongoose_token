import mongoose from "mongoose";
import userModel from "../../../DB/model/user.model.js";
import { errorHandling } from "../../../utils/errorHandling.js";

import * as bcrypt from "bcrypt";

import CryptoJS from "crypto-js";

import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  try {
    const { userName, email, age, password, confirmationPassword, phone } =
      req.body;
    //check password and  confirmationPassword
    if (password != confirmationPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    //check if user already exists
    if (await userModel.findOne({ email })) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const encryptPhone = CryptoJS.AES.encrypt(
      phone,
      process.env.ENCRYPTION_SIGNATURE
    );
    const hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SALT_ROUND)
    );

    const user = await userModel.create({
      userName,
      email,
      age,
      password: hashedPassword,
      phone: encryptPhone.toString(),
    });

    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }); //{}  null
    if (!user) {
      return res
        .status(404)
        .json({ message: "In-Valid Account email or password" });
    }
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "In-Valid Account email or password" });
    }
    //________________
    user.phone = CryptoJS.AES.decrypt(
      user.phone,
      process.env.ENCRYPTION_SIGNATURE
    ).toString(CryptoJS.enc.Utf8);
    // generate token for each user
    const token = jwt.sign(
      { userId: user._id, isLogged: true }, //payload
      process.env.TOKEN_SIGNATURE, //pathAlgorithm
      { expiresIn: "1h" } //options
    );

    //___________________
    return res.status(200).json({ message: "done login", token });
  } catch (error) {
    return res.status(500).json({ message: "error", error });
  }
};

export const userByMinAge = async (req, res, next) => {
  try {
    const { minAge } = req.query;
    // Validate that minAge is provided and is a number
    if (!minAge || isNaN(minAge)) {
      return res.status(400).json({
        message: "minAge query parameter is required and must be a number",
      });
    }
    // Retrieve users whose age is greater than the provided minAge and sort them DESC by age
    const users = await userModel
      .find({ age: { $gt: Number(minAge) } })
      .sort({ age: -1 });
    users.length > 0
      ? res.status(200).json({
          message: `Users older than ${minAge} retrieved successfully`,
          users,
        })
      : res.status(404).json({
          message: `Users older than ${minAge} not found`,
        });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const userByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    // Validate that minAge is provided and is a number
    if (!email) {
      return res.status(400).json({
        message: "Email query parameter is required",
      });
    }
    // Retrieve users whose age is greater than the provided minAge and sort them DESC by age
    const users = await userModel.findOne({ email });
    users
      ? res.status(200).json({
          message: "User retrieved successfully",
          users,
        })
      : res.status(404).json({
          message: `Users with email: ${email} not found`,
        });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const userByPaginate_sort = async (req, res, next) => {
  try {
    const { page, sort, limit } = req.query;

    // Validate that page and limit are numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber <= 0 ||
      limitNumber <= 0
    ) {
      return res.status(400).json({
        message: "Page and limit query parameters must be positive numbers",
      });
    }

    // // Calculate skip value for pagination
    // const skip = (pageNumber - 1) * limitNumber;

    // Retrieve the paginated and sorted users
    const users = await userModel
      .find({})
      .sort({ [sort]: 1 }) // Sort by the specified field (ascending by default)
      .skip(pageNumber)
      .limit(limitNumber);
    users.length > 0
      ? res.status(200).json({
          message: "User retrieved paginated",
          users,
        })
      : res.status(404).json({
          message: `not Users  found achieve this pagination`,
        });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const updateProfileById = async (req, res, next) => {
  try {
    const { userId } = req.params; // Extract the userId from the URL
    const { age } = req.body; // Extract the new age from the request body
    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    // Validate that age is provided and is within the allowed range
    if (!age || age < 18 || age > 60) {
      return res.status(400).json({
        message: "Invalid age. Age must be between 18 and 60.",
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        age,
      },
      { new: true, runValidators: true } // Return the updated document and run validators
    );
    // Check if the user exists
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    return res
      .status(200)
      .json({ message: "User's age updated successfully.", user: updatedUser });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const updateProfileByToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);
   
    
    const { email, name, phone } = req.body;

  
    if (await userModel.findOne({ email })) {
      return res
        .status(400)
        .json({ message: "Email you needed to change to it already exists" });
    }

    const encryptPhone = CryptoJS.AES.encrypt(
      phone,
      process.env.ENCRYPTION_SIGNATURE
    );

    const updatedUser = await userModel.findByIdAndUpdate(
      decodeToken.userId,
      {
        email,
        name,
        phone: encryptPhone.toString(),
      },
      { new: true, runValidators: true } // Return the updated document and run validators
    ).select("-password");
    // Check if the user exists
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

     updatedUser.phone = CryptoJS.AES.decrypt(
       updatedUser.phone,
       process.env.ENCRYPTION_SIGNATURE
     ).toString(CryptoJS.enc.Utf8);// Decrypt the phone number

    return res
      .status(200)
      .json({ message: "User updated successfully.", user: updatedUser });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const deleteProfileById = async (req, res, next) => {
  try {
    const { userId } = req.params; // Extract userId from the URL

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const deletedUser = await userModel.deleteOne({
      _id: userId,
    });
    // Check if the user exists
    if (!deletedUser.deletedCount) {
      return res.status(404).json({
        message: "User not found or deleted previous.",
      });
    }
    // Respond with success message
    res.status(200).json({
      message: "User deleted successfully.",
      user: deletedUser,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const deleteProfileByToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);


  

    const deletedUser = await userModel.findByIdAndDelete( decodeToken.userId)
     
    // Check if the user exists
    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

  
    return res
      .status(200)
      .json({ message: "User deleted successfully.", user: deletedUser });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const getProfileByToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization); 
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);
   
    const user = await userModel.findById(decodeToken.userId);
    // .select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // user.phone = CryptoJS.AES.decrypt(
    //   user.phone,
    //   process.env.ENCRYPTION_SIGNATURE
    // ).toString(CryptoJS.enc.Utf8);

    return res.status(200).json({ message: "users profile by id", user });
  } catch (error) {
    errorHandling(error, res);
  }
};


