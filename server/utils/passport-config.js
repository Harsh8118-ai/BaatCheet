const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/user-model");
const OAuthUser = require("../models/oauth-user-model");
const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_BACKEND_URL}/api/oauth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            authProvider: "google",
          });
          await user.save();
        }

        let oauthUser = await OAuthUser.findOne({ providerId: profile.id });

        if (!oauthUser) {
          oauthUser = new OAuthUser({
            userId: user._id,
            provider: "google",
            providerId: profile.id,
          });
          await oauthUser.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_BACKEND_URL}/api/oauth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = profile.emails && profile.emails[0]?.value;
        if (!email) {
          return done(new Error("Email not provided by GitHub"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            username: profile.username || "GitHub User",
            email,
            authProvider: "github",
          });
          await user.save();
        }

        let oauthUser = await OAuthUser.findOne({ providerId: profile.id });

        if (!oauthUser) {
          oauthUser = new OAuthUser({
            userId: user._id,
            provider: "github",
            providerId: profile.id,
          });
          await oauthUser.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_BACKEND_URL}/api/oauth/facebook/callback`,
      profileFields: ["id", "emails", "name", "displayName", "picture.type(large)"], // ensures we get email + name
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const facebookId = profile.id;
        const email = profile.emails && profile.emails[0]?.value;
        const username =
          profile.displayName ||
          `${profile.name.givenName || ""}${profile.name.familyName || ""}`;

        // Step 1: Check if OAuthUser exists
        let oauthUser = await OAuthUser.findOne({ providerId: facebookId });
        let user;

        if (oauthUser) {
          user = await User.findById(oauthUser.userId);
        } else {
          // Step 2: If no oauthUser, check if a User with this email exists
          if (email) {
            user = await User.findOne({ email });
          }

          // Step 3: If no user, create a new one
          if (!user) {
            let uniqueUsername = username.replace(/\s+/g, "").toLowerCase();
            let count = 1;
            while (await User.findOne({ username: uniqueUsername })) {
              uniqueUsername = `${username}${count++}`;
            }

            user = new User({
              username: uniqueUsername,
              email,
              authProvider: "facebook",
            });
            await user.save();
          }

          // Step 4: Create OAuthUser entry
          oauthUser = new OAuthUser({
            userId: user._id,
            provider: "facebook",
            providerId: facebookId,
          });
          await oauthUser.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
