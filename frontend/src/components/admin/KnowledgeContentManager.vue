<template>
  <section class="manager-section">
    <div class="manager-toolbar">
      <div class="toolbar-left">
        <h2>内容管理</h2>
        <el-radio-group v-model="activeFilter" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="video">视频</el-radio-button>
          <el-radio-button label="article">文章</el-radio-button>
        </el-radio-group>
      </div>
      <el-button type="primary" @click="openCreateDialog">新建内容</el-button>
    </div>

    <el-table :data="visibleContents" stripe>
      <el-table-column prop="title" label="标题" min-width="220" />
      <el-table-column prop="content_type" label="类型" width="110" />
      <el-table-column prop="category" label="分类" width="140" />
      <el-table-column prop="status" label="状态" width="110" />
      <el-table-column prop="sort_order" label="排序" width="90" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="removeContent(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingContent ? '编辑内容' : '新建内容'" width="680px">
      <el-form label-position="top">
        <div class="form-grid">
          <el-form-item label="标题">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="form.contentType">
              <el-option label="视频" value="video" />
              <el-option label="文章" value="article" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="正文/简介">
          <el-input v-model="form.content" type="textarea" :rows="4" />
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="分类">
            <el-input v-model="form.category" />
          </el-form-item>
          <el-form-item label="封面 URL">
            <el-input v-model="form.coverUrl" />
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="跳转链接">
            <el-input v-model="form.externalUrl" />
          </el-form-item>
          <el-form-item label="发布时间">
            <el-input v-model="form.publishedAt" placeholder="YYYY-MM-DDTHH:mm:ss" />
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input v-model="form.sortOrder" type="number" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { adminContentApi } from '../../api/index.js'
import {
  buildKnowledgeContentPayload,
  createKnowledgeContentForm,
  filterKnowledgeContentsByType,
} from './knowledge-content-manager.js'

const contents = ref([])
const activeFilter = ref('all')
const dialogVisible = ref(false)
const editingContent = ref(null)
const form = reactive(createKnowledgeContentForm())

const visibleContents = computed(() =>
  filterKnowledgeContentsByType(contents.value, activeFilter.value)
)

function assignFormValues(nextForm) {
  Object.assign(form, nextForm)
}

async function loadContents() {
  const response = await adminContentApi.getKnowledgeContents()
  contents.value = response.data
}

function openCreateDialog() {
  editingContent.value = null
  assignFormValues(createKnowledgeContentForm())
  dialogVisible.value = true
}

function openEditDialog(content) {
  editingContent.value = content
  assignFormValues(createKnowledgeContentForm(content))
  dialogVisible.value = true
}

async function submitForm() {
  const payload = buildKnowledgeContentPayload(form)
  if (editingContent.value) {
    await adminContentApi.updateKnowledgeContent(editingContent.value.id, payload)
    ElMessage.success('内容已更新')
  } else {
    await adminContentApi.createKnowledgeContent(payload)
    ElMessage.success('内容已创建')
  }

  dialogVisible.value = false
  await loadContents()
}

async function removeContent(content) {
  await adminContentApi.deleteKnowledgeContent(content.id)
  ElMessage.success('内容已删除')
  await loadContents()
}

onMounted(() => {
  loadContents().catch(() => {
    contents.value = []
  })
})
</script>

<style scoped>
.manager-section {
  display: grid;
  gap: 16px;
}

.manager-toolbar,
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.manager-toolbar {
  justify-content: space-between;
  flex-wrap: wrap;
}

.manager-toolbar h2 {
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
</style>
