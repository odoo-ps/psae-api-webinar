import sqlite3 from "sqlite3";
import {open} from "sqlite";
import Odoo from "../../external/odoo";

export default async function handler(req, res) {
    const db = await open({
        filename: "db/database.db",
        driver: sqlite3.Database,
    });

    const excludeIds = await db.all("SELECT odoo_id FROM contact");

    const odoo = new Odoo({
        url: "http://127.0.0.1",
        port: 8069,
        db: "test_api",
        username: "admin",
        password: "admin",
    });

    const uid = await odoo.connect().catch(console.error);

    if (uid) {
        const inParams = [
            [["id", "not in", excludeIds.map((item) => item.odoo_id || 0)]], // domain
            ["name", "image_1920", "id", "phone", "email"], // fields
        ];
        const params = [
            inParams,
        ];
        const partners = await odoo.execute_kw("res.partner", "search_read", params).catch(console.error);

        if (partners) {
            await Promise.all(partners.map((partner) => {
                return db.run(
                    "INSERT INTO contact (name, avatar, odoo_id, phone, email) VALUES (?, ?, ?, ?, ?)",
                    [partner.name, partner.image_1920, partner.id, partner.phone, partner.email],
                );
            }));

            const people = await db.all("SELECT * FROM contact");

            await Promise.all(people.map(async (person) => {
                const inParams = [
                    person.odoo_id,
                    {x_phonebook_id: person.id},
                ];
                const params = [
                    inParams,
                ];
                const result = await odoo.execute_kw("res.partner", "write", params).catch(console.error);
            }));
            return res.status(200).json({people});
        }

        return res.status(500).json({
            message: "something went wrong",
        });
    }


    const people = await db.all("SELECT * FROM contact");
    res.status(200).json({people});
}
