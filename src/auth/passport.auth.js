const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const {patientJwtSecret} = require("../config/default.config")
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: patientJwtSecret,
  issuer: "auth.kenecare.com",
  audience:"kenecare.com"
};
const {getUserById} = require("../services/users.service")
const authenticate = passport => {
   passport.use(
    new JwtStrategy(opts, async (userId, done) => {
      const user = await getUserById(userId);
      if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
    })
  );
}

module.export = authenticate
