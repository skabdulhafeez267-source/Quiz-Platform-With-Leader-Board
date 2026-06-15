const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: {
      type: [optionSchema],
      validate: {
        validator: (arr) => arr.length >= 2 && arr.length <= 6,
        message: 'Each question must have between 2 and 6 options',
      },
    },
    correctOptionIndex: { type: Number, required: true },
    points: { type: Number, default: 10 },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    durationMinutes: { type: Number, default: 10 },
    questions: { type: [questionSchema], required: true },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

quizSchema.virtual('totalPoints').get(function () {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);
