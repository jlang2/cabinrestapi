
//DEN HÄR KÄLLKODSFILEN FUNGERAR SOM REQUEST-LISTENER, 
//DVS. ALLA INKOMMANDE REQUESTS TILL SERVERN STYRS HIT
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const cabinRoutes = require('./routes/cabins');
const advertRoutes = require('./routes/adverts');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');

//Sätter upp förbindelsen till databasen
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://****:****@cluster0.ytgdr.azure.mongodb.net/Cluster0?retryWrites=true&w=majority');

app.use(morgan('dev')); //Alla inkommande request loggas på konsolen

app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json()); //Parsar automatiskt alla inkommande JSON-objekt.

app.use(session({ //session för inloggning
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//routes
app.use('/cabins', cabinRoutes);
app.use('/adverts', advertRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);

//Om en inkommande request riktas mot en resurs som inte finns
app.use((req, res, next) => {
    //Skapar ett nytt Error-objekt
    const error = new Error("Requested resource not found.");
    error.status = 404;
    //Skickar error vidare till nästa app.use
    next(error);
});

//Denna metod triggas av vilket som helst fel som uppstår
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status,
        error: error.message
    });
});

module.exports = app;