const   User        = require("../models/user"),
        passport    = require("passport"),
        express     = require("express"),
        router      = express.Router();

router.get("/", (req, res) => {
    res.render("landing");
});
//register form route
router.get("/register", (req, res) => {
    res.render("register");
});
// handle sign up logic
router.post("/register", (req, res) => {
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", `Добро пожаловать, ${user.username}`);
            res.redirect("/trips")
        });
    });
});
// show login form
router.get("/login", (req, res) => {
    res.render("login", );
});
// handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/trips",
        failureRedirect: "/login",
    }), (req, res) => {
    req.flash("success", `Добро пожаловать, ${user.username}`);
});
// add logout route
router.get("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err){
            console.log(err);
            return;
        }
        req.flash("success", "Вы вышли из аккаунта");
        res.redirect("/trips");
    });
});



module.exports = router;