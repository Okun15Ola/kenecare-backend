const {decrypt, addSecondsInSpecificTime, currentDt} = require('../controllers/api/helpers/common');
var jwtVerification = {
    verifyToken: (req, res, next) => {
        let token = req.headers["x-access-token"];
        if (!token) {
            return res.status(403).send({
                success: false,
                message: "No token provided!"
            });
        }
        /* let unqKey = req.headers["x-unq-key"];
        if (!unqKey) {
            return res.status(403).send({
                success: false,
                message: "Missing Authentication!"
            });
        }
        var dateTime = decrypt(unqKey);
        // console.log('unqKey',dateTime);
        var expDateTime = addSecondsInSpecificTime(10,dateTime);
        // console.log('expDateTime',expDateTime);
        var currentDateTime = currentDt();
        // console.log('currentDateTime',currentDateTime);
        
        if(currentDateTime > expDateTime){
            return res.status(403).send({
                success: false,
                message: "Invalid authentication!"
            });
        } */

        jwt.verify(token, jwtConfig.secret, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    success: false,
                    message: err.message
                });
            }
            req.body.loggedInUserId = decoded.id;
            next();
        });
    }
};
module.exports = jwtVerification;