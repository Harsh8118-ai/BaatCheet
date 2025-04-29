const { Schema, model } = require("mongoose");

const answerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const questionSchema = new Schema(
  {
    question: { type: String, required: true },
    tags: { type: [String], default: [] },
    likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    isPublic: { type: Boolean, default: true },
    answers: [answerSchema],
  },
  { timestamps: true } 
);

const userQuestionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const Question = model("Question", userQuestionSchema);

module.exports = Question;
