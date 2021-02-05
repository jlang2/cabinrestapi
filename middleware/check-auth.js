const jwt = require('jsonwebtoken');

checkLogin = () => (req, res, next) => {
        
    if(req.session.loggedIn) {
        try {
            const decoded = jwt.verify(req.session.token, "secret");
        
            //om vi lyckas verifiera JWT så anropar vi nästa call back funktion (byter i praktiken
            //att vi går vidare till funktionen som sparar ett nytt rum i databasen)
            next();
        } catch(error) {
            res.status(401).json({
                message: "Authentication failed."
            });
        }
    } else {
        res.status(403).json({
            message: "User not logged in."
        })
    }
};

module.exports = { checkLogin }