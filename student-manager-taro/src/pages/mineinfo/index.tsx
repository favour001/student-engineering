import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Input, Text, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import { refreshAuthFromStorage } from '@/utils/app'
import './index.scss'

export default function MineInfo() {
  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => {
    async function load() {
      const { token, userId } = refreshAuthFromStorage()
      if (!userId) return
      const user = await commonRequest<any>('GET', `app/wxuser/get/${userId}`, { token })
      setForm(user && user !== true && user !== false ? user : {})
    }
    load()
  }, [])

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async () => {
    const { token } = refreshAuthFromStorage()
    await commonRequest('POST', 'app/wxuser/update', { token }, form)
    Taro.showToast({ title: '保存成功', icon: 'success' })
  }

  const fields = [
    ['name', '姓名'],
    ['phone', '电话'],
    ['company', '单位'],
    ['postName', '职务'],
    ['deptName', '部门']
  ]

  return (
    <View className="mineinfo common-box">
      {fields.map(([key, label]) => (
        <View className="form-row" key={key}>
          <Text className="form-label">{label}</Text>
          <Input className="form-input" value={form[key] || ''} onInput={(event) => update(key, `${event.detail.value}`)} />
        </View>
      ))}
      <Button className="primary-btn submit-btn" onClick={submit}>保存</Button>
    </View>
  )
}
