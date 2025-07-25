import express from "express";
import parser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import http from "http";
import dotenv from "dotenv";
import sessions from "express-session";
import mongoSessionStore from "connect-mongo";
import { MongoClient, ObjectId } from "mongodb";
import { fileURLToPath } from "url";

const OID = ObjectId;

const app = express();

const server = http.createServer(app);

dotenv.config();

function encrypt(str) {
  return crypto
    .createHmac("sha256", process.env.HMAC_SECRET)
    .update(str)
    .digest("hex");
}

const port = process.env.PORT || 8080;

const username = process.env.DB_USER || "";
const password = process.env.DB_PASS || "";
const cluster = process.env.DB_CLUSTER || "";
const database = process.env.DB_NAME || "meditation";

const mongoDBUrl = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority&tls=true`;

const client = new MongoClient(mongoDBUrl);
await client.connect();
const db = client.db(database);

app.set("port", port);
app.enable("trust proxy");

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(cors());

app.use(
  sessions({
    cookie: {
      httpOnly: true,
      maxAge: 4 * 60 * 24 * 1000,
      secure: process.env.NODE_ENV === "production",
    },
    resave: true,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: mongoSessionStore.create({
      dbName: database,
      mongoUrl: mongoDBUrl,
    }),
  }),
);

app.get("/api/isAuthenticated", function (req, res) {
  const isAuthenticated = req.sessionID && req.session.username;
  res.json({ isAuthenticated: !!isAuthenticated });
});

const requireLogin = (req, res, next) => {
  if (req.session && req.session.username) {
    next();
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
};

app.post("/api/account", async (req, res) => {
  try {
    // The user entry to be made
    const newUser = {
      username: req.body.accountUsername,
      password: encrypt(req.body.accountPassword),
      email: req.body.accountEmail,
      defaultMeditationTime: 600,
    };

    // Server-side validation of non-empty fields
    if (!newUser.username || !newUser.password || !newUser.email) {
      res.json({
        accountCreated: false,
        accountMsg: "All fields must be filled out!",
      });
      // Server-side validation of password length
    } else if (newUser.password.length < 8) {
      res.json({
        accountCreated: false,
        accountMsg: "Password must be at least 8 characters",
      });
    } else {
      // Attempt to insert the account
      const item = await db.collection("users").findOne({
        username: req.body.accountUsername,
      });

      if (item !== null) {
        res.json({
          accountCreated: false,
          accountMsg: "Username is already taken",
        });
      } else {
        await db.collection("users").insertOne(newUser);
        res.json({
          accountCreated: true,
          accountMsg: "",
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      accountCreated: false,
      accountMsg: "",
    });
  }
});

// Check that the login credentials are correct,
// that the username exists and that the password is correct
app.post("/api/login", async (req, res) => {
  try {
    // Check that username and password aren't empty
    if (!req.body.loginUsername || !req.body.loginPassword) {
      res.json({ loginAccepted: false });
    }

    // Look for username
    const item = await db.collection("users").findOne({
      username: req.body.loginUsername,
    });

    // If the username is not found or the login password doesn't match the user's password
    if (!item || encrypt(req.body.loginPassword) !== item.password) {
      res.json({ loginAccepted: false });
    } else {
      req.session.username = req.body.loginUsername;
      res.json({ loginAccepted: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      loginAccepted: false,
    });
  }
});

// Log out and kill session
app.post("/api/userLogout", (req, res) => {
  if (req.session) req.session.destroy();
  res.end();
});

app.get("/api/meditationTime", requireLogin, async (req, res) => {
  try {
    const item = await db.collection("users").findOne({
      username: req.session.username,
    });
    if (item) {
      res.json({
        defaultMeditationTime: item?.defaultMeditationTime,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      defaultMeditationTime: null,
    });
  }
});

app.post("/api/meditationTime", requireLogin, async (req, res) => {
  try {
    const item = await db.collection("users").findOne({
      username: req.session.username,
    });
    if (item) {
      const updatedItem = await db.collection("users").findOneAndUpdate(
        { _id: item._id },
        {
          $set: {
            defaultMeditationTime: req.body.defaultMeditationTime,
          },
        },
      );
      res.json({
        defaultMeditationTime: updatedItem.defaultMeditationTime,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      defaultMeditationTime: null,
    });
  }
});

app.post("/api/meditationEntry", requireLogin, async (req, res) => {
  try {
    const meditationEntry = {
      username: req.session.username,
      meditateDateTime: req.body.meditateDateTime,
      meditateDuration: req.body.meditateDuration,
      journalEntry: req.body.journalEntry,
    };

    // Insert the meditation entry to the database
    await db.collection("meditationrecord").insertOne(meditationEntry);
    res.json({
      meditationEntryMsg: "Meditation Entry Made!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      meditationEntryMsg: "Error making meditation entry",
    });
  }
});

app.get("/api/accountInfoLoad", requireLogin, async (req, res) => {
  try {
    const user = await db.collection("users").findOne({
      username: req.session.username,
    });
    res.json({ email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      email: null,
    });
  }
});

app.post("/api/accountModify", requireLogin, async (req, res) => {
  try {
    // Modify the account if the user clicked Modify and not Cancel
    await db
      .collection("users")
      .updateOne(
        { username: req.session.username },
        { $set: { email: req.body.accountEmail } },
      );

    res.json({
      accountModified: true,
      accountMsg: "Account Modified!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      accountModified: false,
      accountMsg: "Error modifying account",
    });
  }
});

app.post("/api/accountLoginModify", requireLogin, async (req, res) => {
  try {
    const item = await db.collection("users").findOne({
      username: req.session.username,
    });
    if (item.password !== encrypt(req.body.accountOldPassword)) {
      res.json({
        pwordChangeMsg: "Old Password Incorrect!",
      });
    } else {
      await db.collection("users").updateOne(
        { username: req.session.username },
        {
          $set: {
            password: encrypt(req.body.accountPassword),
          },
        },
      );
      res.json({
        pwordChangeMsg: "Password Changed!",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      pwordChangeMsg: "Error changing password",
    });
  }
});

app.get("/api/progress", requireLogin, async (req, res) => {
  try {
    const meditationRecords = await db
      .collection("meditationrecord")
      .find({
        $and: [
          {
            username: {
              $eq: req.session.username,
            },
          },
          {
            meditateDateTime: {
              $lte: Number(req.query.endTimestamp),
            },
          },
          {
            meditateDateTime: {
              $gte: Number(req.query.startTimestamp),
            },
          },
        ],
      })
      .toArray();

    res.json({
      meditationRecords,
      recordsFound: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      recordsFound: false,
      meditationRecords: [],
    });
  }
});

// Modify the journal entry in the collection, using the id to find it
app.post("/api/modifyJournalEntry", requireLogin, async (req, res) => {
  try {
    const jeid = new OID(req.body.journalID);

    // Update the record
    await db
      .collection("meditationrecord")
      .updateOne({ _id: jeid }, { $set: { journalEntry: req.body.journalEntry } });
    res.json({
      journalModified: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      journalModified: false,
    });
  }
});

// Delete a journal entry
app.post("/api/deleteJournalEntry", requireLogin, async (req, res) => {
  try {
    const jdid = new OID(req.body.journalID);

    // Delete the record
    await db.collection("meditationrecord").deleteOne({
      _id: jdid,
    });

    res.json({
      journalDeleted: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      journalDeleted: false,
    });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, "./client/dist")));

// Listen for an incoming connection
server.listen(port, function () {
  console.log("Server is running...\n");
});
