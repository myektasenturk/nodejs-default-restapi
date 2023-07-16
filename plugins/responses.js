const success = (res = null) => {
    if (res === null) {
        return {
            status: 200,
            success: true
        };
    } else {
        return {
            status: 200,
            success: true,
            result: res
        };
    }
};

const error = (err = null, status = 200) => {
    if (err === null) {
        return {
            status: status,
            success: false
        };
    } else {
        return {
            status: status,
            success: false,
            message: err
        };
    }
};

const responses = {
    success,
    error
};

module.exports = responses;