const express = require('express');
const router = express.Router();
const quizzesQueries = require('../db/queries/quizzes');
const quizAttemptsQueries = require('../db/queries/quiz_attempts');


router.get('/update/:quiz_id', (req, res) => {
  const quizId = req.params.quiz_id;
  quizzesQueries.getQuizzesQuestionsById(quizId)
    .then(questions => {
      res.json({ questions });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

// GET QUIZ ATTEMPT DATA BY QUIZ ID
router.get('/data/:quiz_id', (req, res) => {
  const quizId = req.params.quiz_id;
  quizAttemptsQueries.getQuizAttemptDataByQuizId(quizId)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

module.exports = router;
