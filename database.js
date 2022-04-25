// databasing
"use strict";
const Database = require('better-sqlite3');

const db = new Database('log.db');

// Is the database initialized or do we need to initialize it?
const stmt = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' and name='access';`
    );

let row = stmt.get();

if (row === undefined) {
    console.log('Your database appears to be empty. I will initialize it now.');

// Set a const that will contain your SQL commands to initialize the database.
    const sqlInit = `
        CREATE TABLE access (id INTEGER PRIMARY KEY, remoteaddr VARCHAR, 
            remoteuser VARCHAR, time VARCHAR, method VARCHAR, url VARCHAR, 
            protocol VARCHAR, httpversion NUMERIC, status INTEGER, 
            referer VARCHAR, useragent VARCHAR);
    `;

    db.exec(sqlInit);

    console.log('Your database has been initialized with a new table.');

} else {
    console.log('Database exists.')
}

module.exports = db