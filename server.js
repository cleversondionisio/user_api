const express = require("express")
const app = express()
const cors = require("cors")
const env = require("dotenv")
env.config()
const userService = require("./user-service.js")
var jwt_obj = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
}

var StrategyJWT = passportJWT.Strategy
var strategy = new StrategyJWT(jwt_obj, function (jwt_payload, next) {
  console.log("payload:" + jwt_payload)
  if (jwt_payload) {
    next(null, {
      _id: jwt_payload._id,
      userName: jwt_payload.userName,
    })
  } else {
    next(null, false)
  }
})

passport.use(strategy)
app.use(passport.initialize())

const HTTP_PORT = process.env.PORT || 8080

app.use(express.json())
app.use(cors())

app.post("/api/user/register", (req, res) => {
  userService
    .registerUser(req.body)
    .then((msg) => {
      res.json({ message: msg })
    })
    .catch((msg) => {
      res.status(422).json({ message: msg })
    })
})

app.post("/api/user/login", (req, res) => {
  userService
    .checkUser(req.body)
    .then((user) => {
      var payload = {
        userName: user.userName,
        _id: user._id,
      }

      var token = jwt.sign(payload, jwt_obj.secretOrKey)

      res.json({ message: "login successful", token: token })
    })
    .catch((msg) => {
      res.status(422).json({ message: msg })
    })
})

app.get(
  "/api/user/favourites",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .getFavourites(req.user._id)
      .then((data) => {
        res.json(data)
      })
      .catch((msg) => {
        res.status(422).json({ error: msg })
      })
  }
)

app.put(
  "/api/user/favourites/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .addFavourite(req.user._id, req.params.id)
      .then((data) => {
        res.json(data)
      })
      .catch((msg) => {
        res.status(422).json({ error: msg })
      })
  }
)

app.delete(
  "/api/user/favourites/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .removeFavourite(req.user._id, req.params.id)
      .then((data) => {
        res.json(data)
      })
      .catch((msg) => {
        res.status(422).json({ error: msg })
      })
  }
)

app.get(
  "/api/user/history",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .getHistory(req.user._id)
      .then((data) => {
        res.json(data)
      })
      .catch((msg) => {
        res.status(422).json({ error: msg })
      })
  }
)

app.put(
  "/api/user/history/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .addHistory(req.user._id, req.params.id)
      .then((data) => {
        res.json(data)
      })
      .catch((msg) => {
        res.status(422).json({ error: msg })
      })
  }
)

app.delete(
  "/api/user/history/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .removeHistory(req.user._id, req.params.id)
      .then((data) => {
        res.json(data)
      })
      .catch((msg) => {
        res.status(422).json({ error: msg })
      })
  }
)

userService
  .connect()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("API listening on: " + HTTP_PORT)
    })
  })
  .catch((err) => {
    console.log("unable to start the server: " + err)
    process.exit()
  })
