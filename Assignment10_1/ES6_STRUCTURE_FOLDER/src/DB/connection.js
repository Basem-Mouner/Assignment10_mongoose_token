//_____________________ ACTIVE this for part 1 mongo db _________________________________________________
import { MongoClient } from "mongodb";
const URI = "mongodb://localhost:27017";// Replace the uri string with your connection string.
const client = new MongoClient(URI); // mongosh

export const db = client.db('Assignment10') //use sara7aProgram
//___________________________________________________________
export const connectDB_mongoDB = async () => {
     await client.connect().then((res) => {
          console.log("DB MONGOSH CONNECTED SUCCESS");
     }).catch((err) => {
          console.log("FAILED to Connected to DB", err);
     });
}
//__________________________________________________________________

import mongoose from "mongoose";

export const connectDB_mongoose = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/Assignment10", {
      serverSelectionTimeoutMS: 5000, //default 30000ms
    })
    .then((res) => console.log("DB MONGOOSE connected"))
    .catch((err) => console.log("Fail to connect to DB", err));
};
