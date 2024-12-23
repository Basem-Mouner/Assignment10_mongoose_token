import { ObjectId } from "mongodb";
import { errorHandling } from "../../../utils/errorHandling.js";
import StudentModule from "../../../DB/model/students.module.js";
//_____________________________________part 1_________________________________________________________
//___________________________Q 1_________________________________________
export const addStudents = async (req, res, next) => {
  try {
    const result = await StudentModule.insertMany(req.body);

    return res.status(200).json({ message: "Done", result });
  } catch (error) {
    errorHandling(error, res);
  }
};
//____________________Q 2___________________________
export const enrolledInMath = async (req, res, next) => {
  try {
    const students = await StudentModule.find({
      subjects:{ $in:["Math"]}, // Check if "Math" is in the subjects array
      age: { $gt: 18 }, // Age greater than 18
    }).toArray();
    students.length > 0 ? res.status(200).json({ message: "Done", students }) :
   res.status(404).json({ message: "no user found" })

    
  } catch (error) {
    errorHandling(error, res);
  }
};
//____________________Q 3___________________________
export const update_enrollment = async (req, res, next) => {
  try {

    const result = await StudentModule.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          isEnrolled:true
        },
      }
    );
    result.matchedCount
      ? res
          .status(200)
          .json({ message: "Student enrollment updated successfully", result })
      : res
          .status(404)
          .json({ message: "Student not found with the given ID" });
  } catch (error) {
    errorHandling(error, res);
  }
};
//____________________Q 4___________________________
export const aggregation = async (req, res, next) => {
  try {
    
    const result = await StudentModule.aggregate([
      {
        $group: {
          _id: "$isEnrolled", // Group by "isEnrolled" status
          averageAge: { $avg: "$age" }, // Calculate average of "age"
        },
      },
    ]).toArray();
    result
      ? res
          .status(200)
          .json({ message: "Student enrollment aggregate ", result })
      : res
          .status(404)
          .json({ message: "Student not found with the given ID" });
  } catch (error) {
    errorHandling(error, res);
  }
};
//____________________Q 5___________________________
export const deleteEnrollment = async (req, res, next) => {
  try {
    const result = await StudentModule.deleteMany({
      isEnrolled: false,
    });

    // Check if any documents were deleted
    
    result.deletedCount > 0?res.status(200).json({
          message: `${result.deletedCount} students deleted successfully`,
        })
      : res
          .status(404)
          .json({ message: "No students found with isEnrolled = false" })
      
  } catch (error) {
    errorHandling(error, res);
  }
};
//______________________________________________________________________________________________