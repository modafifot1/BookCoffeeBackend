import createHttpError from "http-errors";
import { deleteImage, envVariables, uploadSingle } from "../configs";
import { Book, Feedback } from "../models";
import axios from "axios";
const { numOfPerPage } = envVariables;

const LOG_TAG = "bookController";
const getListBook = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "getListBook begin!");
    let { searchText, searchBy, orderBy, orderType, page } = req.query;
    let filter = {};
    searchBy = searchBy || "title";
    orderBy = orderBy || "rating";
    orderType = orderType || 1;
    page = page || 1;
    var regex = new RegExp([searchText].join(""), "i");
    if (searchText)
      filter = {
        [searchBy]:
          searchBy === "yearOfPublication"
            ? Number(searchText)
            : { $regex: regex },
      };
    const start = (page - 1) * numOfPerPage;
    const totalBooks = await Book.find().count();
    const totalPage =
      totalBooks % numOfPerPage !== 0
        ? Math.round(totalBooks / numOfPerPage) + 1
        : Math.round(totalBooks / numOfPerPage);
    console.log(filter);
    const books = await Book.find(filter)
      .skip(start)
      .limit(numOfPerPage)
      .sort({ [orderBy]: orderType });
    res.status(200).json({
      status: 200,
      msg: "Get list book successfully!",
      books,
      totalPage,
      page,
    });
    console.log(LOG_TAG, "getListBook end!");
  } catch (error) {
    console.log(LOG_TAG, "getListBook error - ", error);
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    const book = await Book.findOne({ _id: bookId });
    if (!book) throw createHttpError(400, "BoodId is not exist!");
    let feedbacks = await Feedback.find({ bookId }).sort({ createAt: -1 });
    feedbacks = feedbacks.map((item) => {
      return {
        _id: item._id,
        userName: item.userName,
        content: item.content,
        numOfStars: item.numOfStars,
        createAt: item.createAt,
        replies: item.reply,
        avataUrl: item.avataUrl,
      };
    });
    res.status(200).json({
      feedbacks,
      book,
      msg: "Get book by id successfully!",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};
const createBook = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "createBook begin!");
    const { title, author, yearOfPublication, quantity } = req.body;
    console.log(req.body);
    let image;
    if (req.files) {
      image = await uploadSingle(req.files[0].path);
    }

    const newBook = await Book.create({
      title,
      author,
      yearOfPublication,
      imageUrl: image ? image.url : "",
      quantity,
    });

    res.status(201).json({
      msg: "create new book successfully",
      status: 201,
      book: newBook,
    });
    console.log(LOG_TAG, "createBook end!");
  } catch (error) {
    console.log(LOG_TAG, "createBook error - ", error);
    next(error);
  }
};

const updateBookById = async (req, res, next) => {
  try {
    console.log(LOG_TAG, "updateBookById start!");
    const bookId = req.params.bookId;
    const { title, author, yearOfPublication, quantity } = req.body;
    let imageUrl = req.body.imageUrl;
    if (req.files) {
      const asset_id = imageUrl.split("/").pop().split(".")[0];
      await deleteImage(asset_id);
      const image = await uploadSingle(req.files[0].path);
      imageUrl = image.url;
      console.log("New image url: ", imageUrl);
    }
    const book = await Book.findOneAndUpdate(
      { _id: bookId },
      {
        title,
        author,
        yearOfPublication,
        quantity,
        imageUrl,
      }
    );
    res.status(200).json({
      msg: "update book successfully!",
      status: 200,
      book: { _id: book._id, title, author, yearOfPublication, quantity },
    });
    console.log(LOG_TAG, "updateBookById end!");
  } catch (error) {
    console.log(LOG_TAG, "updateBookById error - ", error);
    next(error);
  }
};
const deleteBook = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    const deleteBook = await Book.findByIdAndDelete(bookId);
    if (!deleteBook) throw createHttpError(404, "Not found book!");
    res.status(200).json({
      status: 200,
      msg: "Delete book successfully!",
      bookId,
    });
  } catch (error) {
    next(error);
  }
};
const getBookForYou = async (req, res, next) => {
  try {
    let bookIds = await Book.aggregate([
      {
        $project: { bookId: true, _id: false },
      },
      {
        $match: { bookId: { $lt: 1501 } },
      },
    ]);
    bookIds = bookIds.map((item) => item.bookId);
    console.log(bookIds);
    const userId = 7;
    bookIds = await axios.post(
      "http://127.0.0.1:5000/api/v1/resources/books",
      {
        bookIds,
        userId,
      },
      {
        headers: {
          accept: "application/json",
        },
      }
    ); // call flask api ==> selected book;
    bookIds = JSON.parse(bookIds.data);
    // let restNumOfBooks = 0;
    // let restOfBooks = [];
    // if (bookIds.length < 10) restNumOfBooks = 10 - bookIds.length;
    // let relatedBooks = await Book.find({
    //   _id: {
    //     $in: bookIds,
    //   },
    // });
    // if (restNumOfBooks !== 0) {
    //   restOfBooks = await Book.find({
    //     _id: {
    //       $nin: bookIds,
    //     },
    //   }).limit(restNumOfBooks);
    // }
    // relatedBooks = [...relatedBooks, ...restOfBooks];
    let relatedBooks = await Book.find({ bookId: { $in: bookIds } });
    res.status(200).json({
      status: 200,
      msg: "Get related books successfully!",
      relatedBooks,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const bookController = {
  getListBook,
  getBookById,
  createBook,
  updateBookById,
  deleteBook,
  getBookForYou,
};
