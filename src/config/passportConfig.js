
import passport from "passport";
import * as local from "passport-local";
import GithubStrategy from "passport-github2";
import UsersDBManager from "../dao/dbManagers/UsersDBManager.js";
import { config } from "dotenv";
import createHash from "../utils/bcrypt/bryptCreateHash.js";
import useValidPassword from "../utils/bcrypt/bryptUseValidPassword.js";
const DBUsersManager = new UsersDBManager();

config();
const ghClientId = process.env.GHCLIENTID
const ghClientSecret = process.env.GHCLIENTSECRET

const LocalStrategy = local.Strategy

const initializePassport = () => {
  passport.use(
    'register',
    new LocalStrategy(
      { passReqToCallback: true, usernameField: 'email' },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, email } = req.body
          const user = await DBUsersManager.getUserByEmail({ email })
          if (user) {
            console.log('Este usuario ya se encuentra registrado previamente')
            return done(null, false)
          }

          const newUserInfo = {
            first_name,
            last_name,
            email,
            password: createHash(password),
          }

          const newUser = await DBUsersManager.addUser(newUserInfo)

          return done(null, newUser)
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'email' },
      async (username, password, done) => {
        try {
          const user = await DBUsersManager.getUserByEmail({ email: username })
          if (!user) {
            console.log('Bad request')
            return done(null, false)
          }

          if (!useValidPassword(user, password)) {
            console.log('Bad request')
            done(null, false)
          }

          return done(null, user)
        } catch (error) {
          done(error)
        }
      }
    )
  )

  passport.use(
    'github',
    new GithubStrategy(
      {
        clientID: ghClientId,
        clientSecret: ghClientSecret,
        callbackURL: "http://localhost:8080/api/sessions/github-auth",
      },
      async (accessToken, RefreshToken, profile, done) => {
        try {
          const { id, login, name, email } = profile._json

          const user = await DBUsersManager.getUserByEmail(email)
          if (!user) {
            const newUserInfo = {
              first_name: name,
              email,
              githubId: id,
              githubUsername: login,
            }

            const newUser = await DBUsersManager.addUser(newUserInfo)
            return done(null, newUser)
          }

          return done(null, user)
        } catch (error) {
          console.log(error)
          done(error)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser(async (id, done) => {
    const user = DBUsersManager.getUsers(id)
    done(null, user)
  })
}

export default initializePassport