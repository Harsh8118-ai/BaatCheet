const Question = require("../models/ques-model");
const mongoose = require("mongoose");

// Create or Add a Question (User can also provide an answer while posting)
const createQuestion = async (req, res) => {
  try {
    console.log("Received Data:", req.body);

    const { userId, username, questions } = req.body;

    if (!userId || !questions || questions.length === 0 || !questions[0].question ) {
      return res.status(400).json({ message: "UserId, Question, and Answer are required!" });
    }

    let userQuestionDoc = await Question.findOne({ userId });

    if (!userQuestionDoc) {
      userQuestionDoc = new Question({ userId, username, questions });
    } else {
      userQuestionDoc.questions.push(...questions);
    }

    await userQuestionDoc.save();
    res.status(201).json({ message: "Question added successfully!", questions: userQuestionDoc.questions });
  } catch (error) {
    console.error("Error posting question:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all public questions
const getAllQuestions = async (req, res) => {
  try {
    const users = await Question.aggregate([
      { $unwind: "$questions" },
      { $match: { "questions.isPublic": true } },
      {
        $project: {
          _id: "$questions._id",
          username: 1,
          userId: 1,
          question: "$questions.question",
          answer: "$questions.answer",
          likes: { $size: "$questions.likes" },
          tags: "$questions.tags",
          createdAt: "$questions.createdAt"
        }
      }
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    res.status(500).json({ message: "Error fetching questions", error: error.message });
  }
};

// Like a question
const likeQuestion = async (req, res) => {
  try {
    console.log("🔹 Received Like Request for Question ID:", req.params.questionId);

    const { questionId } = req.params;
    const { userId } = req.body;

    console.log("🔹 User ID:", userId);
    
    if (!userId) {
      console.error("❌ Unauthorized: No user ID provided");
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // Find the document that contains this question
    const questionDoc = await Question.findOne({ "questions._id": questionId });

    console.log("🔍 Fetched Question Document:", questionDoc);

    if (!questionDoc) {
      console.error("❌ Question document not found for ID:", questionId);
      return res.status(404).json({ message: "Question not found" });
    }

    // Extract the specific question
    const question = questionDoc.questions.find(q => q._id.toString() === questionId);
    
    console.log("🔍 Extracted Question:", question);

    if (!question) {
      console.error("❌ Question not found inside document:", questionId);
      return res.status(404).json({ message: "Question data missing" });
    }

    const isLiked = question.likes.includes(userId);
    
    console.log("👍 Is Liked Already:", isLiked);

    // Update using $[elem] to target the right question inside the array
    const updateQuery = isLiked
      ? { $pull: { "questions.$[elem].likes": userId } }
      : { $addToSet: { "questions.$[elem].likes": userId } };

    console.log("🔄 Update Query:", updateQuery);

    const updatedDoc = await Question.findOneAndUpdate(
      { "questions._id": questionId },
      updateQuery,
      { 
        new: true,
        arrayFilters: [{ "elem._id": questionId }]
      }
    );

    console.log("✅ Updated Document:", updatedDoc);

    if (!updatedDoc) {
      console.error("❌ Failed to update like status");
      return res.status(500).json({ message: "Failed to update like status" });
    }

    // Get the updated likes count
    const updatedLikes = updatedDoc.questions.find(q => q._id.toString() === questionId).likes.length;

    console.log("🎉 Updated Likes Count:", updatedLikes);

    res.json({ message: "Like updated", likes: updatedLikes });

  } catch (error) {
    console.error("❌ Error liking question:", error);
    res.status(500).json({ message: "Error liking question", error: error.message });
  }
};

// Toggle public/private visibility of a question
const toggleVisibility = async (req, res) => {
  try {
    const { questionId } = req.params;

    const userQuestion = await Question.findOne({ "questions._id": questionId });

    if (!userQuestion) return res.status(404).json({ message: "Question not found" });

    const questionToUpdate = userQuestion.questions.id(questionId);
    questionToUpdate.isPublic = !questionToUpdate.isPublic;

    await userQuestion.save();

    res.json({
      message: `Visibility updated to ${questionToUpdate.isPublic ? "Public" : "Private"}`,
      question: questionToUpdate,
    });
  } catch (error) {
    console.error("Error toggling visibility:", error.message);
    res.status(500).json({ message: "Error toggling visibility", error: error.message });
  }
};

// Add an answer to a question
const addAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userId, username, answer } = req.body;

    if (!userId || !username || !answer) {
      return res.status(400).json({ message: "userId, username, and answer are required" });
    }

    // Find the user document that contains the question
    const userQuestion = await Question.findOne({ "questions._id": questionId });

    if (!userQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Find the specific question inside the user's questions array
    const question = userQuestion.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Add answer to the question
    question.answers.push({ userId, username, text: answer });

    await userQuestion.save();

    res.status(201).json({ message: "Answer added successfully", answers: question.answers });
  } catch (error) {
    console.error("Error adding answer:", error.message);
    res.status(500).json({ message: "Error adding answer", error: error.message });
  }
};


const getQuestionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { viewerId } = req.query;

    const userQuestions = await Question.findOne({ userId });

    if (!userQuestions) return res.status(404).json({ message: "No questions found for this user" });

    // If the viewer is the owner, show all questions. Otherwise, show only public ones.
    const filteredQuestions =
      viewerId === userId
        ? userQuestions.questions
        : userQuestions.questions.filter(q => q.isPublic);

    res.status(200).json({ userId, username: userQuestions.username, questions: filteredQuestions });
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    res.status(500).json({ message: "Error fetching questions", error: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { userId, questionId } = req.params;
    const { question, answer, tags, isPublic } = req.body;

    const userQuestions = await Question.findOne({ userId });
    if (!userQuestions) return res.status(404).json({ message: "User not found" });

    // Find the specific question in the array
    const questionToUpdate = userQuestions.questions.id(questionId);
    if (!questionToUpdate) return res.status(404).json({ message: "Question not found" });

    // Update fields
    if (question) questionToUpdate.question = question;
    if (answer) questionToUpdate.answer = answer;
    if (tags) questionToUpdate.tags = tags;
    if (typeof isPublic !== "undefined") questionToUpdate.isPublic = isPublic; // Toggle visibility

    await userQuestions.save();
    res.json({ message: "Question updated successfully", question: questionToUpdate });
  } catch (error) {
    console.error("Error updating question:", error.message);
    res.status(500).json({ message: "Error updating question", error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { userId, questionId } = req.params;

    const userQuestions = await Question.findOne({ userId });
    if (!userQuestions) return res.status(404).json({ message: "User not found" });

    // Remove the question
    const initialLength = userQuestions.questions.length;
    userQuestions.questions = userQuestions.questions.filter(q => q._id.toString() !== questionId);

    if (userQuestions.questions.length === initialLength) {
      return res.status(404).json({ message: "Question not found" });
    }

    await userQuestions.save();
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error.message);
    res.status(500).json({ message: "Error deleting question", error: error.message });
  }
};

const getTrendingQuestions = async (req, res) => {
  try {
    const questions = await Question.aggregate([
      { $unwind: "$questions" }, 
      { $match: { "questions.isPublic": true } }, 
      { $sort: { "questions.likes": -1 } }, 
      { $limit: 10 }, 
      {
        $project: { 
          _id: "$questions._id",
          question: "$questions.question",
          answer: "$questions.answer",
          likes: "$questions.likes",
          username: 1,
          userId: 1,
          tags: "$questions.tags",
          createdAt: "$questions.createdAt"
        }
      }
    ]);

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching trending questions:", error.message);
    res.status(500).json({ message: "Error fetching trending questions", error: error.message });
  }
};


const getPrivateQuestions = async (req, res) => {
  try {
    const { userId } = req.params;

    const userQuestions = await Question.findOne({ userId });

    if (!userQuestions) return res.status(404).json({ message: "No private questions found" });

    const privateQuestions = userQuestions.questions.filter(q => !q.isPublic); // Filter private questions

    res.status(200).json({ userId, username: userQuestions.username, questions: privateQuestions });
  } catch (error) {
    console.error("Error fetching private questions:", error.message);
    res.status(500).json({ message: "Error fetching private questions", error: error.message });
  }
};


const getAnswers = async (req, res) => {
  try {
    const { questionId } = req.params;

    // ✅ Ensure `questionId` is converted to ObjectId correctly
    const objectId = new mongoose.Types.ObjectId(questionId);

    // ✅ Find the document that contains the question inside `questions` array
    const parentDoc = await Question.findOne({ "questions._id": objectId });

    if (!parentDoc) {
      return res.status(404).json({ message: "Question not found" });
    }

    // ✅ Extract the specific question from the array
    const question = parentDoc.questions.find(q => q._id.equals(objectId));

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ answers: question.answers || [] });
  } catch (error) {
    console.error("Error fetching answers:", error.message);
    res.status(500).json({ message: "Error fetching answers", error: error.message });
  }
};


const getAnswersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all documents where any question contains an answer by this user
    const matchingDocs = await Question.find({ "questions.answers.userId": userId });

    let userAnswers = [];

    matchingDocs.forEach(doc => {
      doc.questions.forEach(question => {
        const matchingAnswers = question.answers.filter(answer => answer.userId.toString() === userId);
        matchingAnswers.forEach(answer => {
          userAnswers.push({
            answerId: answer._id,
            answerText: answer.text,
            answerCreatedAt: answer.createdAt,
            questionId: question._id,
            questionText: question.question,
            questionTags: question.tags,
            questionAskedById: doc.userId,
            questionAskedByUsername: doc.username,
            questionCreatedAt: question.createdAt,
          });
        });
      });
    });

    res.status(200).json({ answers: userAnswers });
  } catch (error) {
    console.error("Error fetching user's answers:", error.message);
    res.status(500).json({ message: "Error fetching answers", error: error.message });
  }
};



module.exports = {
  createQuestion,
  getAllQuestions,
  likeQuestion,
  toggleVisibility,
  addAnswer,
  getQuestionsByUserId,
  updateQuestion,
  deleteQuestion,
  getTrendingQuestions,
  getPrivateQuestions,
  getAnswers,
  getAnswersByUserId,
};
