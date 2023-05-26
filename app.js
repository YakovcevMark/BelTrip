const   express         = require("express"),
        bodyParser      = require("body-parser"),
        mongoose        = require('mongoose'),
        passport        = require("passport"),
        LocalStrategy   = require("passport-local"),
        flash           = require("connect-flash"),
        methodOvveride  = require("method-override"),
        Trip            = require("./models/trip"),
        User            = require("./models/user"),
        seedDB          = require("./seeds"),
        app             = express();


const indexRoutes = require("./routes/index"),
      tripRoutes = require("./routes/trips");



mongoose.connect('mongodb://127.0.0.1:27017/bel_trip')
    .then(() => console.log("DB ok"))
    .catch((err) => console.log("DB err", err));

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));



app.set('view engine', "ejs");

app.use(express.static(__dirname + "/public"));

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use(methodOvveride("_method"));



passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(indexRoutes);
app.use(tripRoutes);





app.listen(3000, () => {
    console.log("The Bel_Trip Server Has Started");
});