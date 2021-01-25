module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error
        return res.status(400).json({ message: err });
    }else if (err.name === 'ValidationError') {
        // mongoose validation error
        return res.status(400).json({ message: err.message });
    }else if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ 
            status:false,
            code:'unauthorized',
            errors: {token:"Invalid token"}
        });
    } else if (typeof err != "undefined") {
        //return res.status(200).json(err);
        return res.status(200).json(err);
    }
    // default to 500 server error
    return res.status(500).json(err);
}