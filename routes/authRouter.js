const expres = require('express');
const auth = expres.Router();

const authController = require('../controllers/authController');

auth.get('/sign-up', authController.signUp);

module.exports = auth;