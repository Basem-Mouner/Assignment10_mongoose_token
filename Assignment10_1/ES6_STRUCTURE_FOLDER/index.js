"use strict";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve("./src/config/.env.dev") });
//_______________________ES5_____________________________________________
import bootstrap from "./src/app.controller.js";
//____________________________________________________________________
import express from "express";
const app = express();
const PORT = 3000;
//____________________________________________________________________
//____________________________________________________________________

bootstrap(app, express);

const server = app.listen(PORT, "localhost", 511, () => {
  console.log(`Server is running on localhost ${PORT}`);
});

server.on("error", (err) => {
  if (err.code == "EADDRINUSE") {
    //  PORT=3001
    console.error("server error..invalid port...port token");
    // setTimeout(() => {
    //   server.listen(port)
    // }, 1000);
    //or
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 1000);
  }
});
//_______________________________________________________________________
