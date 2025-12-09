import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { getDB } from "../src/db.js";

const strategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    const db = getDB();

    try {
      const user = await db.collection("users").findOne({ where: { email } });
      if (!user) {
        return done(null, false, { message: "Incorrect email." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const db = getDB();
  try {
    const user = await db.collection("users").findOne({ where: { _id: id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
