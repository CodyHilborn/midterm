const db = require('../connection');


// GET ONE QUIZ ATTEMPT BY ATTEMPT ID
const getQuizAttemptById = (quizAttemptId) => {
  const queryTemplate = `
    SELECT quiz_attempts.*, users.name as name, quizzes.title as quiz_title, quizzes.num_of_questions as num_of_questions
    FROM quiz_attempts
    JOIN users ON user_id = users.id
    JOIN quizzes ON quiz_id = quizzes.id
    WHERE quiz_attempts.id = $1
  ;
  `;
  const sqlParams = [quizAttemptId];

  return db.query(queryTemplate, sqlParams)
    .then((data) => {
      return data.rows[0];
    })
    .catch(err => console.error(err.message));

};

// GET QUIZ DATA BY QUIZ ID
const getQuizAttemptDataByQuizId = (quizId) => {
  const queryTemplate = `
    SELECT quiz_id, COUNT(quiz_attempts.*) as num_of_attempts, ROUND(AVG(score), 2) as average_score, quizzes.title as quiz_title
    FROM quiz_attempts
    JOIN quizzes on quiz_id = quizzes.id
    WHERE quiz_id = $1
    GROUP BY quiz_attempts.quiz_id, quiz_title
    ;
  `;
  const sqlParams = [quizId];

  return db.query(queryTemplate, sqlParams)
    .then((data) => {
      return data.rows[0];
    })
    .catch(err => console.error(err.message));

};


const createAttempt = function(attempt) {
  const newAttemptTemplate = `
    INSERT INTO quiz_attempts (quiz_id, user_id, score)
    VALUES
    ($1, $2, $3)
    RETURNING *
  `;

  const { quizId, userId, score } = attempt;

  const sqlParams = [quizId, userId, score];

  return db.query(newAttemptTemplate, sqlParams)
    .then((res) => {
      return res.rows[0];
    })
    .catch(err => console.error(err.message));
};

module.exports = { createAttempt, getQuizAttemptById, getQuizAttemptDataByQuizId };
