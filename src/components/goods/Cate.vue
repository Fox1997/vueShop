<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-Card>
      <el-row>
        <el-button type="primary" @click="addCategoriesPage">添加分类</el-button>
      </el-row>
      <!-- tree-table -->
      <tree-table
        :data="categoriesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:green" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0 ">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
    </el-Card>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next"
      :total="total"
    ></el-pagination>
    <!-- 添加分类Dialog -->
    <el-dialog @close="cateDialogClosed" title="添加分类" :visible.sync="cateDialogVisible" width="50%">
      <el-form :model="addCateList" :rules="addCateListRules" ref="addCateRef" label-width="70px">
        <!-- prop是为了验证规则 -->
        <el-form-item label="分类名称" prop="cat_name" label-width="100px">
          <el-input v-model="addCateList.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" label-width="100px">
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表
      categoriesList: [],
      //   总数据
      total: 0,
      //   为table指定列定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      // 分类列表的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 添加分类信息
      addCateList: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      //  添加分类规则
      addCateListRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            tigger: 'blur'
          }
        ]
      },
      //   添加分类可见性
      cateDialogVisible: false,
      //   父级分类列表
      parentCateList: [],
      //   指定级联选择器配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   选中的级联选择器结果,必须是数组
      selectKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      } else {
        this.categoriesList = res.data.result
        this.total = res.data.total
        // console.log(res.data)
      }
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pageNum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 监听添加分类页面关闭
    cateDialogClosed() {
      this.$refs.addCateRef.resetFields()
      this.selectKeys = []
      this.addCateList.cat_pid = 0
      this.addCateList.cat_level = 0
    },
    // 显示添加分类页面
    async addCategoriesPage() {
      // 先获取父级分类列表在显示新增界面
      this.getParentCateList()
      this.cateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      } else {
        this.parentCateList = res.data
      }
    },
    // 级联选择器发生变化的函数
    parentCateChange() {
      //   console.log(this.selectKeys)
      if (this.selectKeys.length > 0) {
        this.addCateList.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addCateList.cat_level = this.selectKeys.length
      } else {
        this.addCateList.cat_pid = 0
        this.addCateList.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return null
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateList
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        } else {
          this.$message.success('添加分类成功')
          this.getCateList()
          this.cateDialogVisible = false
        }
      })

      //   console.log(this.addCateList)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
