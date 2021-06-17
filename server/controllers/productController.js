const asyncHandler = require('express-async-handler');
const Comment = require('../models/comment');
const Product = require('../models/product');
const User = require('../models/user');
const { sendJSONResponse, sendMail, sendSms } = require('../utils');
const admin = require('firebase-admin');

const service = require('../config/firebaseConfig.js');

admin.initializeApp({
  credential: admin.credential.cert(service)
})

const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    distanceInMeters,
    address,
    geoDetails,
    image
  } = req.body;
  const user = await User.findOne({ email: req.user.email }).select('-salt -hash')
  const product = new Product();

  product.name = name;
  product.maxDistance = distanceInMeters;
  product.address = address;
  product.image = image;
  product.location = {
    type: 'Point',
    coordinates: geoDetails
  };
  product.createdBy = user;
  await product.save();

  const productReference = db.collection('Product').doc(name);
  await productReference.set({
    name,
    maxDistance: distanceInMeters,
    address,
    image,
    location: {
      type: 'Point',
      coordinates: geoDetails
    },
  })

  return sendJSONResponse(res, 'Product successfully created', 'success', 200, product);

})

const getProducts = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.user.email })
  const products = await Product.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: user.location.coordinates },
        distanceField: "distance"
      }
    },
    {
      $redact: {
        $cond: {
          if: { $lt: ["$distance", "$maxDistance"] },
          then: '$$KEEP',
          else: '$$PRUNE'
        }
      }
    }
  ])
  await Product.populate(products, { path: "createdBy", select: 'fullName email' });
  return sendJSONResponse(res, 'Products around your location', 'success', 200, products)
})

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    return sendJSONResponse(res, 'Products Details', 'success', 200, product)
  } else {
    sendJSONResponse(res, 'Product not found', 'success', 404, null)
  }
})

const comment = asyncHandler(async (req, res) => {
  const {
    body,
    productId,
    commentId,
  } = req.body;

  const user = await User.findOne({ email: req.user.email });
  const product = await Product.findOne({ _id: productId }).populate({ path: 'createdBy', select: 'fullName email' });

  if (!product) return sendJSONResponse(res, 'Product not found', 'error', 400, null);

  if (commentId) {
    const comment = await Comment.findOne({ _id: commentId }).populate({ path: 'createdBy', select: 'fullName email' })
    if (!comment) return sendJSONResponse(res, 'Comment has been deleted by user', 'error', 400)

    comment.replies.push({ body, createdBy: user })
    await comment.save()

    const data = {
      from: 'Testdepot <contact@samples.send.org>',
      to: comment.createdBy.email,
      subject: 'Someone replied to your comment',
      text: `${user.fullName} replied to your comment with ${body}`
    }
    sendMail(data)

    const to = user.phone.toString()
    const text = `${user.fullName} replied to your comment with ${body}`
    sendSms(to, text)
    return sendJSONResponse(res, 'Comment sent successfully', 'success', 200, comment);
  }
  const comment = new Comment();
  comment.body = body;
  comment.product = product
  comment.createdBy = user
  await comment.save()

  const data = {
    from: 'Testdepot <me@samples.send.org>',
    to: product.createdBy.email,
    subject: 'Someone commented on your product',
    text: `${user.fullName} commented on your product with ${body}`
  }
  sendMail(data)
  const to = user.phone.toString()
  const text = `${user.fullName} commented on your product with ${body}`
  sendSms(to, text)
  return sendJSONResponse(res, 'Comment sent successfully', 'success', 200, comment);
})

const getComments = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  const comments = await Comment.find({ product: product._id }).populate({ path: 'createdBy', select: 'fullName email' });

  if (comments) {
    return sendJSONResponse(res, 'Comments for Product', 'success', 200, comments);
  } else {
    return sendJSONResponse(res, 'Something went wrong', 'error', 500, null)
  }
})

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  getComments,
  comment
}