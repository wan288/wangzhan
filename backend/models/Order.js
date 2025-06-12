const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  dish: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Dish',
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    deliveryInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      required: true,
      default: 'pending',
    },
    // 可以添加支付方式、支付结果等字段
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 