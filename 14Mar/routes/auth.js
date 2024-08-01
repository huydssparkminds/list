var express = require('express');
var router = express.Router();
var userModel = require('../model/user')
const OTPModel = require('../model/otp');
var ResHelper = require('../helper/ResponseHandle');
var Validator = require('../validators/user');
const { validationResult } = require('express-validator');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var configs = require('../config/config')
var sendEmail = require('../helper/sendEmail')

router.post('/login', async function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  console.log('username: ' + username, password);
  
  // Kiểm tra xem username và password có tồn tại không
  if (!username || !password) {
    ResHelper.ResponseSend(res, false, 404, 'Username và password phải điền đầy đủ');
    return;
  }

  // Tìm người dùng trong cơ sở dữ liệu
  let user = await userModel.findOne({ username: username });
  if (!user) {
    ResHelper.ResponseSend(res, false, 404, 'Username hoặc password không đúng');
    return;
  }

  // So sánh mật khẩu
  var checkpass = bcrypt.compareSync(password, user.password);
  if (checkpass) {
    // Tạo token
    const token = user.getJWT();
    
    // Thiết lập cookie với token
    res.cookie('token', token);
    
    // Tạo đối tượng chứa thông tin người dùng
    const userInfo = {
      id: user._id,
      username: user.username,
      email: user.email,
      // Thêm các thuộc tính khác nếu cần
    };

    // Gửi phản hồi với thông tin người dùng và token
    ResHelper.ResponseSend(res, true, 200, { token, user: userInfo });
  } else {
    ResHelper.ResponseSend(res, false, 404, 'Username hoặc password không đúng');
  }
});
router.post('/register', Validator.UserValidate(), async function (req, res, next) {
  var errors = validationResult(req).errors;
  if (errors.length > 0) {
    ResHelper.ResponseSend(res, false, 404, errors);
    return;
  }
  try {
    const existingUser = await userModel.findOne({username : req.body.username });
    if(existingUser) {
      ResHelper.ResponseSend(res, false, 400, "Tên người dùng đã tồn tại trong hệ thống.");
      return;
    }
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: ['USER']
    })
    await newUser.save();
    ResHelper.ResponseSend(res, true, 200, newUser)
  } catch (error) {
    ResHelper.ResponseSend(res, false, 404, error)
  }
});

router.post('/logout', function(req, res) {
  // Xóa cookie token
  res.clearCookie('token');
  // Gửi phản hồi cho client
  res.send({ success: true, message: 'Đăng xuất thành công' });
});

router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại.' });
    }

    // Tạo mã OTP ngẫu nhiên
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Lưu mã OTP vào cơ sở dữ liệu
    await OTPModel.create({ email: email, OTP: OTP });

    // Gửi mã OTP qua email
    const resetLink = `http://localhost:3000/ChangePassword?otp=${OTP}`;
    await sendEmail(email, `Đặt lại mật khẩu Mã OTP của bạn là: ${OTP}. Sử dụng mã này để đặt lại mật khẩu tại ${resetLink}`);

    return res.status(200).json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn.' });
  } catch (error) {
    console.error('Lỗi khi gửi mã OTP:', error);
    return res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại sau.' });
  }
});

router.post('/resetpassword', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Kiểm tra xem mã OTP có hợp lệ không
    const validOTP = await OTPModel.findOne({ email, OTP: otp });

    if (!validOTP) {
      return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ.' });
    }

    // Tìm người dùng và cập nhật mật khẩu mới
    const user = await userModel.findOne({ email });
  console.log(email, otp, newPassword ,user );

    user.password = newPassword;
    await user.save();

    // Xóa mã OTP sau khi đã sử dụng
    await OTPModel.deleteOne({ email, OTP: otp });

    return res.status(200).json({ success: true, message: 'Mật khẩu đã được đặt lại thành công.' });
  } catch (error) {
    console.error('Lỗi khi đặt lại mật khẩu:', error);
    return res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.' });
  }
});

module.exports = router;
