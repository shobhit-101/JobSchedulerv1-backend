const express = require("express");
const cors = require("cors");
const mongoose= require("mongoose");

const Job = require("./models/Job");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const app = express();
const MONGO_URI = "mongodb+srv://bigbron:aditya700@cluster0.q3ayjcn.mongodb.net/taskmanager";
app.use(cors()); // Enable CORS for all routes
app.use(express.json());// middleware to parse JSON bodies

app.post("/auth/signup",async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }
    
    const user = await User.create({ email, password });

    res.status(201).json({ success: true, message: "User created" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }
    const token = jwt.sign(
  { userId: user._id },
  "SECRET_KEY",
  { expiresIn: "7d" }
);

    res.json({ success: true, token});
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});
app.get("/protected", auth, (req, res) => {
  res.json({
    success: true,
    userId: req.userId
  });
});

app.get("/", (req, res) => {
  res.send("Backend running");
});

// async function testUser() {
//   const user = await User.create({
//     email: "test@test.com",
//     password: "password123"
//   });
//   console.log(user);
// }

// testUser();


app.get("/jobs",auth, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.userId });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

app.post("/jobs",auth, async (req, res) => {
  try {
    const { text , scheduledAt} = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Text is required"
      });
    }

     const job = await Job.create({
    text,
    user: req.userId,
    status: "pending",
    scheduledAt: scheduledAt? new Date(scheduledAt): null
  });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});


// app.delete("/tasks/:id", (req, res) => {
//   const { id } = req.params;

//   // validation
//   const initialLength = tasks.length;
//   tasks = tasks.filter(task => task.id !== id);

//   if (tasks.length === initialLength) {
//     return res.status(404).json({
//       success: false,
//       error: "Task not found"
//     });
//   }
//   //response for successful deletion
//   res.json({ success: true });
// });

app.delete("/jobs/:id",auth, async (req, res) => {
  try {
    const { id } = req.params;
          const job = await Job.findOne({
          _id: id,
          user: req.userId
        });

    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found"
      });
    }

    await job.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});


// app.put("/tasks/:id", (req, res) => {
//   const { id } = req.params;

//   const task = tasks.find(t => t.id === id);

//   if (!task) {
//     return res.status(404).json({
//       success: false,
//       error: "Task not found"
//     });
//   }
 
//   task.completed = !task.completed;

//   res.json({
//     success: true,
//     data: task
//   });
// });
app.put("/jobs/:id",auth, async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({
  _id: id,
  user: req.userId
});


    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found"
      });
    }

    job.status = job.status === "pending" ? "completed" : "pending";
    await job.save();

    res.json({
      success: true,
      data: job
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
