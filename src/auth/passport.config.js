const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const { patientJwtSecret } = require("../config/default.config");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: patientJwtSecret,
  issuer: "auth.kenecare.com",
  audience: "kenecare.com",
};
const { getUserById } = require("../services/users.service");

module.exports = {
  authenticate: (passport) => {
    passport.use(
      new JwtStrategy(opts, async (payload, done) => {
        await getUserById({ id: payload.sub }, (err, user) => {
          if (err) {
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          }
          return done(null, false);
          // or you could create a new account
        });
      }),
    );
  },
};
