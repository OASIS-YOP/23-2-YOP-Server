import multer from "multer";
import upload from "../modules/multer";

const util = {
  success: (status, message, data)=>{
    return {
      status: status,
      success: true,
      message: message,
      data: data
    }
  },
  fail: (status, message)=>{
    return{
      status: status,
      success: false,
      message: message
    }
  }
}

export const uploadImage = async (req, res) => {
  console.log(req.file);
  console.log('s3 이미지 경로 :', req.file.location);
  const image = req.file.location;
  if (image === undefined) {
    return res.status(400).send(util.fail(400, "이미지가 존재하지 않습니다."));
  }
  res.status(200).send(util.success(200, "요청 성공", image));
};

// export const uploadImages = async (req, res) => {
//   const image = req.files;
//   const path = image.map(img => img.location);
//   if (image === undefined) {
//     return res.status(400).send(util.fail(400, "이미지가 존재하지 않습니다."));
//   }
//   res.status(200).send(util.success(200, "요청 성공", path));
// };

