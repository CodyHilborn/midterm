const db = require('../connection');


// GET ALL PUBLIC QUIZZES + NAME OF CREATOR
const getPublicQuizzes = () => {

  const queryTemplate = `
    SELECT quizzes.*, users.name as creator
    FROM quizzes
    JOIN users ON creator_id = users.id
    WHERE is_public IS TRUE;
  `;
  return db.query(queryTemplate)
    .then(data => {
      return data.rows;
    })
    .catch(err => console.error(err.message));
};



// GET ALL QUIZ QUESTIONS BY QUIZ_ID + NAME OF CREATOR
const getQuizzesQuestionsById = (id) => {
  const queryTemplate = `
    SELECT question_text as question, answer_text as answer, quizzes.title as title, users.name as creator
    FROM quiz_questions
    JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
    JOIN users ON creator_id = users.id
    WHERE quizzes.id = $1
  ;
  `;
  const sqlParams = [id];

  return db.query(queryTemplate, sqlParams)
    .then((res) => {
      return res.rows;
    })
    .catch(err => console.error(err.message));

};


// Insert new quiz into quizzes database
// Default number of questions as 10, and is_public as true FOR NOW.
const createNewQuizzes = (quiz) => {
  const queryTemplate = `
    INSERT INTO quizzes (creator_id, title, description, is_public, num_of_questions)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *
  ;
  `;

  const { userId, title, description, isPublic, numOfQuestions } = quiz;

  const sqlParams = [userId, title, description, isPublic, numOfQuestions];

  return db.query(queryTemplate, sqlParams)
    .then((res) => {
      return res.rows[0];
    })
    .catch(err => console.error(err.message));
};


const getQuizAttemptById = (quizAttemptId) => {
  const queryTemplate = `
    SELECT quiz_attempts.*, users.name as name, quizzes.title as quiz_title
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
    });

};

module.exports = { getPublicQuizzes, getQuizzesQuestionsById, createNewQuizzes, getQuizAttemptById};
