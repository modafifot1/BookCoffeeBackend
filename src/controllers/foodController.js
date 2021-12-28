import { Food, Feedback } from "../models";
import { uploadSingle, deleteImage, envVariables } from "../configs";
const { numOfPerPage } = envVariables;
const LOG_TAG = "foodController";
/**
 * @api {get} /api/v1/foods?page=&searchText=&foodType=&orderBy=&orderType Get food per page
 * @apiName Get food per page
 * @apiGroup Food
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>get list food per page successfully</code> if everything went fine.
 * @apiSuccess {Array} foods <code> List food per page <code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "get list food successfully!",
 *         foods:[
 *       {
 *           "_id": "6076c317ebb733360805137a",
 *           "typeId": 1,
 *           "name": "Orange juice",
 *           "unitPrice": 40000,
 *           "imageUrl": "https://res.cloudinary.com/dacnpm17n2/image/upload/v1618395927/syp4cyw7tjzxddyr8xxd.png",
 *           "createAt": "2021-04-14T10:25:27.376Z",
 *           "numOfStars": 3,
 *           "numOfFeedback": 1,
 *           "__v": 0
 *       }
 *  ]
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const getListFoodPerPage = async (req, res, next) => {
  console.log(LOG_TAG, "getListFoodPerPage begin!");
  try {
    let { page, searchText, foodType, orderBy, orderType } = req.query;
    console.log(
      "Query param before: ",
      `page= ${page}, textSearch= ${searchText}, foodType= ${foodType}, orderBy= ${orderBy}, orderType= ${orderType}`
    );
    page = page ? page : 1;
    searchText = searchText ? searchText : "";
    foodType = foodType ? foodType : true;
    orderBy = orderBy ? orderBy : "";
    orderType = orderType ? orderType : 1;
    const orderQuery = orderBy ? { [orderBy]: orderType } : {};
    console.log(
      "Query param after: ",
      `page= ${page}, textSearch= ${searchText}, foodType= ${foodType}, orderBy= ${orderBy}, orderType= ${orderType}`
    );

    const start = (page - 1) * numOfPerPage;
    console.log("start index= ", start);
    let totalNumOfFoods;
    let foods;
    if (searchText) {
      foods = await Food.find({
        $text: { $search: searchText },
        confirmed: foodType,
      })
        .skip(start)
        .limit(numOfPerPage)
        .sort(orderQuery);
      totalNumOfFoods = await Food.find({
        $text: { $search: searchText },
        confirmed: foodType,
      }).count();
    } else {
      foods = await Food.find({
        confirmed: foodType,
      })
        .skip(start)
        .limit(numOfPerPage)
        .sort(orderQuery);
      totalNumOfFoods = await Food.find({
        confirmed: foodType,
      }).count();
    }
    const totalPage = parseInt(totalNumOfFoods / numOfPerPage) + 1;
    console.log(`totalNumOfFood= ${totalNumOfFoods}, totalPage= ${totalPage}`);
    console.log("Total food list: ", foods.length);
    res.status(200).json({
      status: 200,
      msg: "Get foods successfully!",
      foods,
      totalPage,
    });
    console.log(LOG_TAG, "getListFoodPerPage end!");
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * @api {get} /api/v1/foods/:foodId Get food by foodId
 * @apiName Get food by foodId
 * @apiGroup Food
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>get food by id successfully</code> if everything went fine.
 * @apiSuccess {ObjecId} _id food's id
 * @apiSuccess {int} typeId food's typeId
 * @apiSuccess {string} name food's name
 * @apiSuccess {int} unitPrice food's unitPrice
 * @apiSuceess {string} imageUrl link of food image
 * @apiSuccess {double} numOfStars rate of food
 * @apiSuccess {object} feedbacks <code> List feedbacks <code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 201,
 *         msg: "get food successfully!",
 *         "_id": "6076c317ebb733360805137a",
 *         "typeId": 1,
 *         "name": "Orange juice",
 *         "unitPrice": 40000,
 *         "imageUrl": "https://res.cloudinary.com/dacnpm17n2/image/upload/v1618395927/syp4cyw7tjzxddyr8xxd.png",
 *         "createAt": "2021-04-14T10:25:27.376Z",
 *         "numOfStars": 3,
 *         "numOfFeedback": 1,
 *          "feedbacks": [
 *            {
 *              "_id": "607bb68228b9b81957c0aa3c",
 *              "foodId": "6076c317ebb733360805137a",
 *              "userId": "607bb6af8bdfa84b56021b57",
 *              "numOfStars": 3,
 *              "content": ""
 *            }
 *   ]
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const getFoodById = async (req, res, next) => {
  console.log(LOG_TAG, "getFoodById begin!");
  try {
    const foodId = req.params.foodId;
    console.log("FoodId :", foodId);
    let food = await Food.findById(foodId);
    let feedbacks = await Feedback.find({ foodId }).limit(2);
    feedbacks = feedbacks.map((item) => {
      return {
        _id: item._id,
        userName: item.userName,
        content: item.content,
        numOfStars: item.numOfStars,
        createAt: item.createAt,
        replies: item.reply,
      };
    });
    food = {
      ...food._doc,
      feedbacks,
    };
    console.log("Food: ", food);
    res.status(200).json({
      status: 200,
      msg: "Get food successfully!",
      food,
    });
    console.log(LOG_TAG, "getFoodById end!");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 * @api {post} /api/v1/foods Create new food
 * @apiName Create new food
 * @apiGroup Food
 * @apiParam {file} image food's image
 * @apiParam {string} name food's name
 * @apiParam {int} unitPrice food's unitPricemust be greater than 0
 * @apiParam {int} discountOff food's discountOff. Not required and value between 0-100 (curentcy = %)
 * @apiParam {int} discountMaximum food's discountMaximum. Not required
 * @apiParam {string} description food's description. Not required
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 201 </code>
 * @apiSuccess {String} msg <code>create food successfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 201 OK
 *     {
 *         status: 201,
 *         msg: "Create food successfully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const createNewFood = async (req, res, next) => {
  console.log(LOG_TAG, "createNewFood begin!");
  try {
    const { name, unitPrice, discountOff, description, discountMaximum } =
      req.body;
    console.log("file path: ", req.files[0].path);
    const image = await uploadSingle(req.files[0].path);
    const newFood = await Food.create({
      name,
      unitPrice,
      imageUrl: image.url,
      discountOff,
      description,
      discountMaximum,
    });
    console.log(image.url);
    // const io = MySocket.prototype.getInstance();
    // await io.emit("ListProduct", "Get list products");
    res.status(201).json({
      status: 201,
      msg: "Create new food successfully!",
      newFood,
    });
    console.log(LOG_TAG, "createNewFood end!");
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * @api {put} /api/v1/foods/:foodId Update food by foodId
 * @apiName Update food by foodId
 * @apiParam {string} name food's name
 * @apiParam {int} unitPrice food's unitPricemust be greater than 0
 * @apiParam {int} discountOff food's discountOff. Not required and value between 0-100 (curentcy = %)
 * @apiParam {int} discountMaximum food's discountMaximum. Not required
 * @apiParam {string} description food's description. Not required
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Update food successfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 201,
 *         msg: "Update food successfully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const updateFoodById = async (req, res, next) => {
  console.log((LOG_TAG, "updateFoodById begin!"));
  try {
    const { name, unitPrice, discountOff, description, discountMaximum } =
      req.body;
    console.log(req.body);
    const foodId = req.params.foodId;
    console.log("update foodId: ");
    const existedFood = await Food.findById(foodId);
    if (!existedFood) {
      throw createHttpError(404, "food id not exist!");
    }
    let imageUrl = req.body.imageUrl;
    if (req.files) {
      const asset_id = imageUrl.split("/").pop().split(".")[0];
      await deleteImage(asset_id);
      const image = await uploadSingle(req.files[0].path);
      imageUrl = image.url;
      console.log("New image url: ", imageUrl);
    }

    await Food.findByIdAndUpdate(foodId, {
      name,
      unitPrice,
      discountOff,
      description,
      discountMaximum,
      imageUrl,
    });
    const newFood = await Food.findById(foodId);
    res.status(200).json({
      status: 200,
      msg: "Update food successfully!",
      food: newFood,
    });

    console.log((LOG_TAG, "updateFoodById end!"));
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 * @api {delete} /api/v1/foods/:foodId Delete food by foodId
 * @apiName Delete food by foodId
 * @apiGroup Food
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code>Delete food successfully</code> if everything went fine.
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Delete food successfully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Role is invalid"
 *     }
 */
const deleteFoodById = async (req, res, next) => {
  try {
    const foodId = req.params.foodId;
    const existedFood = await Food.findById(foodId);
    if (!existedFood) {
      throw createHttpError(404, "Food is not found");
    }
    await Food.findByIdAndRemove(foodId);
    res.status(200).json({
      status: 200,
      msg: "Delete food successfully!",
      deleteFoodId: foodId,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 * @api {post} /api/v1/foods/:foodId Confirm food when create new one
 * @apiName Confirm food when create new one
 * @apiGroup Admin
 * @apiHeader {String} Authorization The token can be generated from your user profile.
 * @apiHeaderExample {Header} Header-Example
 *      "Authorization: Bearer AAA.BBB.CCC"
 * @apiSuccess {Number} status <code> 200 </code>
 * @apiSuccess {String} msg <code> Confirm successully</code>
 * @apiSuccessExample {json} Success-Example
 *     HTTP/1.1 200 OK
 *     {
 *         status: 200,
 *         msg: "Confirm successully!",
 *     }
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400
 *     {
 *       "status" : 400,
 *       "msg": "Not found"
 *     }
 **/
const confirmFood = async (req, res, next) => {
  try {
    const foodId = req.params.foodId;
    const food = await Food.findByIdAndUpdate(foodId, {
      confirmed: true,
    });
    if (!food) throw createHttpError(400, "Not found food by foodId!");
    res.status(200).json({
      status: 200,
      msg: "Confirm food successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const foodController = {
  getListFoodPerPage,
  getFoodById,
  createNewFood,
  updateFoodById,
  deleteFoodById,
  confirmFood,
};
