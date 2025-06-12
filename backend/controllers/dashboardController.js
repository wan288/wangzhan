const Order = require('../models/Order');
const Dish = require('../models/Dish');
const User = require('../models/User');

// @desc    获取仪表盘统计数据
// @route   GET /api/dashboard
// @access  Private/Admin/Merchant
const getDashboardStats = async (req, res) => {
  try {
    console.log('[DashboardController] Fetching dashboard stats...');

    // 今日订单和销售额
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    console.log('[DashboardController] Querying today orders...');
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'cancelled' } // 不计算已取消的订单
    });
    console.log(`[DashboardController] Today orders: ${todayOrders}`);

    console.log('[DashboardController] Querying today revenue...');
    const todayRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lte: endOfToday },
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid' // 只计算已支付的订单
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;
    console.log(`[DashboardController] Today revenue: ${todayRevenue}`);

    // 总菜品数
    console.log('[DashboardController] Querying total dishes...');
    const totalDishes = await Dish.countDocuments({});
    console.log(`[DashboardController] Total dishes: ${totalDishes}`);

    // 总用户数 (排除管理员，如果需要)
    console.log('[DashboardController] Querying total users...');
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    console.log(`[DashboardController] Total users: ${totalUsers}`);

    // 近7天销售额
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 6天前 + 今天 = 7天
    sevenDaysAgo.setHours(0, 0, 0, 0);

    console.log('[DashboardController] Querying last 7 days revenue...');
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          dailyRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    console.log('[DashboardController] Revenue by day:', revenueByDay);

    // 填充近7天数据，确保每天都有值，没有则为0
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const revenueChartData = dates.map(date => {
      const found = revenueByDay.find(item => item._id === date);
      return { date: date.slice(5), revenue: found ? found.dailyRevenue : 0 }; // 只显示月日
    });

    // 菜品销售排行 (按销售数量)
    console.log('[DashboardController] Querying top selling dishes...');
    const topSellingDishes = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.name',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 5 // 获取前5名
      }
    ]);
    console.log('[DashboardController] Top selling dishes:', topSellingDishes);

    const dishSalesChartData = topSellingDishes.map(item => ({
      name: item._id,
      value: item.totalSold
    }));

    console.log('[DashboardController] Final revenueChartData:', revenueChartData); // DEBUG: Log final data
    console.log('[DashboardController] Final dishSalesChartData:', dishSalesChartData); // DEBUG: Log final data

    res.status(200).json({
      code: 200,
      message: '仪表盘数据获取成功',
      data: {
        todayOrders,
        todayRevenue,
        totalDishes,
        totalUsers,
        revenueChartData,
        dishSalesChartData
      }
    });
  } catch (error) {
    console.error('[DashboardController] Error fetching dashboard data:', error);
    res.status(500).json({ code: 500, message: '服务器错误，无法获取仪表盘数据' });
  }
};

module.exports = {
  getDashboardStats,
}; 