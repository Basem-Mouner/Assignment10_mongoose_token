
import { Router } from 'express';
const router = Router();

import * as userProfileServices from "./service/profile.service.js";

router.post("/signup", userProfileServices.signup); //assignment 10-1&10-2
router.post("/login", userProfileServices.login); //assignment 10-1&10-2

router.get("/age", userProfileServices.userByMinAge);  //assignment 10-1
router.get("/email", userProfileServices.userByEmail);    //assignment 10-1
router.get("/paginate_sort", userProfileServices.userByPaginate_sort);  //assignment 10-1

router.patch("/", userProfileServices.updateProfileByToken); //assignment 10-2
router.delete("/", userProfileServices.deleteProfileByToken);//assignment 10-2
router.get("/", userProfileServices.getProfileByToken);//assignment 10-2


router.patch("/:userId", userProfileServices.updateProfileById);//assignment 10-1
router.delete("/:userId", userProfileServices.deleteProfileById);//assignment 10-1

//________________________________
export default router;

