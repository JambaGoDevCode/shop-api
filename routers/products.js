const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};
// update images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //validate de file
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Formato inválido');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// get List of products and filter de category
router.get(`/`, async (req, res) => {
  console.log(req);
  let filter = {};
  if (req.query.category) {
    filter = { category: req.query.category.split(',') };
  }

  const productList = await Product.find(filter).populate('category');

  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

// get only one product
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

// post - Create new product
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Categoria invalida');

  const file = req.file;
  if (!file) return res.status(400).send('Adicione uma imagem');

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send('Este produto não pode ser criado');
  res.send(product);
});

// update de product
router.put(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('O nome do produto é invalido!');
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Categoria invalida');

  let product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!product)
    return res.status(500).send(' Está produto não pode ser atualizada');

  res.send(product);
});

// delete product
router.delete('/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: 'O produto foi eliminado!',
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrada.',
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

// get count the number of products
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.find({}).count();

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

// get count the number of products
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const product = await Product.find({ isFeatured: true }).limit(+count);

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

// Uploads images array of gallery product
router.put(
  '/gallery-images/:id',
  uploadOptions.array('images', 3),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('O nome do produto é invalido!');
    }

    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    let product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product)
      return res.status(500).send('Este product não pode ser atualizado!');

    res.send(product);
  }
);

module.exports = router;
