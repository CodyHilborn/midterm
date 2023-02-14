const express = require('express');
const router = express.Router();
const quizzesQueries = require('../db/queries/quizzes');
const quizAttemptsQueries = require('../db/queries/quiz_attempts');

// quizAttempt post create new attempt rows
router.post('/?', (req, res) => {
  const userId = req.cookies.user_id;
  const quizId = req.query.quizid;
  let score = 0;
  quizzesQueries.getQuizzesQuestionsById(quizId)
    .then(questions => {
      const inputAnswer = Object.values(req.body);
      questions.forEach((question, index) => {
        console.log(question.answer, question.question_id);
        if (question.answer.toLowerCase() === inputAnswer[index].toLowerCase()) {
          score++;
        }
      });

      const attempt = {quizId, userId, score};
      quizAttemptsQueries.createAttempt(attempt)
        .then(response => {
          console.log(response);
          res.redirect(`/quizAttempt/${response.id}`);
        });
    });

});



// quizAttempt/
router.get('/:attempt_id', (req, res) => {
  const attemptID = req.params.attempt_id;

  quizAttemptsQueries.getQuizAttemptById(attemptID)
    .then(attempt => {
      return res.render('quiz_attempt', { attempt });
    });

});

module.exports = router;

