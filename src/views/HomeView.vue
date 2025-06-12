<script setup>
import { ref } from 'vue'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
</script>

<template>
  <div class="home-view">
    <!-- 测试文本：如果看到此行，说明文件已更新 -->
    <!-- 轮播图区域 (Placeholder) -->
    <section class="hero-section">
      <el-carousel :interval="4000" type="card" height="350px">
        <el-carousel-item v-for="item in carouselItems" :key="item.id">
          <img :src="item.image" :alt="item.title" class="carousel-image">
          <h3 class="carousel-title">{{ item.title }}</h3>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 内容模块区域 -->
    <section class="content-modules">
      <div class="container">
        <div class="module-grid">
          <!-- KFC 宅急送 -->
          <el-card class="module-card primary-card" shadow="hover">
            <div class="card-header">
              <h3>KFC 宅急送 官网订餐</h3>
              <el-icon><Plus /></el-icon>
            </div>
            <div class="card-body">
              <div class="delivery-info">
                <h4>KFC 宅急送</h4>
                <p>亲爱的顾客，肯德基宅急送外送费官方定价将于2024年2月20日从9元下调为6元。为了更好地提升外送产品的服务体验，我们对外送打包进行了保温升级，并提供专人打包服务，酌情收取打包服务费，具体收费标准详见菜单公示。此外，大神卡用户在享受满额免外送费的同时，可享受免打包服务费权益。感谢您的理解和支持！</p>
                <a href="#" class="read-more">› 宅急送外卖订餐，美味准时送上门</a>
              </div>
              <img src="/images/kfc-delivery.png" alt="KFC Delivery" class="card-image delivery-image">
            </div>
          </el-card>

          <!-- 新闻中心 -->
          <el-card class="module-card" shadow="hover">
            <div class="card-header">
              <h3>新闻中心</h3>
              <el-icon><Plus /></el-icon>
            </div>
            <div class="card-body-small">
              <img src="/images/news-center.png" alt="News Center" class="card-image small-image">
            </div>
          </el-card>

          <!-- 肯德基 APP -->
          <el-card class="module-card" shadow="hover">
            <div class="card-header">
              <h3>肯德基 APP</h3>
              <el-icon><Plus /></el-icon>
            </div>
            <div class="card-body-small">
              <img src="/images/kfc-app.png" alt="KFC App" class="card-image small-image">
              <a href="#" class="read-more">› 肯德基超级APP下载</a>
            </div>
          </el-card>

          <!-- 儿童乐园 -->
          <el-card class="module-card" shadow="hover">
            <div class="card-header">
              <h3>儿童乐园</h3>
              <el-icon><Plus /></el-icon>
            </div>
            <div class="card-body-small">
              <img src="/images/kids-park.png" alt="Kids Park" class="card-image small-image">
              <a href="#" class="read-more">› 快来肯德基欢乐庆生！</a>
            </div>
          </el-card>

          <!-- K-MUSIC -->
          <el-card class="module-card" shadow="hover">
            <div class="card-header">
              <h3>K-MUSIC</h3>
              <el-icon><Plus /></el-icon>
            </div>
            <div class="card-body-small">
              <img src="/images/k-music.png" alt="K-MUSIC" class="card-image small-image">
              <a href="#" class="read-more">› K-MUSIC点唱机全新上线, 餐厅音乐任你点!</a>
            </div>
          </el-card>

          <!-- 食品安全 -->
          <el-card class="module-card" shadow="hover">
            <div class="card-header">
              <h3>食品安全</h3>
              <el-icon><Plus /></el-icon>
            </div>
            <div class="card-body-small">
              <img src="/images/food-safety.png" alt="Food Safety" class="card-image small-image">
              <a href="#" class="read-more">› 食品安全简报</a>
            </div>
          </el-card>

          <!-- 关注我们 -->
          <el-card class="module-card" shadow="hover">
            <div class="card-header">
              <h3>关注我们</h3>
              <el-icon><Plus /></el-icon>
            </div>
            <div class="card-body-small">
              <img src="/images/wechat-qr.png" alt="WeChat QR" class="card-image small-image">
              <a href="#" class="read-more">› 肯德基超级APP下载 <el-tag size="small">NEW</el-tag></a>
              <a href="#" class="read-more">› 肯德基QQ公众号</a>
            </div>
          </el-card>

          <!-- 精彩下载 -->
          <el-card class="module-card" shadow="hover">
            <div class="card-header">
              <h3>精彩下载</h3>
              <el-icon><Plus /></el-icon>
            </div>
            <div class="card-body-small">
              <img src="/images/desktop-wallpaper.png" alt="Desktop Wallpaper" class="card-image small-image">
              <a href="#" class="read-more">› 电视广告</a>
              <a href="#" class="read-more">› 电子贺卡</a>
            </div>
          </el-card>
        </div>
      </div>
    </section>

    <!-- 底部版权信息 -->
    <section class="copyright-info">
      <div class="container">
        <p>关于肯德基 | 新闻中心 | 精彩下载 | 法律条款 | 经营公示</p>
        <p>沪ICP备17028264号-2 沪公网安备 31010402003279号</p>
        <div class="other-brands">
          <span>其它品牌网站</span>
          <el-dropdown>
            <el-button>
              百胜中国<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>必胜客</el-dropdown-item>
                <el-dropdown-item>塔可贝尔</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 64px); /* Adjust for fixed header */
}

.hero-section {
  padding: 20px 0;
  background-color: #f0f2f5;
}

.el-carousel {
  max-width: 1200px;
  margin: 0 auto;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.carousel-title {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
}

.content-modules {
  padding: 30px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.module-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.module-card.primary-card {
  grid-column: span 2; /* Make this card span two columns */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-body {
  display: flex;
  gap: 15px;
  padding: 15px;
}

.card-body-small {
  padding: 15px;
  text-align: center;
}

.delivery-info {
  flex: 1;
}

.delivery-info h4 {
  margin-top: 0;
  font-size: 1.2rem;
  color: var(--el-color-primary);
}

.delivery-info p {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 10px;
}

.read-more {
  font-size: 0.9rem;
  color: var(--el-color-primary);
  text-decoration: none;
}

.read-more:hover {
  text-decoration: underline;
}

.card-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.delivery-image {
  width: 150px;
  height: 150px;
}

.small-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin-bottom: 10px;
}

.copyright-info {
  background-color: #333;
  color: #aaa;
  padding: 20px 0;
  font-size: 0.85rem;
  text-align: center;
}

.copyright-info p {
  margin: 5px 0;
}

.other-brands {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.other-brands .el-button {
  background-color: #555;
  color: #eee;
  border: none;
}

.other-brands .el-button:hover {
  background-color: #666;
}

@media (max-width: 768px) {
  .module-card.primary-card {
    grid-column: span 1; /* On smaller screens, make primary card span 1 column */
  }
  .card-body {
    flex-direction: column;
    align-items: center;
  }
  .delivery-image {
    margin-top: 15px;
  }
  .copyright-info {
    text-align: center;
  }
  .other-brands {
    flex-direction: column;
  }
}
</style>
