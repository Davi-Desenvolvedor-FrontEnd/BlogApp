export function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        req.flash('error_msg', 'Você deve estar logado para usar o site')
        res.redirect('/')
    }
}