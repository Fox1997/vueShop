<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type="primary" @click="addshowPage = true">添加角色</el-button>
      </el-row>
      <el-table :data="rolesList" strip border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1 ===0 ? 'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="['bdbottom',i2 ===0 ? 'bdtop':'','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="roleEdit(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" @click="roleDel(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" @click="roleDistribute(scope.row)">分配</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色页面 -->
      <el-dialog @close="addpageClosed" title="添加角色" :visible.sync="addshowPage" width="50%">
        <el-form :model="roleAddForm" ref="addRolesFormRef" label-width="70px">
          <!-- <el-form-item label="角色ID">
            <el-input v-model="roleAddForm.roleId"></el-input>
          </el-form-item>-->
          <el-form-item label="角色名称">
            <el-input v-model="roleAddForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="roleAddForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addshowPage = false">取 消</el-button>
          <el-button type="primary" @click="addRole()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色页面 -->
      <el-dialog @close="editpageClosed" title="修改角色" :visible.sync="editshowPage" width="50%">
        <el-form :model="roleEditForm" ref="editRolesFormRef" label-width="70px">
          <el-form-item label="角色ID">
            <el-input v-model="roleEditForm.roleId" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色名称">
            <el-input v-model="roleEditForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="roleEditForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editshowPage = false">取 消</el-button>
          <el-button type="primary" @click="rolesEdit()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限 -->
      <el-dialog @close="rightpageClosed" title="分配权限" :visible.sync="rightshowPage" width="50%">
        <!-- 树形控件 -->
        <el-tree
          :data="rightList"
          :props="rightListProps"
          show-checkbox
          node-key="id"
          ref="treeRef"
          default-expand-all
          :default-checked-keys="defKeys"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rightshowPage = false">取 消</el-button>
          <el-button type="primary" @click="addRight">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      //  编辑信息角色列表
      roleEditForm: {},
      //   权限列表
      rightList: [],
      //   添加信息列表
      roleAddForm: {
        roleName: '',
        roleDesc: ''
      },
      //   是否显示修改界面
      editshowPage: false,
      //   是否显示添加角色界面
      addshowPage: false,
      //   是否显示添加权限界面
      rightshowPage: false,
      //   树形权限控件
      rightListProps: {
        label: 'authName',
        children: 'children'
      },
      //   树形控件默认选中的权限
      defKeys: [],
      //   即将分配权限的角色ID
      rolesId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 编辑角色页面
    async roleEdit(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败')
      } else {
        this.roleEditForm = res.data
        this.editshowPage = true
      }
    },
    // 监听编辑页面关闭情况
    editpageClosed() {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 监听添加页面关闭情况
    addpageClosed() {
      this.$refs.addRolesFormRef.resetFields()
    },
    // 监听添加权限页面关闭情况
    rightpageClosed() {
      this.defKeys = []
    },
    // 修改信息
    async rolesEdit() {
      const { data: res } = await this.$http.put(
        'roles/' + this.roleEditForm.roleId,
        {
          roleName: this.roleEditForm.roleName,
          roleDesc: this.roleEditForm.roleDesc
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色信息失败')
      } else {
        this.$message.success('修改角色信息成功')
        this.editshowPage = false
        this.getRolesList()
      }
    },
    // 删除角色
    async roleDel(id) {
      // 弹窗
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      } else {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色信息失败')
        } else {
          this.$message.success('删除角色信息成功')
          this.getRolesList()
        }
      }
    },
    // 添加角色
    async addRole() {
      const { data: res } = await this.$http.post('roles', this.roleAddForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加角色信息失败')
      } else {
        this.$message.success('添加角色信息成功')
        this.addshowPage = false
        this.getRolesList()
      }
    },
    // 删除权限标签
    async removeRightById(role, rightId) {
      // 弹框提示
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      } else {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        } else {
          //   this.getRolesList()
          role.children = res.data
        }
      }
    },
    // 分配权限页面
    async roleDistribute(role) {
      this.rolesId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      } else {
        this.rightList = res.data
        this.getLeafKeys(role, this.defKeys)
        this.rightshowPage = true
      }
    },
    // 通过递归获取所有三级权限的id
    getLeafKeys(node, arr) {
      // 如果当签节点没有子节点就是三级
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 分配权限
    async addRight() {
      const keys = [
        //   获取全选和半选的节点
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.rolesId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      } else {
        this.$message.success('分配权成功')
        this.getRolesList()
        this.rightshowPage = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
// 纵向对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>
