const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

(async function () {
  const db = await open({
    filename: "db/database.db",
    driver: sqlite3.Database,
  });

  await db.migrate({
    migrationsPath: path.resolve(__dirname, "../migrations"),
    force: true,
  });
})();
