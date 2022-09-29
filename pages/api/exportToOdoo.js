import sqlite3 from "sqlite3";
import {open} from "sqlite";
import Odoo from "../../external/odoo";

export default async function handler(req, res) {
    const db = await open({
        filename: "db/database.db",
        driver: sqlite3.Database,
    });

    const includeRecordsRaw = await db.all("SELECT * FROM contact WHERE odoo_id IS NULL");
    const includeRecords = includeRecordsRaw.map(function (item) {
        let {odoo_id, avatar, id, ...keep} = item;
        return {
            image_1920: avatar,
            x_phonebook_id: id,
            ...keep,
        };
    });

    const odoo = new Odoo({
        url: "http://127.0.0.1",
        port: 8069,
        db: "test_api",
        username: "admin",
        password: "admin",
    });

    const uid = await odoo.connect().catch(console.error);

    if (uid) {
        await Promise.all(includeRecords.map(async partner => {
            const inParams = [
                partner,
            ];
            const params = [
                inParams,
            ];
            const result = await odoo.execute_kw("res.partner", "create", params).catch(console.error);

            if (result) {
                await db.run(
                    "UPDATE contact SET odoo_id = ? WHERE id = ?",
                    [result, partner.id],
                );
            }
        }));
    }


    const people = await db.all("SELECT * FROM contact");
    res.status(200).json({people});
}
