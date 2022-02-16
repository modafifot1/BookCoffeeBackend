import { UserDetail } from "../models";

const getProfileById = async (res, req, next) => {
  try {
    const userId = req.user._id;
    const profile = await UserDetail.findOne({ userId });
    res.status(200).json({
      status: 200,
      msg: "Get profile successfully!",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileById = async (res, req, next) => {
  try {
    const userId = req.user._id;
    const { fullName, phoneNumber, birthday, address } = req.body;
    const profile = await UserDetail.findOneAndUpdate(
      { userId },
      {
        fullName,
        phoneNumber,
        birthday,
        address,
      }
    );
    res.status(200).json({
      status: 200,
      msg: "Update profile sucessfully!",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (res, req, next) => {
  try {
    const userId = req.user._id;
    const userDetail = await UserDetail.findOne({ userId });
    const image = await uploadSingle(req.files[0].path);
    const newAvatar = image.url;
    await UserDetail.findByIdAndUpdate(userId, {
      imageUrl: newAvatar,
    });
    const asset_id = userDetail.imageUrl.split("/").pop().split(".")[0];
    await deleteImage(asset_id);

    res.status(200).json({
      status: 200,
      msg: "Update avatar successfully!",
      newAvatar,
    });
    console.log("New image url: ", imageUrl);
  } catch (error) {}
};
export const profileController = {
  getProfileById,
  updateAvatar,
  updateProfileById,
};
