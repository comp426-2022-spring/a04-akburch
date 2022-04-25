const express = require('express')
const app = express()
const args = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const morgan = require('morgan')
const logdb = require('./database.js')

const HTTP_PORT = args.port || process.env.PORT || 5555
const log = args.log || true
const debug = args.debug || false

// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)

// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',HTTP_PORT))
});

if (log) {
    app.use( (req, res, next) => {
        let logdata = {
            remoteaddr: req.ip,
            remoteuser: req.user,
            time: Date.now(),
            method: req.method,
            url: req.url,
            protocol: req.protocol,
            httpversion: req.httpVersion,
            status: res.statusCode,
            referer: req.headers['referer'],
            useragent: req.headers['user-agent']
        }
        const stmt = db.prepare(`
            INSERT INTO access (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) MVALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `)

        const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
        next()
    })
    const access = fs.createWriteStream('./accessLog.log', { flags: 'a' })
    // Set up the access logging middleware
    app.use(morgan('combined', { stream: access }))
}

app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
    });


// a02 helper functions

function coinFlip() {
    var value = Math.round(Math.random);
    let result = "";
    if (value < 1) {
        result = "tails";
    } else {
        result = "heads";
    }
    return result;
    }

function coinFlips(flips) {
    var flipArray = [];
    for (let i = 0; i < flips; i++) {
        flipArray[i] = coinFlip();
    }
    return flipArray;
    }

function countFlips(array) {
    let headsAmt = 0;
    let tailsAmt = 0;
    let result = {tails: tailsAmt, heads: headsAmt}
    for (let i = 0; i < array.length; i++) {
        if (array[i] == "heads") {
        headsAmt += 1;
        } else if (array[i] == "tails") {
        tailsAmt += 1;
        }
    }
    console.log(array);
    return result;
    }

function flipACoin(call) {
    var flipV = coinFlip();
    var resultV = "";
    if (call == flipV) {
        resultV = "win";
    } else {
        resultV = "lose";
    }
    const finalResult = {call: call, flip: flipV, result: resultV};
    return finalResult;
    }

// a03 endpoints

app.get('/app/flip/', (req, res) => {
    res.statusCode = 200;
    res.writeHead(res.statusCode, {'Content-Type' : 'text/plain'});
    res.end('{"flip":"' + coinFlip() + '"}')
    });

app.get('/app/flips/:number', (req, res) => {
    var doAFlip = coinFlips(req.params.number)
    var countThem = countFlips(doAFlip)
    res.status(200).json({'raw' : doAFlip, 'summary' : countThem})
    });

app.get('/app/flip/call/:which(heads|tails)/', (req, res) => {
    const guessing = flipACoin(req.params.which)
    res.status(200).json(guessing)
});

// uh oh
app.use(function(req, res) {
    res.status(404).send('404 NOT FOUND')
    });