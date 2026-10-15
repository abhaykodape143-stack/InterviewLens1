import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  answer: String,
  score: Number, // 0-10
  feedback: String,
  idealPoints: [String],
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true },
    level: { type: String, enum: ['fresher', 'junior', 'mid', 'senior'], default: 'fresher' },
    type: { type: String, enum: ['technical', 'behavioral', 'mixed'], default: 'technical' },
    resumeText: { type: String, default: '' },
    totalQuestions: { type: Number, default: 5, min: 1, max: 10 },
    questions: [questionSchema],
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    overallScore: Number, // 0-100
    report: {
      summary: String,
      strengths: [String],
      weaknesses: [String],
      nextSteps: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
