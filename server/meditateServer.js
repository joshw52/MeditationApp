import express from "express";
import parser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import path from "path";
import http from "http";
import dotenv from "dotenv";
import sessions from "express-session";
import mongoSessionStore from "connect-mongo";
import { MongoClient, ObjectId } from "mongodb";
import { fileURLToPath } from "url";
import { csrfSync } from "csrf-sync";
import { rateLimit } from "express-rate-limit";

const OID = ObjectId;

const app = express();

const server = http.createServer(app);

dotenv.config();

const SALT_ROUNDS = 12;
const MAX_MEDITATION_SECONDS = 86400;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  sessions({
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
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

const { generateToken, csrfSynchronisedProtection } = csrfSync();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use(csrfSynchronisedProtection);

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken(req) });
});

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

app.post("/api/account", authLimiter, async (req, res) => {
  try {
    const { accountUsername, accountPassword, accountEmail } = req.body;

    // Server-side validation of non-empty fields
    if (!accountUsername || !accountPassword || !accountEmail) {
      return res.json({
        accountCreated: false,
        accountMsg: "All fields must be filled out!",
      });
      // Server-side validation of password length
    } else if (accountPassword.length < 8) {
      return res.json({
        accountCreated: false,
        accountMsg: "Password must be at least 8 characters",
      });
    } else if (!EMAIL_REGEX.test(accountEmail)) {
      return res.json({
        accountCreated: false,
        accountMsg: "Invalid email address",
      });
    } else {
      // Make sure username isn't taken
      const foundUsername = await db.collection("users").findOne({
        username: accountUsername,
      });

      if (foundUsername !== null) {
        return res.json({
          accountCreated: false,
          accountMsg: "Username is already taken",
        });
      }

      // Make sure email isn't taken
      const foundEmail = await db.collection("users").findOne({
        email: accountEmail,
      });

      if (foundEmail !== null) {
        return res.json({
          accountCreated: false,
          accountMsg: "Email is already taken",
        });
      }

      if (!foundUsername && !foundEmail) {
        const hashedPassword = await bcrypt.hash(accountPassword, SALT_ROUNDS);
        await db.collection("users").insertOne({
          username: accountUsername,
          password: hashedPassword,
          email: accountEmail,
          defaultMeditationTime: 600,
        });
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
app.post("/api/login", authLimiter, async (req, res) => {
  try {
    // Check that username and password aren't empty
    if (!req.body.loginUsername || !req.body.loginPassword) {
      return res.json({ loginAccepted: false });
    }

    // Look for username
    const item = await db.collection("users").findOne({
      username: req.body.loginUsername,
    });

    // If the username is not found or the login password doesn't match the user's password
    const passwordMatch = item && await bcrypt.compare(req.body.loginPassword, item.password);
    if (!passwordMatch) {
      return res.json({ loginAccepted: false });
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

app.patch("/api/meditationTime", requireLogin, async (req, res) => {
  try {
    const newTime = Number(req.body.defaultMeditationTime);
    if (!Number.isInteger(newTime) || newTime < 1 || newTime > MAX_MEDITATION_SECONDS) {
      return res.status(400).json({ defaultMeditationTime: null });
    }

    const item = await db.collection("users").findOne({
      username: req.session.username,
    });
    if (item) {
      const updatedItem = await db.collection("users").findOneAndUpdate(
        { _id: item._id },
        {
          $set: {
            defaultMeditationTime: newTime,
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
    const meditateDateTime = Number(req.body.meditateDateTime);
    const meditateDuration = Number(req.body.meditateDuration);

    if (
      !Number.isInteger(meditateDateTime) || meditateDateTime < 0 ||
      !Number.isInteger(meditateDuration) || meditateDuration < 1 || meditateDuration > MAX_MEDITATION_SECONDS
    ) {
      return res.status(400).json({ meditationEntryMsg: "Invalid entry data" });
    }

    const meditationEntry = {
      username: req.session.username,
      meditateDateTime,
      meditateDuration,
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

app.patch("/api/accountModify", requireLogin, async (req, res) => {
  try {
    if (!req.body.accountEmail || !EMAIL_REGEX.test(req.body.accountEmail)) {
      return res.json({
        accountModified: false,
        accountMsg: "Invalid email address",
      });
    }

    // Check that email isn't taken
    const foundEmail = await db.collection("users").findOne({
      email: req.body.accountEmail,
    });
    if (foundEmail && foundEmail.username !== req.session.username) {
      return res.json({
        accountModified: false,
        accountMsg: "Email is already taken",
      });
    }

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

app.patch("/api/accountLoginModify", requireLogin, authLimiter, async (req, res) => {
  try {
    const item = await db.collection("users").findOne({
      username: req.session.username,
    });
    const oldPasswordMatch = await bcrypt.compare(req.body.accountOldPassword, item.password);
    if (!oldPasswordMatch) {
      res.json({
        pwordChangeMsg: "Old Password Incorrect!",
      });
    } else {
      const newHashedPassword = await bcrypt.hash(req.body.accountPassword, SALT_ROUNDS);
      await db.collection("users").updateOne(
        { username: req.session.username },
        {
          $set: {
            password: newHashedPassword,
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
app.patch("/api/modifyJournalEntry", requireLogin, async (req, res) => {
  try {
    const jeid = new OID(req.body.journalID);

    // Update the record
    await db
      .collection("meditationrecord")
      .updateOne(
        { _id: jeid, username: req.session.username },
        { $set: { journalEntry: req.body.journalEntry } },
      );
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
app.delete("/api/deleteJournalEntry/:id", requireLogin, async (req, res) => {
  try {
    const jdid = new OID(req.params.id);

    // Check if the journal entry exists and belongs to the user
    const journalEntry = await db.collection("meditationrecord").findOne({
      _id: jdid,
      username: req.session.username,
    });

    if (!journalEntry) {
      return res.status(404).json({
        journalDeleted: false,
      });
    }

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
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

// Listen for an incoming connection
server.listen(port, function () {
  console.log("Server is running...\n");
});
