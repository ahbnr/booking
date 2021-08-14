import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';
import { User } from '../models/user.model';
import { Request, Response, NextFunction } from 'express';
import { randomString } from 'secure-random-password';
import * as fs from 'fs';

function getJwtSecret(): string {
  const jwtSecretPath = 'jwt-secret';
  let jwtSecret: string;
  if (!fs.existsSync(jwtSecretPath)) {
    jwtSecret = randomString({ length: 64 });
    fs.writeFileSync(jwtSecretPath, jwtSecret, 'utf8');
    console.log('Saved new jwt secret to disk.');
  } else {
    jwtSecret = fs.readFileSync(jwtSecretPath, 'utf8').toString();
    console.log('Retrieved jwt secret from disk.');
  }

  return jwtSecret;
}

export const jwtSecret = getJwtSecret();

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
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

declare module 'express-serve-static-core' {
  export interface Request {
    authenticated?: boolean;
  }
}

export function optionalAuthHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  initializedPassport.authenticate(
    'jwt',
    {
      session: false,
    },
    (err, user, _) => {
      req.user = user;
      req.authenticated = !!user;
      next();
    }
  )(req, res, next);
}
