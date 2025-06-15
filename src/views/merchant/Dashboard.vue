<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="data-cards">
      <el-col :span="6">
        <el-card class="card-item" shadow="hover">
          <div class="card-content">
            <el-icon class="card-icon" color="#409EFF"><Tickets /></el-icon>
            <div class="card-info">
              <div class="card-title">今日订单</div>
              <div class="card-value">{{ dashboardData.todayOrders }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="card-item" shadow="hover">
          <div class="card-content">
            <el-icon class="card-icon" color="#67C23A"><Coin /></el-icon>
            <div class="card-info">
              <div class="card-title">今日销售额</div>
              <div class="card-value">¥{{ dashboardData.todaySales.toFixed(2) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="card-item" shadow="hover">
          <div class="card-content">
            <el-icon class="card-icon" color="#E6A23C"><User /></el-icon>
            <div class="card-info">
              <div class="card-title">今日新用户</div>
              <div class="card-value">{{ dashboardData.newUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="card-item" shadow="hover">
          <div class="card-content">
            <el-icon class="card-icon" color="#909399"><Dish /></el-icon>
            <div class="card-info">
              <div class="card-title">平均客单价</div>
              <div class="card-value">¥{{ dashboardData.averageOrderValue.toFixed(2) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-and-hot-dishes">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>近7日销售趋势</span>
            </div>
          </template>
          <div id="sales-chart" style="height: 300px;"></div>
          <el-empty v-if="!salesChartData.series[0].data.length" description="暂无数据"></el-empty>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="hot-dishes-card">
          <template #header>
            <div class="card-header">
              <span>热门菜品排行</span>
            </div>
          </template>
          <el-table :data="hotDishes" style="width: 100%" :show-header="false">
            <el-table-column type="index" label="排名" width="60">
              <template #default="scope">
                <el-tag :type="scope.$index < 3 ? 'danger' : 'info'" size="small">{{ scope.$index + 1 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="菜品名称"></el-table-column>
            <el-table-column prop="sales" label="销量" width="80" align="right"></el-table-column>
          </el-table>
          <el-empty v-if="!hotDishes.length" description="暂无数据"></el-empty>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="recent-orders-card">
      <template #header>
        <div class="card-header">
          <span>最新订单</span>
          <el-button type="text" @click="router.push('/merchant/orders')">查看更多</el-button>
        </div>
      </template>
      <el-table :data="recentOrders" style="width: 100%">
        <el-table-column prop="orderId" label="订单号" width="180"></el-table-column>
        <el-table-column prop="customerName" label="顾客姓名" width="120"></el-table-column>
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="orderStatusTagType[scope.row.status]">{{ orderStatusMap[scope.row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="下单时间"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="viewOrderDetails(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!recentOrders.length" description="暂无订单"></el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Tickets, Coin, User, Dish } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()

const dashboardData = reactive({
  todayOrders: 128,
  todaySales: 2568.50,
  newUsers: 15,
  averageOrderValue: 20.07
})

const salesChartData = reactive({
  xAxisData: ['07-10', '07-11', '07-12', '07-13', '07-14', '07-15', '07-16'],
  series: [
    {
      name: '销售额',
      type: 'line',
      data: [1200, 1500, 1300, 1800, 1600, 2000, 2568.50]
    }
  ]
})

const hotDishes = ref([
  { id: 1, name: '巨无霸汉堡', sales: 500 },
  { id: 2, name: '香辣鸡腿堡', sales: 450 },
  { id: 3, name: '薯条(大)', sales: 400 },
  { id: 4, name: '可口可乐', sales: 380 },
  { id: 5, name: '奥尔良烤翅', sales: 320 }
])

const recentOrders = ref([
  { orderId: '20240716001', customerName: '张三', totalAmount: 55.00, status: 'pending', orderTime: '2024-07-16 10:30:00' },
  { orderId: '20240716002', customerName: '李四', totalAmount: 78.50, status: 'processing', orderTime: '2024-07-16 11:00:00' },
  { orderId: '20240716003', customerName: '王五', totalAmount: 32.00, status: 'completed', orderTime: '2024-07-16 11:15:00' },
  { orderId: '20240716004', customerName: '赵六', totalAmount: 45.00, status: 'cancelled', orderTime: '2024-07-16 11:45:00' },
  { orderId: '20240716005', customerName: '孙七', totalAmount: 99.90, status: 'completed', orderTime: '2024-07-16 12:00:00' }
])

const orderStatusMap = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消'
}

const orderStatusTagType = {
  pending: '',
  processing: 'warning',
  completed: 'success',
  cancelled: 'danger'
}

const initSalesChart = () => {
  const chartDom = document.getElementById('sales-chart')
  if (chartDom) {
    const myChart = echarts.init(chartDom)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: salesChartData.xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: salesChartData.series
    }
    myChart.setOption(option)
    window.addEventListener('resize', () => myChart.resize())
  }
}

const viewOrderDetails = (order) => {
  console.log('查看订单详情:', order)
  // TODO: Navigate to order detail page or open a dialog
}

onMounted(() => {
  initSalesChart()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  /* padding: 20px; */ /* 移除 padding，由父级 el-main 处理 */
  background-color: #f0f2f5;
  width: 100%; /* 确保仪表盘容器占据全部宽度 */

  .data-cards {
    margin-bottom: 20px;
    width: 100%; /* 确保数据卡片行占据全部宽度 */

    .card-item {
      border-radius: 8px;
      .card-content {
        display: flex;
        align-items: center;
        .card-icon {
          font-size: 48px;
          margin-right: 15px;
        }
        .card-info {
          .card-title {
            font-size: 16px;
            color: #666;
            margin-bottom: 5px;
          }
          .card-value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
          }
        }
      }
    }
  }

  .chart-and-hot-dishes {
    margin-bottom: 20px;
    width: 100%; /* 确保图表和热门菜品行占据全部宽度 */

    .chart-card, .hot-dishes-card {
      border-radius: 8px;
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }

  .recent-orders-card {
    width: 100%; /* 确保最新订单卡片占据全部宽度 */
    border-radius: 8px;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
    }
  }

  // ECharts 容器样式，确保其有高度
  #sales-chart {
    width: 100%;
    height: 300px; // 确保图表容器有高度
  }
}
</style> 