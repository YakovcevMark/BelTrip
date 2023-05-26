

const middlewareObj = {};

// middlewareObj.checkCampgroundOwnership = function(req, res, next) {
//     if(req.isAuthenticated()) {
//         Campground.findById(req.params.id)
//             .then(foundCampground => {
//                 if (foundCampground.author.id.equals(req.user._id)){
//                     next();
//                 } else {
//                     req.flash("error", "You don't have permission to do that");
//                     res.redirect("back");
//                 }
//             })
//             .catch(err => {
//                 console.log(err);
//                 req.flash("error", "Campground not found");
//                 res.redirect("back");
//             });
//     } else {
//         req.flash("error", "You need to be logged in to do that");
//         res.redirect("back");
//     }
// }
// middlewareObj.checkCommentOwnership = function (req, res, next) {
//     if(req.isAuthenticated()) {
//         Comment.findById(req.params.comment_id)
//             .then(foundComment => {
//                 if (foundComment.author.id.equals(req.user._id)) {
//                     next();
//                 } else {
//                     req.flash("error", "You don't have permission to do that");
//                     res.redirect("back");
//                 }
//             })
//             .catch(err => {
//                 console.log(err);
//                 res.redirect("back");
//             });
//     } else {
//         req.flash("error", "You need to be logged in to do that");
//         res.redirect("back");
//     }
// }

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Сперва войдите или зарегестрируйте аккаунт");
    res.redirect("/login");
}
module.exports = middlewareObj;