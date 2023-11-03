const validationMessages = {
    required: 'The :attribute field is required.',
    integer: 'The :attribute must be an integer.',
    string: 'The :attribute must be a string.',
    array: 'The :attribute must be an array.',
    boolean: 'The :attribute field must be true or false.',
    email: 'The :attribute must be a valid email address.',
    in: 'The selected :attribute is invalid.',
    exists: 'The selected :attribute is invalid.',
    unique: 'The :attribute has already been taken.',
    min: {
        array: 'The :attribute must have at least :min items.',
        file: 'The :attribute must be at least :min kilobytes.',
        numeric: 'The :attribute must be at least :min.',
        string: 'The :attribute must be at least :min characters.',
    },
    max: {
        array: 'The :attribute must not have more than :max items.',
        file: 'The :attribute must not be greater than :max kilobytes.',
        numeric: 'The :attribute must not be greater than :max.',
        string: 'The :attribute must not be greater than :max characters.',
    }
};

const validation = (key = null, value = null, other = null) => {
    let keyArr = key.split('.');

    let message = validationMessages[keyArr[0]];

    if (keyArr.length === 2) {
        message = validationMessages[keyArr[0]][keyArr[1]];
    }

    message = message.replace(':attribute', value);

    if (other !== null) {
        switch (keyArr[0]) {
            case 'min':
                message = message.replace(':min', other);
                break;
            case 'max':
                message = message.replace(':max', other);
                break;
            default:
                break;
        }
    }

    return message;
};

module.exports = { validation };

