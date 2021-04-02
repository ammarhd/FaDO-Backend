const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

var fs = require("fs");
const csv = require("csv-parser");

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!
var trx1000 = [];
var L1_transactions = [];
var l3_txs = [];

///reading the file content
fileStream = fs
  .createReadStream("./output.csv")
  .pipe(csv(" "))
  .on("data", (row) => {
    trx1000.push(Object.values(row));
    if (trx1000.length >= 12000) {
      fileStream.pause();
    }
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });

// connecting the socket

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
  });

  //send l3 txs
  setInterval(() => {
    //console.log(l3_txs);
    socket.emit("l3_txs", l3_txs);
  }, 1000);

  // set the timout interval
  socket.on("messege", () => {
    //console.log(trx1000);
    socket.emit("FromAPI", trx1000);
    trx1000 = [];
    fileStream.resume();
  });

  // listen to l1_transactions from reactjs
  socket.on("l1_txs", (txs) => {
    console.log(txs.length);
    L1_transactions = [...L1_transactions, ...txs];
    l3_txs = L1_transactions;
    L1_transactions = [];
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
