const express = require("express");
const router = express.Router();
const quesController = require("../controllers/ques-controllers");
const authMiddleware = require("../middlewares/auth-middleware");

// Create a new question (User can also provide an answer while posting)
router.post("/", quesController.createQuestion);

// Get all public questions
router.get("/public", quesController.getAllQuestions);

// Get top 10 trending questions (public, sorted by likes)
router.get("/trending", quesController.getTrendingQuestions);

// Get all private questions of the logged-in user
router.get("/private/:userId", quesController.getPrivateQuestions);

// Get all questions by a specific user (both public and private for that user)
router.get("/user/:userId", quesController.getQuestionsByUserId);

// Update a specific question (only by the owner)
router.put("/:userId/:questionId", quesController.updateQuestion);

// Delete a specific question (only by the owner)
router.delete("/:userId/:questionId", quesController.deleteQuestion);

// Like a question
router.post("/:questionId/like", authMiddleware, quesController.likeQuestion);

// Toggle question visibility (public/private)
router.put("/:userId/:questionId/toggle-visibility", quesController.toggleVisibility);

// Add an answer to a question
router.post("/:questionId/answer", quesController.addAnswer);

// Get all answers for a specific question
router.get("/:questionId/answer", quesController.getAnswers);

// Get all answers posted by a user
router.get("/answers/user/:userId", quesController.getAnswersByUserId);


module.exports = router;
