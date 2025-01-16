const express = require("express");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

// Use Helmet to set various HTTP headers for security
app.use(helmet());
// Use compression to gzip/deflate responses
app.use(compression());

app.use(express.json()); // Parse JSON bodies

// ----------------------
// Principle 1: Client-Server
// The server provides resources (books) separately from the client.
// ----------------------

// Sample in-memory data store for resources
let books = [
  { id: 1, title: "Book1", author: "Author1" },
  { id: 2, title: "Book2", author: "Author2" },
];

// ----------------------
// Principle 2: Stateless
// Each request from client contains all needed information.
// No session state is stored server-side between requests.
// ----------------------

// ----------------------
// Principle 3: Cacheable
// Use proper HTTP headers to enable caching of responses.
// ----------------------

app.get("/books", (req, res) => {
  // Set Cache-Control header for cacheability
  res.set("Cache-Control", "public, max-age=60");

  // ----------------------
  // Principle 5: Uniform Interface
  // - Use resource-based URLs
  // - Utilize proper HTTP methods for CRUD operations
  // - Provide hypermedia links (HATEOAS)
  // ----------------------
  const booksWithLinks = books.map((book) => ({
    ...book,
    links: {
      self: `/books/${book.id}`,
    },
  }));

  res.json({
    data: booksWithLinks,
    links: { self: "/books" },
  });
});

// GET a single book resource
app.get("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).send();

  res.json({
    data: book,
    links: {
      self: `/books/${book.id}`,
      collection: "/books",
    },
  });
});

// Create a new book resource
app.post("/books", (req, res) => {
  const newId = books.length ? books[books.length - 1].id + 1 : 1;
  const newBook = { id: newId, title: req.body.title, author: req.body.author };
  books.push(newBook);
  res.status(201).json({
    data: newBook,
    links: { self: `/books/${newId}` },
  });
});

// Update an existing book resource
app.put("/books/:id", (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).send();

  books[index] = {
    id: Number(req.params.id),
    title: req.body.title,
    author: req.body.author,
  };
  res.json({
    data: books[index],
    links: { self: `/books/${req.params.id}` },
  });
});

// Delete a book resource
app.delete("/books/:id", (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).send();

  books.splice(index, 1);
  res.status(204).send(); // 204 No Content
});

// ----------------------
// Principle 6: Code on Demand (Optional)
// Serve executable code on demand.
// ----------------------
app.get("/script", (req, res) => {
  res.type("application/javascript");
  res.send(`console.log("Hello from code on demand!")`);
});

// Start the Express server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
