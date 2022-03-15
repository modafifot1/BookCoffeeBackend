import { UserDetail, User } from "../models";
import { uploadSingle, deleteImage } from "../configs";

const getProfileById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let profile = await UserDetail.findOne({ userId });
    const account = await User.findById(userId);
    profile = {
      ...profile._doc,
      email: account.email,
    };
    console.log(profile);

    res.status(200).json({
      status: 200,
      msg: "Lấy thông tin cá nhân thành công!",
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
    let profile = await UserDetail.findOne({ userId });
    const account = await User.findById(userId);
    profile = {
      ...profile._doc,
      email: account.email,
    };
    res.status(200).json({
      status: 200,
      msg: "Cập nhật thông tin cá nhân thành công!",
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
    if (userDetail.imageUrl) {
      const asset_id = userDetail.imageUrl.split("/").pop().split(".")[0];
      await deleteImage(asset_id);
    }
    await UserDetail.findOneAndUpdate(
      { userId },
      {
        imageUrl: newAvatar,
      }
    );

    res.status(200).json({
      status: 200,
      msg: "Cập nhật avatar thành công!",
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
