function errorHandler(err, req, res, next) {
/*
    if (err.name === 'UnauthorizedError') {
        // jwt authentication error 
        return res.status(401).json({message:" Faça seu login!"})
    }

    if (err.name === 'ValidationError') {
        // validation erro
        return res.status(401).json({message: err})
    }

    // default to 500 server error
    return res.status(500).json(err);
    next()*/

    if (err.name === "UnauthorizedError") {
        res.status(401).json({messsage: err});
      }
    
    if (err.name === 'ValidationError') {
        // validation erro
        return res.status(401).json({message: err})
    } else {
        next(err);
      }

    return res.status(500).json(err);
}

module.exports = errorHandler;