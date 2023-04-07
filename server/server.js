const express = require("express");
const fs = require("fs");
const path = require('path');
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require('cors')

const app = express();
const server = require("http").createServer(app);


// Config
const PORT = process.env.PORT || 5000;

// ------------------------------------------- Setup -------------------------------------------
// Create a connection pool to reuse connections
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "username",
  password: "password",
  database: "chat",
});

app.use(cors())
app.use(express.json())


// ------------------------------------------- Authentication -------------------------------------------
function authentication(req, res, next) {
    const authheader = req.headers.authorization;
    console.log(req.headers);
 
    if (!authheader) {
        let err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err)
    }
 
    const auth = new Buffer.from(authheader.split(' ')[1],
        'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];
 
    if (user == 'admin' && pass == 'admin') {
        
        // If admin user

        res.writeHead(301, {
          Location: `http://localhost:3000/`
        }).end();

    } else {
        let err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
    }
 
}

// app.use(authentication)
// app.use(express.static(path.join(__dirname, 'public')));


app.get("/ping", function (req, res) {
  res.send("pong");
});

// ------------------------------------------- CRUD -------------------------------------------

// Set up routes for creating channels
app.post("/api/channels", (req, res) => {
  const { name } = req.body;

  // Validate input
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  // Execute SQL query to insert new channel into database
  pool.query(
    "INSERT INTO channels (name) VALUES (?)",
    [name],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to create channel" });
      }

      // Return the newly created channel
      const newChannel = { id: results.insertId, name };
      return res.status(201).json(newChannel);
    }
  );
});

// Set up routes for viewing all channels
app.get("/api/channels", (req, res) => {
  // Execute SQL query to get all channels from database
  pool.query("SELECT * FROM channels", (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to get channels" });
    }

    // Return the list of channels
    const channels = results.map((row) => {
      return { id: row.id, name: row.name };
    });
    return res.json(channels);
  });
});

// Set up a route for getting a specific channel by ID
app.get("/api/channels/:id", (req, res) => {
  const { id } = req.params;

  // Execute SQL query to get the channel from the database
  pool.query("SELECT * FROM channels WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to get channel" });
    }

    // Check if channel exists
    if (results.length === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Return the channel
    const row = results[0];
    const channel = { id: row.id, name: row.name };
    return res.json(channel);
  });
});

// Set up a route for deleting a specific channel by ID
app.delete("/api/channels/:id", (req, res) => {
  const { id } = req.params;

  // Execute SQL query to delete the channel from the database
  pool.query("DELETE FROM channels WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete channel" });
    }

    // Check if channel was deleted
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Return success response
    return res.sendStatus(204);
  });
});

// Set up routes for getting messages
app.get("/api/channels/:channelId/messages", async (req, res) => {
  try {
    const { channelId } = req.params;
    pool.query(
      "SELECT m.id, m.text, m.created_at, u.username FROM messages m INNER JOIN users u ON m.user_id = u.id WHERE channel_id = ?",
      [channelId],
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: "Failed to get messages" });
        }

        return res.json(results);
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Set up routes for posting messages
app.post("/api/channels/:channelId/messages", async (req, res) => {
  try {
    const { text } = req.body;
    const { channelId } = req.params;
    //   const { userId } = req.user;
    const userId = 1;

    // create new message
    pool.query(
      `INSERT INTO messages (text, user_id, channel_id) VALUES ('${text}', '${userId}', '${channelId}')`,
      (error, results) => {
        pool.query(
          "SELECT m.id, m.text, m.created_at, u.username FROM messages m INNER JOIN users u ON m.user_id = u.id WHERE channel_id = ?",
          [channelId],
          (error, results) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ error: "Failed to get messages" });
            }
    
            return res.json(results);
          }
        );
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Set up routes for getting replies
app.get(
  "/api/messages/:messageId/replies",
  async (req, res) => {
    try {
      const { messageId } = req.params;

      pool.query(
        "SELECT r.id, r.message_id, r.reply, r.created_at, u.username FROM replies r INNER JOIN users u ON r.user_id = u.id  WHERE message_id = ?",
        [messageId],
        (error, results) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to get messages" });
          }

          return res.json(results);
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Set up routes for posting replies
app.post(
  "/api/messages/:messageId/replies",
  async (req, res) => {
    try {
      const { text } = req.body;
      const { messageId } = req.params;
      //   const { userId } = req.user;
      const userId = 1;

      // create new reply
      pool.query(
        `INSERT INTO replies (reply, user_id, message_id) VALUES ('${text}', '${userId}', '${messageId}')`,
        (error, results) => {
          pool.query(
            "SELECT r.id, r.message_id, r.reply, r.created_at, u.username FROM replies r INNER JOIN users u ON r.user_id = u.id  WHERE message_id = ?",
            [messageId],
            (error, results) => {
              if (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to get messages" });
              }
    
              return res.json(results);
            }
          );
        }
      );


    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);


// ------------------------------------------- Start server -------------------------------------------
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
