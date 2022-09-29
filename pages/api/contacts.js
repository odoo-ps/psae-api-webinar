import sqlite3 from "sqlite3";
import {open} from "sqlite";
import Odoo from "../../external/odoo";

export default async function handler(req, res) {
    const db = await open({
        filename: "db/database.db",
        driver: sqlite3.Database,
    });

    const people = await db.all("SELECT * FROM contact");
    res.status(200).json({people});
}
