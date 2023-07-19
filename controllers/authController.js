const asyncHandler = require('express-async-handler');
const validator = require('../plugins/validator');
const responses = require('../plugins/responses');

const signUp = asyncHandler(async (req, res) => {
    let data;
    
    try {
        await validator.all(req.query, {
            email: 'required|email|unique:users,email',
            password: 'required|string',
            username: 'nullable|string',
            phone: 'nullable|string'
        });

        if (validator.fails()) {
            res.status(400).send(responses.error(validator.errors(), 400));
            return;
        }

        data = responses.success();
    } catch (error) {
        data = responses.error(error);
    }

    res.status(200).send(data);
});

module.exports = { signUp };
