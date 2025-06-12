<template>
  <div class="order-mgr-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div>
            <el-button :icon="Download">导出</el-button>
            <el-button :icon="Printer">打印</el-button>
          </div>
        </div>
      </template>

      <div class="search-filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索订单号/顾客姓名"
          clearable
          style="width: 250px; margin-right: 10px;"
          @keyup.enter="fetchOrderList"
        ></el-input>
        <el-select v-model="selectedStatus" placeholder="选择订单状态" clearable style="width: 150px; margin-right: 10px;" @change="fetchOrderList">
          <el-option label="待处理" value="pending"></el-option>
          <el-option label="处理中" value="processing"></el-option>
          <el-option label="已完成" value="completed"></el-option>
          <el-option label="已取消" value="cancelled"></el-option>
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          style="width: 280px;"
          @change="fetchOrderList"
        />
        <el-button :icon="Search" style="margin-left: 10px;" @click="fetchOrderList">搜索</el-button>
      </div>

      <el-row :gutter="20" class="order-stats-cards">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#67C23A"><Check /></el-icon>
              <div class="stat-info">
                <div class="stat-title">今日完成订单</div>
                <div class="stat-value">{{ orderStats.todayCompletedOrders }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#409EFF"><Tickets /></el-icon>
              <div class="stat-info">
                <div class="stat-title">今日总订单</div>
                <div class="stat-value">{{ orderStats.todayTotalOrders }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#E6A23C"><Coin /></el-icon>
              <div class="stat-info">
                <div class="stat-title">今日销售额</div>
                <div class="stat-value">¥{{ orderStats.todaySales.toFixed(2) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <el-icon class="stat-icon" color="#909399"><Warning /></el-icon>
              <div class="stat-info">
                <div class="stat-title">待处理订单</div>
                <div class="stat-value">{{ orderStats.pendingOrders }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>近7日订单量趋势</span>
          </div>
        </template>
        <div id="order-chart" style="height: 300px;"></div>
        <el-empty v-if="!orderChartData.series[0].data.length" description="暂无数据"></el-empty>
      </el-card>

      <el-table :data="paginatedOrders" style="width: 100%; margin-top: 20px;" v-loading="loading">
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 0 50px;">
              <p><b>订单号:</b> {{ props.row.orderId }}</p>
              <p><b>下单时间:</b> {{ props.row.orderTime }}</p>
              <p><b>顾客姓名:</b> {{ props.row.consignee }}</p>
              <p><b>联系电话:</b> {{ props.row.phone }}</p>
              <p><b>收货地址:</b> {{ props.row.address }}</p>
              <p><b>备注:</b> {{ props.row.remark || '无' }}</p>
              <p><b>总金额:</b> ¥{{ props.row.totalAmount.toFixed(2) }}</p>
              <p><b>订单状态:</b> <el-tag :type="orderStatusTagType[props.row.status]">{{ orderStatusMap[props.row.status] }}</el-tag></p>
              <el-divider>订单商品</el-divider>
              <el-table :data="props.row.items" style="width: 100%; margin-bottom: 20px;" size="small">
                <el-table-column prop="name" label="商品名称"></el-table-column>
                <el-table-column prop="price" label="单价"></el-table-column>
                <el-table-column prop="quantity" label="数量"></el-table-column>
                <el-table-column label="小计">
                  <template #default="scope">
                    ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderId" label="订单号" width="180"></el-table-column>
        <el-table-column prop="consignee" label="顾客姓名" width="120"></el-table-column>
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
        <el-table-column prop="orderTime" label="下单时间" width="180"></el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="viewOrderDetails(scope.row)">详情</el-button>
            <el-button
              link
              type="success"
              size="small"
              v-if="scope.row.status === 'pending'"
              @click="updateOrderStatus(scope.row.orderId, 'processing')"
            >接受</el-button>
            <el-button
              link
              type="success"
              size="small"
              v-if="scope.row.status === 'processing'"
              @click="updateOrderStatus(scope.row.orderId, 'completed')"
            >完成</el-button>
            <el-button
              link
              type="danger"
              size="small"
              v-if="scope.row.status === 'pending' || scope.row.status === 'processing'"
              @click="updateOrderStatus(scope.row.orderId, 'cancelled')"
            >取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredOrders.length"
        background
        style="margin-top: 20px; text-align: right;"
      ></el-pagination>

      <el-empty v-if="!loading && filteredOrders.length === 0" description="暂无订单数据"></el-empty>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="showOrderDetailDialog"
      title="订单详情"
      width="600px"
      :before-close="handleCloseOrderDetailDialog"
    >
      <el-form :model="currentOrder" label-width="100px" v-if="currentOrder">
        <el-form-item label="订单号:">{{ currentOrder.orderId }}</el-form-item>
        <el-form-item label="下单时间:">{{ currentOrder.orderTime }}</el-form-item>
        <el-form-item label="顾客姓名:">{{ currentOrder.consignee }}</el-form-item>
        <el-form-item label="联系电话:">{{ currentOrder.phone }}</el-form-item>
        <el-form-item label="收货地址:">{{ currentOrder.address }}</el-form-item>
        <el-form-item label="备注:">{{ currentOrder.remark || '无' }}</el-form-item>
        <el-form-item label="总金额:">¥{{ currentOrder.totalAmount ? currentOrder.totalAmount.toFixed(2) : '0.00' }}</el-form-item>
        <el-form-item label="订单状态:">
          <el-tag :type="orderStatusTagType[currentOrder.status]">{{ orderStatusMap[currentOrder.status] }}</el-tag>
        </el-form-item>
        <el-form-item label="订单商品:">
          <el-table :data="currentOrder.items" style="width: 100%;" size="small">
            <el-table-column prop="name" label="商品名称"></el-table-column>
            <el-table-column prop="price" label="单价"></el-table-column>
            <el-table-column prop="quantity" label="数量"></el-table-column>
            <el-table-column label="小计">
              <template #default="scope">
                ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseOrderDetailDialog">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download, Printer, Tickets, Coin, Check, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const dateRange = ref([])
const orders = ref([])

const orderStats = reactive({
  todayCompletedOrders: 85,
  todayTotalOrders: 120,
  todaySales: 1850.75,
  pendingOrders: 15
})

const orderChartData = reactive({
  xAxisData: ['07-10', '07-11', '07-12', '07-13', '07-14', '07-15', '07-16'],
  series: [
    {
      name: '订单量',
      type: 'line',
      data: [80, 95, 75, 110, 90, 105, 120]
    }
  ]
})

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

const dateShortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

const showOrderDetailDialog = ref(false)
const currentOrder = ref(null)

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

const filteredOrders = computed(() => {
  let result = orders.value

  if (searchQuery.value) {
    result = result.filter(order =>
      order.orderId.includes(searchQuery.value) ||
      order.consignee.includes(searchQuery.value)
    )
  }

  if (selectedStatus.value) {
    result = result.filter(order => order.status === selectedStatus.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = dateRange.value[0].getTime()
    const endDate = dateRange.value[1].getTime()
    result = result.filter(order => {
      const orderTime = new Date(order.orderTime).getTime()
      return orderTime >= startDate && orderTime <= endDate
    })
  }
  return result
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const fetchOrderList = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    orders.value = [
      { orderId: '20240716001', consignee: '张三', phone: '13800138000', address: '某市某区某街1号', remark: '', totalAmount: 55.00, status: 'pending', orderTime: '2024-07-16 10:30:00', items: [{ name: '巨无霸汉堡', price: 25.00, quantity: 1 }, { name: '薯条(大)', price: 15.00, quantity: 1 }, { name: '可口可乐', price: 8.00, quantity: 1 }]},
      { orderId: '20240716002', consignee: '李四', phone: '13911112222', address: 'XX市XX区XX街道2号', remark: '', totalAmount: 78.50, status: 'processing', orderTime: '2024-07-16 11:00:00', items: [{ name: '香辣鸡腿堡', price: 22.00, quantity: 2 }, { name: '奥尔良烤翅', price: 18.00, quantity: 2 }] },
      { orderId: '20240716003', consignee: '王五', phone: '13033334444', address: 'XX市XX区XX街道3号', remark: '加冰', totalAmount: 32.00, status: 'completed', orderTime: '2024-07-16 11:15:00', items: [{ name: '圣代', price: 10.00, quantity: 1 }, { name: '可口可乐', price: 8.00, quantity: 2 }] },
      { orderId: '20240716004', consignee: '赵六', phone: '13144445555', address: 'XX市XX区XX街道4号', remark: '', totalAmount: 45.00, status: 'cancelled', orderTime: '2024-07-16 11:45:00', items: [{ name: '巨无霸汉堡', price: 25.00, quantity: 1 }, { name: '薯条(大)', price: 15.00, quantity: 1 }] },
      { orderId: '20240716005', consignee: '孙七', phone: '13255556666', address: 'XX市XX区XX街道5号', remark: '尽快送达', totalAmount: 99.90, status: 'completed', orderTime: '2024-07-16 12:00:00', items: [{ name: '超值全家桶', price: 89.00, quantity: 1 }] },
      { orderId: '20240715001', consignee: '周八', phone: '13366667777', address: 'XX市XX区XX街道6号', remark: '', totalAmount: 60.00, status: 'completed', orderTime: '2024-07-15 09:00:00', items: [{ name: '香辣鸡腿堡', price: 22.00, quantity: 1 }, { name: '吮指原味鸡', price: 12.00, quantity: 2 }] },
      { orderId: '20240715002', consignee: '吴九', phone: '13477778888', address: 'XX市XX区XX街道7号', remark: '多给酱', totalAmount: 40.00, status: 'completed', orderTime: '2024-07-15 09:30:00', items: [{ name: '薯条(大)', price: 15.00, quantity: 1 }, { name: '圣代', price: 10.00, quantity: 1 }, { name: '可口可乐', price: 8.00, quantity: 1 }] },
    ]
    loading.value = false
  }, 500)
}

const initOrderChart = () => {
  const chartDom = document.getElementById('order-chart')
  if (chartDom) {
    const myChart = echarts.init(chartDom)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: orderChartData.xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: orderChartData.series
    }
    myChart.setOption(option)
    window.addEventListener('resize', () => myChart.resize())
  }
}

const viewOrderDetails = (order) => {
  currentOrder.value = order
  showOrderDetailDialog.value = true
}

const handleCloseOrderDetailDialog = () => {
  showOrderDetailDialog.value = false
  currentOrder.value = null
}

const updateOrderStatus = (orderId, newStatus) => {
  // 模拟API请求
  console.log(`更新订单 ${orderId} 状态为: ${newStatus}`)
  const orderToUpdate = orders.value.find(order => order.orderId === orderId)
  if (orderToUpdate) {
    orderToUpdate.status = newStatus
    ElMessage.success(`订单 ${orderId} 状态已更新为 ${orderStatusMap[newStatus]}!`)
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  fetchOrderList()
  initOrderChart()
})
</script>

<style scoped lang="scss">
.order-mgr-container {
  padding: 20px;
  background-color: #f0f2f5;

  .box-card {
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .search-filter-bar {
    margin-bottom: 20px;
  }

  .order-stats-cards {
    margin-bottom: 20px;

    .stat-card {
      border-radius: 8px;
      .stat-content {
        display: flex;
        align-items: center;
        .stat-icon {
          font-size: 48px;
          margin-right: 15px;
        }
        .stat-info {
          .stat-title {
            font-size: 16px;
            color: #666;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
          }
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;
    border-radius: 8px;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
    }
  }

  #order-chart {
    width: 100%;
    height: 300px; // 确保图表容器有高度
  }
}
</style> 