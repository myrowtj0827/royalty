const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const Users = mongoose.model("users");
const {SECRET_KEY} = require("../config");
const validateLoginInput = require("../validation/login");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET_KEY;

module.exports = async passport => {
    await passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            // Form validation
            const {msg, isValid} = validateLoginInput(jwt_payload);
            // Check validation
            if(!isValid){
                return done(msg, false);
            }
            Users.findById(jwt_payload.id).then(user => {
                if(user){
                    console.log(user, " ============= ")
                    return done(null, user);
                }
                return done(null, false);
            }).catch(err => console.log(err));
        })
    );
};
