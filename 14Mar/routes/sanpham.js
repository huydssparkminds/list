var express = require('express');
var router = express.Router();
const sanphamModel = require('../model/sanpham')
var responseReturn = require('../helper/ResponseHandle')
const CategoryModel = require("../model/category");


const multer  = require('multer');
const upload = multer({ dest: os.tmpdir() });


router.get('/', async function(req, res, next) {
  try {
    let limit = req.query.limit; // Lấy giá trị của tham số "limit" từ request query
    let category = req.query.category; // Lấy giá trị của tham số "category" từ request query
    let sortBy = req.query.sortBy

    let query = {};
    if (category) {
      const categoryObject = await CategoryModel.findOne({ name: category }); // Tìm danh mục theo tên
      if (categoryObject) {
        query.category = categoryObject._id; // Sử dụng _id của danh mục tìm được trong truy vấn
      }
    
    }

    let orderdata;
    if (limit) {
      if (sortBy === 'price') {
        orderdata = await sanphamModel.find(query).limit(parseInt(limit)).sort({ price: 1 }).populate('category', 'name');
      } else if (sortBy === 'name') {
        orderdata = await sanphamModel.find(query).limit(parseInt(limit)).sort({ name: 1 }).populate('category', 'name');
      } else {
        orderdata = await sanphamModel.find(query).limit(parseInt(limit)).populate('category', 'name');
      }
    } else {
      if (sortBy === 'price') {
        orderdata = await sanphamModel.find(query).sort({ price: 1 }).populate('category', 'name');
      } else if (sortBy === 'name') {
        orderdata = await sanphamModel.find(query).sort({ name: 1 }).populate('category', 'name');
      } else {
        orderdata = await sanphamModel.find(query).populate('category', 'name');
      }
    }


    responseReturn.ResponseSend(res, true, 200, orderdata);
  } catch (error) {
    console.error(error); 
    res.status(500).send('Server Error');
  }
});
router.get("/:id", async function (req, res, next) {
  const productId = req.params.id; // Lấy id từ request params
  try {
    const product = await sanphamModel.findById(productId).populate('category', 'name');

    if (!product) {
      // Kiểm tra nếu không tìm thấy sản phẩm
      return res.status(404).json({ message: "Product not found" });
    }
    responseReturn.ResponseSend(res, true, 200, product)
   
  } catch (error) {
    console.error(error); // Log lỗi nếu có
    res.status(500).send("Server Error"); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
});
// Thêm dữ liệu mới
router.post("/add", async function (req, res, next) {
  try {
    // Lấy dữ liệu từ request body
    const { title, description, price, linkImg, categoryName } = req.body;
    
    // Tìm hoặc tạo mới danh mục từ tên được cung cấp
    let category = await CategoryModel.findOne({ name: categoryName });
    if (!category) {
      // Nếu danh mục không tồn tại, tạo một danh mục mới
      category = new CategoryModel({ name: categoryName });
      await category.save();
    }

    // Tạo một document mới từ model sản phẩm
    const newProduct = new sanphamModel({
      title,
      description,
      price,
      linkImg,
      category: category._id // Lưu id của danh mục
    });

    // Lưu document vào cơ sở dữ liệu
    const savedProduct = await newProduct.save();
    // Trả về kết quả
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error); // Log lỗi nếu có
    res.status(500).send("Server Error"); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
});

// Cập nhật dữ liệu
router.put("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { title,description, price, linkImg ,categoryName  } = req.body;
    const updatedProduct = await sanphamModel.findByIdAndUpdate(id, {
      title,
      description,
      price,
      linkImg,
      category: {
        name: categoryName // lưu tên danh mục trong trường category của sản phẩm
      }
      
    }, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Xóa dữ liệu
router.delete("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const deletedProduct = await sanphamModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


router.post('/upload', upload.single('file'), function(req, res) {
  const title = req.body.title;
  const file = req.file;

  console.log(title);
  console.log(file);

  res.sendStatus(200);
});
module.exports = router;
