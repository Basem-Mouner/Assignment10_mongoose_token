import userController from "./modules/user/user.controller.js";
import studentController from "./modules/student/student.controller.js";
import postController from "./modules/post/post.controller.js";
import noteController from "./modules/note/note.controller.js";
import { connectDB_mongoDB, connectDB_mongoose } from "./DB/connection.js";

const bootstrap = (app, express) => {
  //_____________middle ware____________________________________________________________________
  app.use(express.json()); //convert buffer data
  //_____________DB CONNECTION______________________________________________________________________
  //_______________________MONGO DB CONNECTION________PART ONE IN ASSIGNMENT
  // connectDB_mongoDB();
  //_____________MONGOOSE CONFECTIONS____________PART TWO IN ASSIGNMENT
  connectDB_mongoose();
  //___________________________________________________________________________________________________
  //___________app routing_____________________
  app.get("/", (req, res, next) =>
    res
      .status(200)
      .json({ message: "Hello in my New Folder Structure express ES6" })
  );
  //_____________sup express routing____________
  app.use("/users", userController);
  app.use("/posts", postController);
  app.use("/notes", noteController);
  app.use("/students", studentController);
  //______________________________________________
  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "page not found" });
  });
  //________________________________________________
};

export default bootstrap;
