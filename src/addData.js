var fs = require("fs");
var parse = require("csv-parse");

var Book = require("./models/BookModel");

var csvData = [];
fs.createReadStream("../books.csv")
  .pipe(new parse.Parser({ delimiter: "," }))
  .on("data", function (csvrow) {
    // console.log(csvrow);
    //do something with csvrow
    csvData.push(csvrow);
  })
  .on("end", function () {
    //do something with csvData
    console.log(csvData);
  });

const addData = async () => {
  await Promise.all(
    csvData.map((item) =>
      Book.Book.create({
        bookId: item[1],
        title: item[9],
        author: item[7],
        yearOfPublication: item[8],
        rating: item[12],
        imageUrl: item[21],
        numOfFeedback: item[13],
        quantity: 5,
      })
    )
  );
};

addData();
