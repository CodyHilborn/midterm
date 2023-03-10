const express = require('express');
const { body, validationResult } = require('express-validator');


const router = express.Router();
const quizzesQueries = require('../db/queries/quizzes');
const quizQuestionsQueries = require('../db/queries/quiz_questions');

router.use((req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect('/');
  }
  next();
});


// RENDER SHOW ALL PUBLIC QUIZZES PAGE
router.get('/', (req, res) => {
  const userId = req.session.user_id;
  quizzesQueries.getPublicQuizzes()
    .then((quizzes) => {
      const userName = req.session.user_name;
      const templateVars = {
        quizzes,
        userName,
        userId
      };

      res.render('quizzes', templateVars);
    });
});



// RENDER CREATE NEW QUIZ PAGE
router.get('/new', (req, res) => {
  const userId = req.session.user_id;
  const userName = req.session.user_name;

  const templateVars = {
    userId,
    userName
  };
  res.render('quizzes_new', templateVars);
});



// RENDER UPDATE QUIZ PAGE
router.get('/update/:quiz_id', (req, res) => {
  const userId = req.session.user_id;
  const userName = req.session.user_name;
  const quizId = req.params.quiz_id;

  quizzesQueries.getQuizzesQuestionsById(quizId)
    .then(response => {
      if (response[0].creator_id !== userId) {
        return res.status(400).render('errorHandle', { errorMsg: 'SORRY YOU HAVE NO GOOD AUTHENTICATION TO UPDATE THE QUIZ. ' });
      }
      const templateVars = {
        response,
        userId,
        userName
      };
      res.render('quizzes_update', templateVars);
    });
});



// POST UPDATE QUIZ AND ALSO QUIZ QUESTIONS
// USER INPUT SANITIZATION
router.post('/update/:quiz_id',
  body('*').escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const templateVars = {
        errorMsg: errors.array()[0].msg
      };
      return res.status(400).render('errorHandle', templateVars);
    }

    for (const key in req.body) {
      if (req.body[key] === '') {
        if (key.startsWith('question_id')) {
          continue;
        }
        const templateVars = { errorMsg: 'Please Fill Out All Questions' };
        return res.render('errorHandle', templateVars);
      }
    }

    let numOfQuestionsBefore = 0;
    const quizId = req.params.quiz_id;
    const userId = req.session.user_id;
    quizzesQueries.getQuizzesQuestionsById(quizId)
      .then((quizQuestions) => {
        numOfQuestionsBefore = quizQuestions[0].question_number;
        if (quizQuestions[0].creator_id !== userId) {
          return res.render('errorHandle', { errorMsg: 'SORRY YOU HAVE NO GOOD AUTHENTICATION TO UPDATE THE QUIZ. ' });
        }
      });

    let { title, description, isPublic, numOfQuestions } = req.body;
    const quiz = { title, description, isPublic, numOfQuestions, id: quizId };
    quizzesQueries.updateQuizByObj(quiz)
      .then(() => {

        for (let i = 1; i <= numOfQuestionsBefore; i++) {

          const questionText = req.body[`question${i}`];
          const answerText = req.body[`answer${i}`];
          const questionId = Number(req.body[`question_id${i}`]);

          const question = { questionId, questionText, answerText };
          quizQuestionsQueries.updateQuesFromQuesObj(question)
            .then(() => console.log('Update data to questions'));

        }
        if (numOfQuestions > numOfQuestionsBefore) {

          for (let j = numOfQuestionsBefore + 1; j <= numOfQuestions; j++) {

            const questionText = req.body[`question${j}`];
            const answerText = req.body[`answer${j}`];

            const question = { quizId, questionText, answerText };

            quizQuestionsQueries.createQuesFromQuesObj(question)
              .then(() => console.log('Insert data to questions'));
          }
        }

        return res.redirect('/');
      });
  });



// RENDER INDIVIDUAL QUIZ PAGE
router.get('/:quiz_id', (req, res) => {
  const quizId = req.params.quiz_id;
  quizzesQueries.getQuizzesQuestionsById(quizId)
    .then((questions) => {
      const userName = req.session.user_name;
      const userId = req.session.user_id;
      const templateVars = {
        questions,
        userName,
        userId
      };
      res.render('quizzes_show', templateVars);
    });
});




// POST CREATE NEW QUIZ PAGE
// USER INPUT SANITIZATION
router.post('/new',
  body('*').escape().notEmpty(),
  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const templateVars = {
        errorMsg: errors.array()[0].msg
      };

      return res.status(400).render('errorHandle', templateVars);
    }

    const userId = req.session.user_id;
    const { title, description, isPublic, numOfQuestions } = req.body;

    const quiz = { userId, title, description, isPublic, numOfQuestions };

    quizzesQueries.createNewQuizzes(quiz)
      .then((quizRes) => {

        const quizId = quizRes.id;

        // LOOP THROUGH REQ.BODY, GRAB ALL THE VALUES.
        for (let i = 1; i <= numOfQuestions; i++) {
          const questionText = req.body[`question${i}`];
          const answerText = req.body[`answer${i}`];

          const question = { quizId, questionText, answerText };

          quizQuestionsQueries.createQuesFromQuesObj(question)
            .then(() => console.log('Insert data to questions'));
        }

        return res.redirect('/');
      });
  });


module.exports = router;
