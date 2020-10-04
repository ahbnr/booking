import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';
import { User } from '../models/user.model';

// FIXME: Load proper secret from somewhere else
export const jwtSecret = 'secret';

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret',
  // FIXME: Consider the other validation functionalities provided JWT
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await User.findByPk(jwtPayload.username);

      if (user != null) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (e) {
      done(e, false);
    }
  })
);

export const initializedPassport = passport;

export const authHandler = initializedPassport.authenticate('jwt', {
  session: false,
});
