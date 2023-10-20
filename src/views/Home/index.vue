<script setup lang="ts">
import { ref } from 'vue';
import * as XLSX from 'xlsx'
const tableExcelHead = ref([
    'ID', 'DATE', 'USER', 'STATUS', 'isAnswerOk', 'areChunksWrong', 'Chunks', 'Prompt', 'Question', 'Answer'
])
const allData = ref([])
const excelTableData = ref([])
const curData = ref<{ [key: string]: any }>({
    areChunksWrong: {
        yes: 0,
        no: 0
    },
    isAnswerOk: {
        yes: 0,
        no: 0
    },
    user: {}
})

const handleChange = async (file: any) => {
    let dataBinary = await readFile(file.raw)
    let workBook = XLSX.read(dataBinary, { type: 'binary', cellDates: true })
    let workSheet = workBook.Sheets[workBook.SheetNames[0]]
    allData.value = XLSX.utils.sheet_to_json(workSheet)
    excelTableData.value = allData.value
    calcData(excelTableData.value)
}

const readFile = (file: any) => {
    return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = (ev: any) => {
            resolve(ev.target.result)
        }
    })
}

const calcData = (data: { [key: string]: any }) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i].areChunksWrong == 'YES') {
            curData.value.areChunksWrong.yes++
        }
        else {
            curData.value.areChunksWrong.no++
        }

        if (data[i].isAnswerOk == 'YES') {
            curData.value.isAnswerOk.yes++
        }
        else {
            curData.value.isAnswerOk.no++
        }
        const user: string = data[i].USER
        // eslint-disable-next-line no-prototype-builtins
        if (curData.value.user.hasOwnProperty(user)) {
            curData.value.user[user]++
        }
        else {
            // 添加字段
            curData.value.user[user] = 1
        }
    }
}

const filterData = (params: { [key: string]: any }) => {
    const parentKey=Object.keys(params)[0]
    const childKey=params[parentKey]
    excelTableData.value=[]
    allData.value.forEach(item => {
        if (item[parentKey]==childKey) {
            excelTableData.value.push(item)
        }
    });
}
// 计算user数量
const calcUserTotal = () => {
    let total = 0
    for (const key in curData.value.user) {
        total += curData.value.user[key]
    }
// 获取一个object的key

    return total
}
</script>

<template>
    <el-upload name="file" :multiple="false" :show-file-list="false" :auto-upload="false" :on-change="handleChange"
        style="margin-bottom:30px">
        <el-button type="primary">上传excel文件</el-button>
    </el-upload>
    <p>areChunksWrong({{ curData.areChunksWrong.yes + curData.areChunksWrong.no }})</p>
    <el-button @click="filterData({ areChunksWrong: 'NO' })">NO({{ curData.areChunksWrong.no }})</el-button>
    <el-button @click="filterData({ areChunksWrong: 'YES' })">YES({{ curData.areChunksWrong.yes }})</el-button>
    <p>isAnswerOk({{ curData.isAnswerOk.yes + curData.isAnswerOk.no }})</p>

    <el-button @click="filterData({ isAnswerOk: 'NO' })">NO({{ curData.isAnswerOk.no }})</el-button>
    <el-button @click="filterData({ isAnswerOk: 'YES' })">YES({{ curData.isAnswerOk.yes }})</el-button>
    <p>user({{ calcUserTotal() }})</p>
    <el-button v-for="(item,index) in Object.keys(curData.user)" :key="index" @click="filterData({USER:item})">{{item+'('+curData.user[item]+')'}}</el-button>
    <div class="excel-table-wrap">
        <el-table v-if="tableExcelHead.length && excelTableData.length" :data="excelTableData" stripe border
            style="width: 100%" size="small">
            <el-table-column v-for="(item, index) in tableExcelHead" :key="index" :prop="item" :label="item" width="150">
                <template #default="scope">
                    <span class="overflow-ellipsis">{{ scope.row[item] }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<style scoped lang="scss">
ul {
    list-style: none;
}

.head-tr {
    th {
        width: 100px;
    }
}
</style>
