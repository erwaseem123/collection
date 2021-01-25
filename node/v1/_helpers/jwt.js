const expressJwt = require('express-jwt');
const config = require('../config.json');
const userService = require('../users/user.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            '/users/authenticate',
            '/users/register',
            '/users/verifyemail',
            '/auth/forgot',
            '/auth/password',
            '/auth/login',
            '/auth/reset',
            '/auth/signup',
            '/contact',
            '/information/:id',
            '/',
            '/products/',
            /^\/products\/find\/.*/, ,
            /^\/general\/.*/,

        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
};