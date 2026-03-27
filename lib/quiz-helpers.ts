export function checkAnswer(questionType: string, options: any, selectedAnswer: string): boolean {
  switch (questionType) {
    case "MULTIPLE_CHOICE": {
      const opts = options as Array<{ text: string; isCorrect: boolean }>
      const correctOption = opts.find(opt => opt.isCorrect)
      return correctOption?.text === selectedAnswer
    }

    case "TRUE_FALSE": {
      const opts = options as { correctAnswer: boolean }
      return String(opts.correctAnswer) === selectedAnswer
    }

    case "SHORT_ANSWER": {
      const opts = options as { acceptedAnswers: string[] }
      // Case-insensitive comparison, trim whitespace
      const normalizedAnswer = selectedAnswer.trim().toLowerCase()
      return opts.acceptedAnswers.some(
        accepted => accepted.trim().toLowerCase() === normalizedAnswer
      )
    }

    default:
      return false
  }
}
