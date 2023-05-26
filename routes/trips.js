const   express     = require("express"),
        router      = express.Router(),
        Trip        = require("../models/trip"),
        User        = require("../models/user"),
        middleware  = require("../middleware/index");

router.get("/new", (req, res) => {
    res.render("trips/new");
});
router.get("/trips/:id", middleware.isLoggedIn, (req, res) => {
    Trip.findById(req.params.id)
        .then(trip => {
            res.render("trips/show", {trip: trip})
        })
        .catch(err => console.log(err));
});

router.post("/trips", middleware.isLoggedIn, (req, res) => {
    User.findById(req.user._id)
        .then(user => {
            Trip.create({
                name: req.body.name,
                description: req.body.description,
                googleRequest: req.body.googleRequest,

            })
                .then(trip => {
                    trip.save();
                    user.trips.push(trip);
                    user.save();
                    req.flash("success", "Маршрут добавлен!");
                    res.redirect(`/trips`)
                })
        })
        .catch(err => {
            console.log(err);
        });
});
router.get("/trips", middleware.isLoggedIn,(req, res) => {
   User.findById(req.user._id).populate("trips").exec()
        .then(user => {
            res.render("trips/trips", {user: user})
        })
        .catch(err => console.log(err));
});
router.delete("/trips/:id", middleware.isLoggedIn, (req, res) => {
    Trip.findByIdAndDelete(req.params.id)
        .catch(err => console.log(err));
    req.flash("success", `Маршрут успешно удален!`)
    res.redirect("/trips");
});
module.exports = router;