
import { Router } from 'express';
const router = Router();

import * as postServices from "./service/post.services.js";

router.post("/bulk", postServices.bulkPosts);  
router.get("/postsWithUser", postServices.postsWithUser);    
router.get("/aggregate", postServices.aggregateBYTitle);
router.get("/:id", postServices.getPotById);  
router.patch("/change_title", postServices.updateTitle);  
router.patch("/:postId", postServices.updateContent);  
router.put("/replace/:postId", postServices.replacePOST);  
router.delete("/:postId", postServices.deletePostById);
router.delete("/user/:userId", postServices.deleteAllPostsForUser);

//________________________________
export default router;

