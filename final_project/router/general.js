const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Task 6: Register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (users.some(u => u.username === username)) {
    return res.status(409).json({ message: "Username already exists." });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Task 1: All books
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: By ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.status(200).send(JSON.stringify(book, null, 4));
  return res.status(404).json({ message: "Book not found." });
});

// Task 3: By author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.keys(books)
    .filter(k => books[k].author.toLowerCase() === author)
    .map(k => ({ isbn: k, ...books[k] }));
  if (result.length) return res.status(200).send(JSON.stringify(result, null, 4));
  return res.status(404).json({ message: "No books found for this author." });
});

// Task 4: By title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.keys(books)
    .filter(k => books[k].title.toLowerCase() === title)
    .map(k => ({ isbn: k, ...books[k] }));
  if (result.length) return res.status(200).send(JSON.stringify(result, null, 4));
  return res.status(404).json({ message: "No books found with this title." });
});

// Task 5: Reviews
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found." });
  if (Object.keys(book.reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }
  return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

// ---------- Tasks 10-13: Axios + async/await ----------
const BASE = "http://localhost:5000";

// Task 10
public_users.get('/async/books', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: "Error fetching books", error: e.message });
  }
});

// Task 11
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/isbn/${req.params.isbn}`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ message: "Error fetching book by ISBN", error: e.message });
  }
});

// Task 12
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ message: "Error fetching books by author", error: e.message });
  }
});

// Task 13
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ message: "Error fetching books by title", error: e.message });
  }
});

module.exports.general = public_users;
