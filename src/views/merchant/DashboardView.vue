<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboardOverview } from '@/api/statistics'

const revenueChart = ref(null)
const dishSalesChart = ref(null)

// 定义响应式数据来存储仪表盘统计
const dashboardStats = ref({
  todayOrders: 0,
  todayRevenue: 0,
  totalDishes: 0,
  totalUsers: 0,
  revenueChartData: [],
  dishSalesChartData: []
})

function initRevenueChart(data) {
  const chartDom = document.getElementById('revenueChart')
  if (chartDom) {
    revenueChart.value = echarts.init(chartDom, null, { width: chartDom.offsetWidth, height: chartDom.offsetHeight });
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          data: data.map(item => item.revenue),
          smooth: true,
          itemStyle: {
            color: '#e4002b'
          }
        }
      ]
    }
    console.log('[DashboardView] Revenue Chart Option:', option); // DEBUG: Log option
    revenueChart.value.setOption(option)
  }
}

function initDishSalesChart(data) {
  const chartDom = document.getElementById('dishSalesChart')
  if (chartDom) {
    console.log(`[DashboardView] dishSalesChart container dimensions: Width=${chartDom.offsetWidth}, Height=${chartDom.offsetHeight}`); // DEBUG: Log dimensions
    dishSalesChart.value = echarts.init(chartDom, null, { width: chartDom.offsetWidth, height: chartDom.offsetHeight });
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(item => item.name)
      },
      series: [
        {
          name: '菜品销售',
          type: 'pie',
          radius: '50%',
          center: ['50%', '60%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    console.log('[DashboardView] Dish Sales Chart Option:', option); // DEBUG: Log option
    dishSalesChart.value.setOption(option)
  }
}

const fetchData = async () => {
  try {
    const data = await getDashboardOverview()
    console.log('[DashboardView] Fetched dashboard data:', data); // DEBUG: Log fetched data
    dashboardStats.value.todayOrders = data.todayOrders
    dashboardStats.value.todayRevenue = data.todayRevenue
    dashboardStats.value.totalDishes = data.totalDishes
    dashboardStats.value.totalUsers = data.totalUsers
    dashboardStats.value.revenueChartData = data.revenueChartData
    dashboardStats.value.dishSalesChartData = data.dishSalesChartData

    nextTick(() => {
      initRevenueChart(dashboardStats.value.revenueChartData)
      initDishSalesChart(dashboardStats.value.dishSalesChartData)
    })
  } catch (error) {
    console.error('[DashboardView] Error fetching dashboard data:', error);
  }
}

onMounted(() => {
  fetchData()
  // 确保图表在窗口大小改变时重绘
  window.addEventListener('resize', () => {
    revenueChart.value?.resize()
    dishSalesChart.value?.resize()
  })
  nextTick(() => {
    if (document.getElementById('revenueChart')) {
      console.log(`[DashboardView] revenueChart final dimensions after nextTick: Width=${document.getElementById('revenueChart').offsetWidth}, Height=${document.getElementById('revenueChart').offsetHeight}`);
    }
    if (document.getElementById('dishSalesChart')) {
      console.log(`[DashboardView] dishSalesChart final dimensions after nextTick: Width=${document.getElementById('dishSalesChart').offsetWidth}, Height=${document.getElementById('dishSalesChart').offsetHeight}`);
    }
  });
})
</script>

<template>
  <div class="dashboard-page">
    <h1 class="page-title">仪表盘</h1>
    <el-row :gutter="20" class="card-row">
      <el-col :span="6">
        <el-card class="dashboard-card">
          <el-icon class="card-icon"><TrendCharts /></el-icon>
          <div class="card-content">
            <div class="card-title">今日订单</div>
            <div class="card-value">{{ dashboardStats.todayOrders }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="dashboard-card">
          <el-icon class="card-icon"><DataLine /></el-icon>
          <div class="card-content">
            <div class="card-title">今日销售额</div>
            <div class="card-value">¥{{ dashboardStats.todayRevenue.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="dashboard-card">
          <el-icon class="card-icon"><Burger /></el-icon>
          <div class="card-content">
            <div class="card-title">总菜品数</div>
            <div class="card-value">{{ dashboardStats.totalDishes }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="dashboard-card">
          <el-icon class="card-icon"><User /></el-icon>
          <div class="card-content">
            <div class="card-title">总用户数</div>
            <div class="card-value">{{ dashboardStats.totalUsers }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="charts-wrapper">
      <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">销售趋势</div>
            </template>
            <div id="revenueChart" style="width: 100%; height: 100%;"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">菜品销售排行</div>
            </template>
            <div id="dishSalesChart" style="width: 100%; height: 100%;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style>
.dashboard-page {
  flex: 1; /* Make it fill available space in column */
  display: flex;
  flex-direction: column;
  padding: 2rem; /* Re-add padding here for page content */
  box-sizing: border-box; /* Include padding in element's total width and height */
  /* background-color: lightblue; */ /* DEBUG: Remove background for visualization */
}

.page-title {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 1.5rem;
}

.card-row {
  margin-bottom: 20px;
}

.dashboard-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  height: 120px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  /* background-color: lightgreen; */ /* DEBUG: Remove background for visualization */
}

.card-icon {
  font-size: 3rem;
  color: var(--el-color-primary);
  margin-right: 1.5rem;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.card-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.charts-wrapper {
  flex: 1; /* Make this wrapper fill remaining vertical space */
  display: flex;
  flex-direction: column; /* Charts rows will stack vertically */
  /* background-color: pink; */ /* DEBUG: Remove background for visualization */
}

.chart-row {
  flex: 1; /* Make chart row fill remaining space */
  display: flex; /* Make it a flex container to manage inner el-cols */
  flex-direction: row; /* Default for el-row */
  margin-bottom: 20px;
  height: 100%; /* Ensure this row takes full available height */
  /* background-color: orange; */ /* DEBUG: Remove background for visualization */
}

.chart-row .el-col {
  height: 100%; /* Ensure el-col fills height of chart-row */
  display: flex;
  flex-direction: column;
  /* background-color: lightcoral; */ /* DEBUG: Remove background for visualization */
}

.chart-card {
  height: 100%; /* Ensure chart card fills its column */
  display: flex;
  flex-direction: column;
  min-height: 400px; /* 为图表卡片设置一个最小高度 */
  /* background-color: lightgoldenrodyellow; */ /* DEBUG: Remove background for visualization */
}

.chart-card :deep(.el-card__header) {
  border-bottom: none;
  padding-bottom: 0;
}

.chart-card :deep(.el-card__body) {
  flex: 1; /* Ensure chart body fills remaining space */
  padding-top: 0;
  display: flex;
  flex-direction: column;
  height: 100%; /* Explicitly ensure card body fills height */
  /* background-color: lightsalmon; */ /* DEBUG: Remove background for visualization */
  overflow: hidden; /* Add overflow hidden to prevent internal content overflow from affecting parent height */
}

#revenueChart,
#dishSalesChart {
  flex: 1; /* Ensure charts fill their container */
  width: 100%;
  height: 100%; /* Re-added: Ensure chart div has explicit height */
  /* background-color: gray; */ /* DEBUG: Remove background for visualization */
}
</style>