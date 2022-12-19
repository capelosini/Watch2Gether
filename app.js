const express = require("express")
const ejs = require("ejs")
const bp = require("body-parser")
const crypto = require("crypto")

const app = express()
const port = process.env.PORT || 80
var rooms = []
var events = {}

app.use(express.static("public"))
app.use(bp.urlencoded({extended: true}))
app.use(express.json())
app.set("view engine", "ejs")


app.route("/")
.get((req, res) => {
    res.render("index")
})

app.route("/new")
.post((req, res) => {
    var url = req.body.url
    var room = {
        url: url,
        invite: crypto.randomBytes(20).toString('hex'),
        hostToken: crypto.randomBytes(30).toString('hex')
    }
    rooms.push(room)
    events[room.invite] = []
    console.log(rooms)
    res.render("host", {room: room})
})

app.route("/join")
.get((req, res) => {
    rooms.forEach((room, index) => {
        if(room.invite == req.query.room){
            res.render("client", {room: room})
        } else if (index == rooms.length-1){
            res.send("Room not found")
        }
    })
    try{
        res.send("Room not found")
    } catch{
    }
})

app.route("/refresh")
.post((req, res) => {
    rooms.forEach((room, index) => {
        if(room.invite == req.query.room){
            var token = req.body.token
            if(token == room.hostToken){
                if(req.body.url){
                    events[room.invite].push({event: req.body.event, time: req.body.time, url: req.body.url})
                    rooms=rooms.map((roomm) => {
                        if(roomm.invite == room.invite){
                            roomm.url = req.body.url
                            return roomm
                        } else{
                            return roomm
                        }
                    })
                } else{
                    events[room.invite].push({event: req.body.event, time: req.body.time})
                }
                console.log(events)
                res.send("success")
            } else{
                res.send("Invalid token")
            }
        } else if (index == rooms.length-1){
            res.send("Room not found")
        }
    })
    try{
        res.send("Room not found")
    } catch{
    }
})
.get((req, res) => {
    rooms.forEach((room, index) => {
        if(room.invite == req.query.room){
            res.send(events[room.invite])
        } else if (index == rooms.length-1){
            try{
                res.send("Room not found")
            } catch{
            }
        }
    })
    try{
        res.send("Room not found")
    } catch{
    }
})
.delete((req, res) => {
    setTimeout(() => {
        rooms.forEach((room, index) => {
            if(room.invite == req.query.room){
                var token = req.body.token
                if(token == room.hostToken){
                    rooms.splice(index, index+1)
                    delete events[room.invite]
                    console.log(rooms)
                    console.log(events)
                    res.send("success")
                } else{
                    res.send("Invalid token")
                }
            } else if (index == rooms.length-1){
                res.send("Room not found")
            }
        })
        try{
            res.send("Room not found")
        } catch{
        }
    }, 1000)
})


app.listen(port, () => {
    console.log("Server started on port "+port)
})