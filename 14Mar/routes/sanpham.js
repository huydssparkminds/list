var express = require("express");
const path = require("path");
var router = express.Router();
const sanphamModel = require("../model/sanpham");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary')
var responseReturn = require("../helper/ResponseHandle");
const CategoryModel = require("../model/category");
const os = require("os");
const multer = require("multer");

// Cấu hình Cloudinary
cloudinary.config({ 
  cloud_name: 'dgi6g4fux', 
  api_key: '969431646287836', 
  api_secret: 'MPiu4DDf6VVHEHUKFRwR0F-mySs' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    format: async (req, file) => 'png', 
    public_id: (req, file) => `${file.fieldname}_${Date.now()}`,
  },
});


const upload = multer({ storage: storage });

router.get("/", async function (req, res, next) {
  try {
    let limit = req.query.limit; // Lấy giá trị của tham số "limit" từ request query
    let category = req.query.category; // Lấy giá trị của tham số "category" từ request query
    let sortBy = req.query.sortBy;

    let query = {};
    if (category) {
      const categoryObject = await CategoryModel.findOne({ name: category }); // Tìm danh mục theo tên
      if (categoryObject) {
        query.category = categoryObject._id; // Sử dụng _id của danh mục tìm được trong truy vấn
      }
    }

    let orderdata;
    if (limit) {
      if (sortBy === "price") {
        orderdata = await sanphamModel
          .find(query)
          .limit(parseInt(limit))
          .sort({ price: 1 })
          .populate("category", "name");
      } else if (sortBy === "name") {
        orderdata = await sanphamModel
          .find(query)
          .limit(parseInt(limit))
          .sort({ name: 1 })
          .populate("category", "name");
      } else {
        orderdata = await sanphamModel
          .find(query)
          .limit(parseInt(limit))
          .populate("category", "name");
      }
    } else {
      if (sortBy === "price") {
        orderdata = await sanphamModel
          .find(query)
          .sort({ price: 1 })
          .populate("category", "name");
      } else if (sortBy === "name") {
        orderdata = await sanphamModel
          .find(query)
          .sort({ name: 1 })
          .populate("category", "name");
      } else {
        orderdata = await sanphamModel.find(query).populate("category", "name");
      }
    }

    responseReturn.ResponseSend(res, true, 200, orderdata);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/:id", async function (req, res, next) {
  const productId = req.params.id; // Lấy id từ request params
  try {
    const product = await sanphamModel
      .findById(productId)
      .populate("category", "name");

    if (!product) {
      // Kiểm tra nếu không tìm thấy sản phẩm
      return res.status(404).json({ message: "Product not found" });
    }
    responseReturn.ResponseSend(res, true, 200, product);
  } catch (error) {
    console.error(error); // Log lỗi nếu có
    res.status(500).send("Server Error"); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
});
router.post("/add", upload.single("file"), async function (req, res) {
  try {
    const { title, description, price, categoryName } = req.body;
    const file = req.file;
  
    console.log("Product Info:", title);
    console.log("Uploaded File:", file);
    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    let category = await CategoryModel.findOne({ name: categoryName });
    if (!category) {
      category = new CategoryModel({ name: categoryName });
      await category.save();
    }

    const newProduct = new sanphamModel({
      title,
      description,
      price,
      linkImg: file.path, // Cloudinary sẽ trả về URL của ảnh đã upload
      category: category._id,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Server Error: " + error.message);
  }
});

// Cập nhật dữ liệu
router.put("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, price, linkImg, categoryName } = req.body;
    const updatedProduct = await sanphamModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        linkImg,
        category: {
          name: categoryName, // lưu tên danh mục trong trường category của sản phẩm
        },
      },
      { new: true }
    );
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
    const { id } = req.body;
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

router.post("/upload", upload.single("file"), function (req, res) {
  const title = req.body.title;
  const file = req.file;

  console.log(title);
  console.log(file);

  res.json({ message: "OK" });
});
module.exports = router;
