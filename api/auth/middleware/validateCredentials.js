const validateCredentials = (req, res, next) => {
    const {username, password} = req.body;

    if(!username) {
        return res.status(401).json({
            data:'Username must not be empty'
        })
    }

    if(!password) {
        return res.status(401).json({
            data:'Password must not be empty'
        })
    }
    next();
}

module.exports = validateCredentials;