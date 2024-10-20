import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.EXPRESS_PORT;


async function logger(req, res, next) {
  console.log(`${req.method} | ${JSON.stringify(req.body)}`);
  next();
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(logger);

const db = new pg.Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.PG_DATABASE,
});

db.connect()
  .then(() => console.log('Connected to the database!'))
  .catch(err => console.error('Database connection error:', err));

const listTypes = ['today', 'week', 'month'];

async function getAllItems() {
  let results = []
  for (let t of listTypes) {
    let result = await db.query("SELECT * FROM todo WHERE type = $1 ORDER BY updated_at DESC", [t]);
    result.rows.forEach(item => {
      const date = new Date(item.updated_at);
      item.formattedDate = date.toLocaleDateString('en-CA'); // e.g., "YYYY-MM-DD"
    });
    results.push({
      listTitle: t,
      listItems: result.rows
    });
  }
  return results;
}

async function addItem(title, type) {
  await db.query('INSERT INTO todo (title, type) VALUES ($1, $2)', [title, type]);
}

async function deleteItem(id) {
  await db.query('DELETE FROM todo WHERE id = $1', [id]);
}

async function updateItem(id, title) {
  await db.query('UPDATE todo SET title = $1 WHERE id = $2', [title, id]);
}

let items = await getAllItems();

app.get("/", (req, res) => {
  res.render("index.ejs", {
    typedLists: items
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const type = req.body.list;
  await addItem(item, type);
  items = await getAllItems();
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  await updateItem(id, title);
  items = await getAllItems();
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  await deleteItem(req.body.deleteItemId);
  items = await getAllItems();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
