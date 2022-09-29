import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function GET(req, res) {
  const { id } = req.query;

  const db = await open({
    filename: "db/database.db",
    driver: sqlite3.Database,
  });

  return res.status(200).json(await db.get(`SELECT * FROM contact WHERE id=${id}`));
}

async function POST(req, res) {
  const body = JSON.parse(req.body);

  const db = await open({
    filename: "db/database.db",
    driver: sqlite3.Database,
  });

  const query = `
    INSERT INTO contact (${Object.keys(body).join(",")}) 
    VALUES (${Object.values(body)
      .map((v) => `'${v}'`)
      .join(",")});`;

  const result = await db.run(query);

  return res.status(200).json(await db.get(`SELECT * FROM contact WHERE id=${result.lastID}`));
}

async function PUT(req, res) {
  const { id, ...body } = JSON.parse(req.body);

  const db = await open({
    filename: "db/database.db",
    driver: sqlite3.Database,
  });

  const query = `
    UPDATE contact SET
    ${Object.entries(body)
      .map(([k, v]) => `${k}='${v}'`)
      .join(",")}
    WHERE id=${id};
  `;

  const result = await db.run(query);

  return res.status(200).json(await db.get(`SELECT * FROM contact WHERE id=${id}`));
}

async function DELETE(req, res) {
  const { id } = JSON.parse(req.body);

  const db = await open({
    filename: "db/database.db",
    driver: sqlite3.Database,
  });

  const result = await db.run(`DELETE FROM contact WHERE id=${id}`);
  return res.status(200).json({ message: "Deleted" });
}

export default async function handler(req, res) {
  const handle = { GET, POST, PUT, DELETE }[req.method];

  if (!handle) res.status(400).json({ message: new Error("Unsupported request method " + req.method) });

  return handle(req, res);
}
