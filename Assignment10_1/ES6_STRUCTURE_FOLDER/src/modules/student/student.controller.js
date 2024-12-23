
import { Router } from 'express';
const router = Router();

import * as studentServices from ".//service/student.service.js";

router.post("/", studentServices.addStudents);
router.get("/", studentServices.enrolledInMath);
router.patch("/update_enrollment/:id", studentServices.update_enrollment);
router.get("/aggregate", studentServices.aggregation);
router.delete("/enrollment", studentServices.deleteEnrollment);//Delete all students who are not currently enrolled (isEnrolled = false ).





//________________________________
export default router;

