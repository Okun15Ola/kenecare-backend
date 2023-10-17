const JwtStrategy = require("passport-jwt").Strategy,
const ExtractJwt = require("passport-jwt").ExtractJwt;
const {patientJwtSecret} = require("../config/default.config")
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: patientJwtSecret,
  issuer: "auth.kenecare.com",
  audience:"kenecare.com"
};
const {getUserById} = require("../services/users.service")
module.exports = {
  authenticate: (passport) => {
    
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      await getUserById({ id: jwt_payload.sub }, (err, user) =>  {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    })
  );
  }
}
