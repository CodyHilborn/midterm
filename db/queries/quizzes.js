const db = require('../connection');


// GET ALL PUBLIC QUIZZES + NAME OF CREATOR
const getPublicQuizzes = () => {

  const queryTemplate = `
    SELECT quizzes.*, users.name as creator
    FROM quizzes
    JOIN users ON creator_id = users.id
    WHERE is_public IS TRUE
    ORDER BY quizzes.id DESC;
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
    SELECT question_text as question, answer_text as answer, quizzes.id as quiz_id, quizzes.title as title, quizzes.description as description, quizzes.is_public as is_public, quizzes.num_of_questions as question_number, users.name as creator, users.id as creator_id,  quiz_questions.id as question_id
    FROM quiz_questions
    JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
    JOIN users ON creator_id = users.id
    WHERE quizzes.id = $1
    ORDER BY quiz_questions.id
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

const updateQuizByObj = function(quiz) {
  const queryTemplate = `
    UPDATE quizzes
    SET title = $1,
    description = $2,
    is_public = $3,
    num_of_questions = $4
    WHERE id = $5
    RETURNING *
  ;
  `;
  const { title, description, isPublic, numOfQuestions, id } = quiz;

  const sqlParams = [title, description, isPublic, numOfQuestions, id];

  return db.query(queryTemplate, sqlParams)
    .then((res) => res.rows[0])
    .catch(err => console.error(err.message));
};



module.exports = { getPublicQuizzes, getQuizzesQuestionsById, createNewQuizzes, updateQuizByObj };
