<template>
  <div class="analytics-page">
    <h1 class="page-title">销售分析</h1>

    <el-row :gutter="20" class="data-cards">
      <el-col :span="8">
        <el-card class="analytics-card">
          <div class="card-header">
            <el-icon><Money /></el-icon>
            <span>总销售额</span>
          </div>
          <div class="card-value">¥{{ analyticsData.totalRevenue.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="analytics-card">
          <div class="card-header">
            <el-icon><Tickets /></el-icon>
            <span>总订单数</span>
          </div>
          <div class="card-value">{{ analyticsData.totalOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="analytics-card">
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>平均客单价</span>
          </div>
          <div class="card-value">¥{{ analyticsData.averageOrderValue.toFixed(2) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>月度销售趋势</span>
            </div>
          </template>
          <div id="monthlySalesChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>最受欢迎菜品</span>
            </div>
          </template>
          <div id="popularDishesChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Money, Tickets, User } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const analyticsData = ref({
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0
})

const monthlySalesChart = ref(null)
const popularDishesChart = ref(null)

async function fetchAnalyticsData() {
  // TODO: 替换为实际的 API 调用
  // 模拟数据
  await new Promise(resolve => setTimeout(resolve, 500))
  analyticsData.value = {
    totalRevenue: 87654.32,
    totalOrders: 1234,
    averageOrderValue: 71.03
  }

  const monthlySales = [
    ['Jan', 10000],
    ['Feb', 12000],
    ['Mar', 15000],
    ['Apr', 13000],
    ['May', 18000],
    ['Jun', 20000]
  ]

  const popularDishes = [
    { value: 500, name: '香辣鸡腿堡' },
    { value: 400, name: '原味鸡' },
    { value: 300, name: '薯条 (大)' },
    { value: 200, name: '可乐 (中)' },
    { value: 100, name: '新奥尔良烤翅' }
  ]

  initMonthlySalesChart(monthlySales)
  initPopularDishesChart(popularDishes)
}

function initMonthlySalesChart(data) {
  const chartDom = document.getElementById('monthlySalesChart')
  if (chartDom) {
    monthlySalesChart.value = echarts.init(chartDom)
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map(item => item[0])
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '销售额',
          type: 'bar',
          data: data.map(item => item[1]),
          itemStyle: {
            color: '#e4002b'
          }
        }
      ]
    }
    monthlySalesChart.value.setOption(option)
  }
}

function initPopularDishesChart(data) {
  const chartDom = document.getElementById('popularDishesChart')
  if (chartDom) {
    popularDishesChart.value = echarts.init(chartDom)
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
          name: '销售量',
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
    popularDishesChart.value.setOption(option)
  }
}

onMounted(() => {
  fetchAnalyticsData()
  window.addEventListener('resize', () => {
    monthlySalesChart.value?.resize()
    popularDishesChart.value?.resize()
  })
})
</script>

<style scoped>
.analytics-page {
  flex: 1; /* Make it fill available space in column */
  display: flex;
  flex-direction: column;
  padding: 2rem; /* Re-add padding here for page content */
  box-sizing: border-box; /* Include padding in element's total width and height */
}

.page-title {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 1.5rem;
}

.data-cards {
  margin-bottom: 1.5rem;
}

.analytics-card {
  text-align: center;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.card-header .el-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
  color: var(--el-color-primary);
}

.card-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.chart-row {
  flex: 1; /* Make chart rows fill remaining space */
  margin-bottom: 20px; /* Add margin between chart rows */
}

.chart-card {
  height: 100%; /* Ensure chart card fills its column */
  display: flex;
  flex-direction: column;
}

.chart-card .el-card__header {
  border-bottom: none;
  padding-bottom: 0;
}

.chart-card .el-card__body {
  flex: 1; /* Ensure chart body fills remaining space */
  padding-top: 0;
  display: flex;
  flex-direction: column;
}

#monthlySalesChart,
#popularDishesChart {
  flex: 1; /* Ensure charts fill their container */
  width: 100%;
  height: 100%;
}
</style> 