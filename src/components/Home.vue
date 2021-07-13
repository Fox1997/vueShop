<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <span class="el-icon-milk-tea">电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <el-container>
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollaspe">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu :router="true" unique-opened background-color="#333744"
        :collapse-transition="false"
        text-color="#fff" active-text-color="#409EFF"
        :collapse="isCollapse" :default-active="activePath">
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <el-menu-item @click="saveNavState('/'+subItem.path)"
            :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script >
export default {
  data() {
    return {
      menuList: [],
      iconsList: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-claim',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data'
      },
      isCollapse: false,
      // 导航栏激活链接地址
      activePath: ''
    }
  },
  created() {
    this.getMenus()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取左边的菜单列表
    async getMenus() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      // console.log(res)
    },
    // 点击按钮折叠菜单
    toggleCollaspe() {
      this.isCollapse = !this.isCollapse
    },
    // 导航栏激活链接地址状态保存
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-main {
  background-color: #eaedf1;
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
// .iconfont {
//   margin-left: 10px;
// }
.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
