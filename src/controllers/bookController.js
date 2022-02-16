import createHttpError from "http-errors";
import { deleteImage, envVariables, uploadSingle } from "../configs";
import { Book } from "../models";
const { numOfPerPage } = envVariables;

const LOG_TAG = "bookController";
const getListBook = async (res, req, next) => {
  try {
    console.log(LOG_TAG, "getListBook begin!");
    let { searchText, searchBy, orderBy, orderType, page } = req.body;
    let filter = {};
    searchBy = searchBy || "title";
    orderBy = orderBy || "rating";
    orderType = orderType || 1;
    page = page || 1;
    if (searchText) filter = { [searchBy]: searchText };
    const start = (page - 1) * numOfPerPage;
    const totalBooks = await Book.find().count();
    const books = await Book.find(filter)
      .skip(start)
      .limit(numOfPerPage)
      .sort({ [orderBy]: orderType });
    res.status(200).json({
      status: 200,
      msg: "Get list book successfully!",
      books,
      totalBooks,
      page,
    });
    console.log(LOG_TAG, "getListBook end!");
  } catch (error) {
    console.log(LOG_TAG, "getListBook error - ", error);
    next(error);
  }
};

const getBookById = async (res, req, next) => {
  try {
    const bookId = req.params.bookId;
    const book = await Book.findOne({ _id: bookId });
    if (!book) throw createHttpError(400, "BoodId is not exist!");
    res.status(200).json({
      book,
      msg: "Get book by id successfully!",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};
const createBook = async (res, req, next) => {
  try {
    console.log(LOG_TAG, "createBook begin!");
    const { title, author, yearOfPublication, quantity } = req.body;
    console.log("file path: ", req.files[0].path);
    const image = await uploadSingle(req.files[0].path);

    const newBook = await Book.create({
      title,
      author,
      yearOfPublication,
      imageUrl: image.url,
      quantity,
    });

    res.status(201).json({
      msg: "create new book successfully",
      status: 201,
      newBook,
    });
    console.log(LOG_TAG, "createBook end!");
  } catch (error) {
    console.log(LOG_TAG, "createBook error - ", error);
    next(error);
  }
};

const updateBookById = async (res, req, next) => {
  try {
    console.log(LOG_TAG, "updateBookById start!");
    const bookId = req.params;
    const { title, author, yearOfPublication, quantity } = req.body;
    let imageUrl = req.body.imageUrl;
    if (req.files) {
      const asset_id = imageUrl.split("/").pop().split(".")[0];
      await deleteImage(asset_id);
      const image = await uploadSingle(req.files[0].path);
      imageUrl = image.url;
      console.log("New image url: ", imageUrl);
    }
    await Book.findOneAndUpdate(
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
    });
    console.log(LOG_TAG, "updateBookById end!");
  } catch (error) {
    console.log(LOG_TAG, "updateBookById error - ", error);
    next(error);
  }
};
export const bookController = {
  getListBook,
  getBookById,
  createBook,
  updateBookById,
};
