const Order = require('../models/Order');
const Dish = require('../models/Dish');

// @desc    创建新订单
// @route   POST /api/orders
// @access  Private/Customer
const createOrder = async (req, res) => {
  const { items, deliveryInfo } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: '购物车为空' });
  }

  try {
    // 验证菜品信息并计算总金额
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const dish = await Dish.findById(item.dish); // item.dish 应该是菜品的 ObjectId
      if (!dish) {
        return res.status(404).json({ message: `菜品未找到: ${item.name}` });
      }
      // 确保价格匹配，防止客户端篡改
      if (dish.price !== item.price) {
        return res.status(400).json({ message: `菜品价格不匹配: ${item.name}` });
      }

      orderItems.push({
        dish: dish._id,
        name: dish.name,
        image: dish.image,
        quantity: item.quantity,
        price: dish.price,
      });
      totalAmount += dish.price * item.quantity;
    }

    const order = new Order({
      user: req.user.id, // req.user 由 authMiddleware 提供
      items: orderItems,
      totalAmount: totalAmount,
      deliveryInfo,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取所有订单 (管理员/商家)
// @route   GET /api/orders
// @access  Private/Admin/Merchant
const getAllOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find({}).populate('user', 'username email').populate('items.dish', 'name image');
    } else if (req.user.role === 'merchant') {
      // 商家只能看自己的订单，这里需要根据实际业务逻辑来定义
      // 比如，一个商家可能只负责处理特定菜品的订单，或者与用户位置相关联
      // 简单起见，目前让商家可以看到所有订单 (这可能需要更细致的授权)
      orders = await Order.find({}).populate('user', 'username email').populate('items.dish', 'name image');
    } else {
      return res.status(403).json({ message: '无权限访问' });
    }
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取我的订单 (客户)
// @route   GET /api/orders/myorders
// @access  Private/Customer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.dish', 'name image').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取单个订单详情
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findById(orderId).populate('user', 'username email');
    if (!order) {
      return res.status(404).json({ message: '未找到该订单' });
    }
    // 检查权限：只有订单的创建者（客户）或商家（管理员）可以查看
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'merchant') {
      return res.status(403).json({ message: '无权查看此订单' });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '获取订单详情失败' });
  }
};

// @desc    更新订单状态 (商家/管理员)
// @route   PUT /api/orders/:id/status
// @access  Private/Merchant/Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // 验证状态是否合法
      const validStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: '无效的订单状态' });
      }
      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: '订单未找到' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新订单支付状态 (管理员/支付回调)
// @route   PUT /api/orders/:id/paymentStatus
// @access  Private/Admin
const updateOrderPaymentStatus = async (req, res) => {
  const { paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const validPaymentStatuses = ['pending', 'paid', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: '无效的支付状态' });
      }
      order.paymentStatus = paymentStatus;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: '订单未找到' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除订单 (管理员)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (order) {
      res.json({ message: '订单已删除' });
    } else {
      res.status(404).json({ message: '订单未找到' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    取消订单 (客户)
// @route   PATCH /api/orders/:id/cancel (实际路由可能不同，这里是示例)
// @access  Private/Customer
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: '订单未找到' });
    }

    // 确保只有订单的创建者（客户）可以取消
    // req.user.id 是认证中间件设置的用户ID
    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: '无权取消此订单' });
    }

    // 确保订单处于可取消状态 (例如，pending 或 processing)
    // 根据你的业务逻辑调整可取消的状态
    if (order.status === 'completed' || order.status === 'cancelled' || order.status === 'shipping') {
      return res.status(400).json({ message: '此订单无法取消或已完成' });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  deleteOrder,
  cancelOrder,
}; 