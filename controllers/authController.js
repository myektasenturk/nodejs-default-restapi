const asyncHandler = require('express-async-handler');
const validator = require('../plugins/validator');

const signUp = asyncHandler(async (req, res) => {
    let data = {};
    try {
        await validator.all(req.query, {
            email: 'required|email|unique:users,email',
            password: 'required|string',
            username: 'nullable|string',
            phone: 'nullable|string'
        });

        if (validator.fails()) {
            data = {
                status: 400,
                success: false,
                message: validator.errors()
            };

            res.status(400).send(data);
            return;
        }
    } catch (error) {
        data = {
            status: 200,
            success: false,
            message: error
        };

        res.status(200).send(data);
        return;
    }

    res.send(data);
});

module.exports = { signUp };
