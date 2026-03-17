<template>
  <section class="manager-section">
    <div class="manager-toolbar">
      <h2>专题管理</h2>
      <el-button type="primary" @click="openCreateDialog">新建专题</el-button>
    </div>

    <el-table :data="topics" stripe>
      <el-table-column prop="title" label="标题" min-width="220" />
      <el-table-column prop="status" label="状态" width="110" />
      <el-table-column prop="content_count" label="内容数" width="100" />
      <el-table-column prop="sort_order" label="排序" width="90" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="removeTopic(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingTopic ? '编辑专题' : '新建专题'" width="560px">
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容数">
            <el-input v-model="form.contentCount" type="number" />
          </el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="语言">
            <el-input v-model="form.locale" />
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { adminContentApi } from '../../api/index.js'
import {
  buildKnowledgeTopicPayload,
  createKnowledgeTopicForm,
  normalizeKnowledgeTopicList,
} from './knowledge-topic-manager.js'

const topics = ref([])
const dialogVisible = ref(false)
const editingTopic = ref(null)
const form = reactive(createKnowledgeTopicForm())

function assignFormValues(nextForm) {
  Object.assign(form, nextForm)
}

async function loadTopics() {
  const response = await adminContentApi.getKnowledgeTopics()
  topics.value = normalizeKnowledgeTopicList(response.data)
}

function openCreateDialog() {
  editingTopic.value = null
  assignFormValues(createKnowledgeTopicForm())
  dialogVisible.value = true
}

function openEditDialog(topic) {
  editingTopic.value = topic
  assignFormValues(createKnowledgeTopicForm(topic))
  dialogVisible.value = true
}

async function submitForm() {
  const payload = buildKnowledgeTopicPayload(form)
  if (editingTopic.value) {
    await adminContentApi.updateKnowledgeTopic(editingTopic.value.id, payload)
    ElMessage.success('专题已更新')
  } else {
    await adminContentApi.createKnowledgeTopic(payload)
    ElMessage.success('专题已创建')
  }

  dialogVisible.value = false
  await loadTopics()
}

async function removeTopic(topic) {
  await adminContentApi.deleteKnowledgeTopic(topic.id)
  ElMessage.success('专题已删除')
  await loadTopics()
}

onMounted(() => {
  loadTopics().catch(() => {
    topics.value = []
  })
})
</script>

<style scoped>
.manager-section {
  display: grid;
  gap: 16px;
}

.manager-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
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
