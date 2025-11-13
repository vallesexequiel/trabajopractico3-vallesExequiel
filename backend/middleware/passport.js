import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import connection from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const [rows] = await connection.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [jwt_payload.id]
      );

      if (rows.length === 0) {
        return done(null, false);
      }

      return done(null, rows[0]);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
