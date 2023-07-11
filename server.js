const express = require("express")
const hbs = require('express-handlebars');
const app = express()
const path = require("path")
const PORT = 3000;

const http = require('http');

const server = http.createServer(app); // tu zmiana

const { Server } = require("socket.io");
const socketio = new Server(server);

server.listen(PORT, () => {
    console.log('server listening on ' + PORT);
});

app.use(express.json());

app.use(express.static(path.join(__dirname + '/static')));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
})

let players = []
let helper = 0

app.post("/user", function (req, res) {
    res.setHeader('content-type', 'application/json'); // nagłówek
    if (JSON.stringify(req.body.reset)) {
        players = []
        helper = 0
        res.end(JSON.stringify(req.body));
    }
    else {
        if (players.length < 2) {
            if (players[0] == JSON.stringify(req.body)) {
                res.end(JSON.stringify("error2"));
                helper = 1
            }
            else {
                players.push(JSON.stringify(req.body))
                res.end(JSON.stringify(req.body));
                helper = 0
            }
        }
        else {
            res.end(JSON.stringify("error1"));
            helper = 1
        }
    }
})

app.post("/userCount", function (req, res) {
    res.setHeader('content-type', 'application/json');
    if (JSON.stringify(req.body.reset)) {
        res.end(JSON.stringify("error"));
    }
    else {
        if (helper == 0) {
            if (players.length == 1) {
                res.end(JSON.stringify("white"));
            }
            if (players.length == 2) {
                res.end(JSON.stringify("black"));
            }
        }

    }
})

let helper2 = 0

app.post("/waiting", function (req, res) {
    res.setHeader('content-type', 'application/json');
    if (players.length == 1) {
        res.end(JSON.stringify("true"));
        helper2 = 0
    }
    else if (players.length == 2 && helper2 <= 1) {
        let data = {
            true: "false",
            player: players[1]
        }
        res.end(JSON.stringify(data));
        helper2++
    }
    else {
        res.send(JSON.stringify("false"))
    }
})

socketio.on('connection', (client) => {
    console.log("klient się podłączył z id = ", client.id)
    // client.id - unikalna nazwa klienta generowana przez socket.io

    client.emit("onconnect", {
        clientId: client.id
    })

    client.on("changePlayer", (data) => {
        let player = data.player
        console.log("Teraz ruch:", player)
        socketio.emit("playerChanged", {
            player: player,
            name: data.name,
            position: data.position
        })
    })

    client.on("endOfGame", (data) => {
        console.log("koniec")
        socketio.emit("theEnd", {
            player: data.player
        })
    })

    client.on("deletePawn", (data) => {
        console.log(data.pawn)
        socketio.emit("deletePawn", {
            pawn: data.pawn
        })
    })

    client.on("disconnect", (reason) => {
        console.log("klient się rozłącza", reason)
    })
});
