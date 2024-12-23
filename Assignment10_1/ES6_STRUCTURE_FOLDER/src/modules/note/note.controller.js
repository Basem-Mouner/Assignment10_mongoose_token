import { Router } from "express";
const router = Router();

import * as noteServices from "./service/note.service.js";

router.post("/", noteServices.singleNote);
router.patch("/all", noteServices.updateAllNoteTitleForUser);
router.patch("/:noteId", noteServices.updateNote);
router.put("/replace/:noteId", noteServices.replaceNote);

router.delete("/all", noteServices.deleteAllNotesForUser);
router.delete("/:noteId", noteServices.deleteNote);

router.get("/paginate_sort", noteServices.paginateNoteSortByCreatedAt);
router.get("/note_by_content", noteServices.getNoteByContent);
router.get("/note_with_user", noteServices.getNotesWithUser);
router.get("/aggregate", noteServices.aggregateByTitle);
router.get("/:noteId", noteServices.getNoteById);

//________________________________
export default router;
