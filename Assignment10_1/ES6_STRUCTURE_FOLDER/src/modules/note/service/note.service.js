import mongoose from "mongoose";
import { errorHandling } from "../../../utils/errorHandling.js";
import postModel from "../../../DB/model/post.model.js";
import userModel from "../../../DB/model/user.model.js";
import noteModel from "../../../DB/model/note.model.js";

import * as bcrypt from "bcrypt";

import CryptoJS from "crypto-js";

import jwt from "jsonwebtoken";

//___________________________________________________________________

export const singleNote = async (req, res, next) => {
  try {
    const { content, title } = req.body; // Extract content and new title from the request body
    const { authorization } = req.headers;
    // Validate inputs
    if (!content || !title) {
      return res.status(400).json({
        message: "Invalid input. Both content and title are required.",
      });
    }

    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);
    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }
    const note = await noteModel.create({
      userId: decodeToken.userId,
      content: req.body.content,
      title: req.body.title,
    });

    return res.status(201).json({ message: "note added successfully", note });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params; // Extract postId from the URL
    const { content, title } = req.body; // Extract userId and new title from the request body
    const { authorization } = req.headers;
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    // Validate inputs
    if (!content || !title) {
      return res.status(400).json({
        message: "Invalid input. Both content and title are required.",
      });
    }
    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note Id" });
    }

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if user is owner of the note can make this operation
    const note = await noteModel.findById(noteId);
    if (!note) { 
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.userId.toString() !== decodeToken.userId.toString()) { 
      return res.status(403).json({ message: "You are not the owner of this note"})
    }
    // Update the note
    const updatedNote = await noteModel.findByIdAndUpdate(noteId, {
      content: content,
      title: title,
    }, {
      new: true, // Return the updated document
    })

  
    // Respond with the number of updated posts
    res.status(200).json({
      message: "note updated successfully.",
      updatedCount: updatedNote,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const replaceNote = async (req, res, next) => {
  try {
    const { noteId } = req.params; // Extract postId from the URL
    const { content, title } = req.body; // Extract userId and new title from the request body
    const { authorization } = req.headers;
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note Id" });
    }

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if user is owner of the note can make this operation
    const note = await noteModel.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.userId.toString() !== decodeToken.userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this note" });
    }
    // replace the note
    const replacedNote = await noteModel.findOneAndReplace(
      {_id:noteId},
      {
        content,
        title,
        userId: decodeToken.userId,
      },
      {
        new: true, // Return the updated document
      }
    );

    // Respond with the number of updated posts
    res.status(200).json({
      message: "note replace successfully.",
      updatedCount: replacedNote,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};


export const updateAllNoteTitleForUser = async (req, res, next) => {
  try {
    
    const {  title } = req.body; // Extract new title from the request body
    const { authorization } = req.headers;
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

    
    // Update the notes title
    const updatedNotes = await noteModel.updateMany(
      { userId: decodeToken.userId },
      { title },
      {
        runValidators: true, // Run the validators on the updated document
       }
    );

    if (updatedNotes.modifiedCount === 0) {
      return res.status(404).json({ message: "No notes found to update" });
    }

    // Respond with the number of updated posts
    res.status(200).json({
      message: "Notes updated successfully",
      updatedCount: updatedNotes.modifiedCount,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params; // Extract postId from the URL
    const { authorization } = req.headers;
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    
    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note Id" });
    }

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if user is owner of the note can make this operation
    const note = await noteModel.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.userId.toString() !== decodeToken.userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this note" });
    }
    // delete the note
    const deleteNote = await noteModel.findByIdAndDelete(noteId);

    // Respond with the number of updated posts
    res.status(200).json({
      message: "Note deleted successfully .",
       deleteNote,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const paginateNoteSortByCreatedAt = async (req, res, next) => {
  try {
    const { page, sort, limit } = req.query;
     const { authorization } = req.headers;
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
   
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);
   

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

    
    // Update the note
    const notes = await noteModel
      .find({ userId: decodeToken.userId })
      .skip(pageNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });
    if (notes.length == 0) {
      return res
        .status(404)
        .json({ message: "No notes found for this paginate" });
    }

  
    // Respond with the number of updated posts
    res.status(200).json({
      message: "paginate Note Sorted By CreatedAt.",
      notes,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};


export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params; // Extract postId from the URL
    
    const { authorization } = req.headers;
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note Id" });
    }

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if user is owner of the note can make this operation
    const note = await noteModel.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.userId.toString() !== decodeToken.userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this note" });
    }
    // get the note
    const Note = await noteModel.findById(noteId);

    // Respond with the number of updated posts
    res.status(200).json({
      message: "done",
      Note,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const getNoteByContent = async (req, res, next) => {
  try {
    const { content } = req.query;

    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "You must be logged in  authorization require" });
    }
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

   
    // get the note
    const Note = await noteModel.findOne({
      userId: decodeToken.userId,
      content: { $regex: content, $options: "i" }, // Case-insensitive search
    });
    if (!Note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Respond with the number of updated posts
    res.status(200).json({
      message: "done",
      Note,
    });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const getNotesWithUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "You must be logged in  authorization require" });
    }
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch notes for the logged-in user and populate user details
    const notes = await noteModel
      .find({ userId: decodeToken.userId })
      .select("title userId createdAt") // Select note fields
      .populate({
        path: "userId",
        select: "email -_id", // Select user email only
      });

    if (notes.length === 0) {
      return res.status(404).json({ message: "No notes found" });
    }

    res.status(200).json({message:"done" ,notes });
  } catch (error) {
    errorHandling(error, res);
  }
};
export const aggregateByTitle = async (req, res, next) => {
  try {
    const { title } = req.query;
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "You must be logged in  authorization require" });
    }
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(decodeToken.userId);
    

    // Fetch notes for the logged-in user and populate user details
    const notes = await noteModel.aggregate([
      {
        $match: {
          // userId:decodeToken.userId,
          
          title: { $regex: title, $options: "i" } , // Optional title filter (case-insensitive)
        },
      },
      {
        $lookup: {
          from: "users", // Collection to join
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user", // Deconstruct user array
      },
      {
        $project: {
          title: 1,
          createdAt: 1,
          "user.userName": 1,
          "user.email": 1,
        },
      },
    ]);
      

    if (notes.length === 0) {
      return res.status(404).json({ message: "No notes found" });
    }

    res.status(200).json({ message: "done", notes });
  } catch (error) {
    errorHandling(error, res);
  }
};

export const deleteAllNotesForUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "You must be logged in  authorization require" });
    }
    const decodeToken = jwt.verify(authorization, process.env.TOKEN_SIGNATURE);

    if (!(await userModel.findById(decodeToken.userId))) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch notes for the logged-in user and populate user details
    const result = await noteModel.deleteMany({
      userId: decodeToken.userId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No notes found to delete" });
    }

    res
      .status(200)
      .json({ message: `${result.deletedCount} notes deleted successfully` });
  } catch (error) {
    errorHandling(error, res);
  }
};



//_____________________________________________________
