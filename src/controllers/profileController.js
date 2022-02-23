import { UserDetail } from "../models";
import { uploadSingle, deleteImage } from "../configs";

const getProfileById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await UserDetail.findOne({ userId });
    console.log(profile);

    res.status(200).json({
      status: 200,
      msg: "Get profile successfully!",
      profile,
    });
  } catch (error) {
    console.log();
    next(error);
  }
};

const updateProfileById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fullName, phoneNumber, birthday, address } = req.body;
    await UserDetail.findOneAndUpdate(
      { userId },
      {
        fullName,
        phoneNumber,
        birthday,
        address,
      }
    );
    const profile = await UserDetail.findOne({ userId });
    res.status(200).json({
      status: 200,
      msg: "Update profile sucessfully!",
      profile,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userDetail = await UserDetail.findOne({ userId });
    const image = await uploadSingle(req.files[0].path);
    const newAvatar = image.url;
    await UserDetail.findOneAndUpdate(userId, {
      imageUrl: newAvatar,
    });
    if (userDetail.imageUrl) {
      const asset_id = userDetail.imageUrl.split("/").pop().split(".")[0];
      await deleteImage(asset_id);
    }

    res.status(200).json({
      status: 200,
      msg: "Update avatar successfully!",
      newAvatar,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const profileController = {
  getProfileById,
  updateAvatar,
  updateProfileById,
};
