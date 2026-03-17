<template>
  <section class="manager-section">
    <div class="manager-toolbar">
      <h2>每日金句</h2>
      <el-button type="primary" @click="openCreateDialog">新建金句</el-button>
    </div>

    <el-table :data="quotes" stripe>
      <el-table-column prop="text" label="内容" min-width="280" />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="sort_order" label="排序" width="90" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button
            link
            type="primary"
            @click="toggleStatus(row)"
          >
            {{ row.status === 'published' ? '转草稿' : '发布' }}
          </el-button>
          <el-button link type="danger" @click="removeQuote(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingQuote ? '编辑金句' : '新建金句'" width="560px">
      <el-form label-position="top">
        <el-form-item label="内容">
          <el-input v-model="form.text" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" />
        </el-form-item>
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
        <div class="form-grid">
          <el-form-item label="语言">
            <el-input v-model="form.locale" />
          </el-form-item>
          <el-form-item label="生效日期">
            <el-input v-model="form.effectiveDate" placeholder="YYYY-MM-DD" />
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
  buildDailyQuotePayload,
  createDailyQuoteForm,
  normalizeDailyQuoteList,
} from './daily-quote-manager.js'

const quotes = ref([])
const dialogVisible = ref(false)
const editingQuote = ref(null)
const form = reactive(createDailyQuoteForm())

async function loadQuotes() {
  const response = await adminContentApi.getDailyQuotes()
  quotes.value = normalizeDailyQuoteList(response.data)
}

function assignFormValues(nextForm) {
  Object.assign(form, nextForm)
}

function openCreateDialog() {
  editingQuote.value = null
  assignFormValues(createDailyQuoteForm())
  dialogVisible.value = true
}

function openEditDialog(quote) {
  editingQuote.value = quote
  assignFormValues(createDailyQuoteForm(quote))
  dialogVisible.value = true
}

async function submitForm() {
  const payload = buildDailyQuotePayload(form)
  if (editingQuote.value) {
    await adminContentApi.updateDailyQuote(editingQuote.value.id, payload)
    ElMessage.success('金句已更新')
  } else {
    await adminContentApi.createDailyQuote(payload)
    ElMessage.success('金句已创建')
  }

  dialogVisible.value = false
  await loadQuotes()
}

async function toggleStatus(quote) {
  await adminContentApi.updateDailyQuote(quote.id, {
    ...quote,
    status: quote.status === 'published' ? 'draft' : 'published',
  })
  await loadQuotes()
}

async function removeQuote(quote) {
  await adminContentApi.deleteDailyQuote(quote.id)
  ElMessage.success('金句已删除')
  await loadQuotes()
}

onMounted(() => {
  loadQuotes().catch(() => {
    quotes.value = []
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
  align-items: center;
  gap: 16px;
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
