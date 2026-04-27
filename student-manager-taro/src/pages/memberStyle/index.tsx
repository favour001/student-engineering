import { useEffect, useRef, useState } from 'react'
import Taro, { useReachBottom } from '@tarojs/taro'
import { Image, Input, Picker, Text, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'
import './index.scss'

export default function MemberStyle() {
  const [keyword, setKeyword] = useState('')
  const [postList, setPostList] = useState<any[]>([])
  const [deptList, setDeptList] = useState<any[]>([])
  const [postIndex, setPostIndex] = useState(-1)
  const [deptIndex, setDeptIndex] = useState(-1)
  const [list, setList] = useState<any[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loading = useRef(false)
  const pageSize = 10

  const loadUsers = async (nextKeyword = keyword, nextPost = postIndex, nextDept = deptIndex, nextPage = 1, append = false) => {
    if (loading.current) return
    loading.current = true
    try {
      const params: Record<string, unknown> = {
        name: nextKeyword || undefined,
        postId: nextPost >= 0 ? postList[nextPost]?.id : undefined,
        deptId: nextDept >= 0 ? deptList[nextDept]?.id : undefined,
        pageNum: nextPage,
        pageSize
      }
      const data = await commonRequest<any>('GET', 'app/user/list', {}, params)
      const page = normalizePageResult<any>(data, nextPage, pageSize)
      setList((prev) => append ? prev.concat(page.list) : page.list)
      setPageNum(nextPage)
      setHasMore(page.hasMore)
    } finally {
      loading.current = false
    }
  }

  useEffect(() => {
    async function loadMeta() {
      const posts = await commonRequest<any[]>('GET', 'app/post/list', {})
      const depts = await commonRequest<any[]>('GET', 'app/dept/list', {})
      setPostList(Array.isArray(posts) ? posts : [])
      setDeptList(Array.isArray(depts) ? depts : [])
    }
    loadMeta()
    loadUsers('', -1, -1)
  }, [])

  useReachBottom(() => {
    if (hasMore) loadUsers(keyword, postIndex, deptIndex, pageNum + 1, true)
  })

  return (
    <View className="member-style">
      <View className="member-search common-box-2">
        <Input
          className="search-input"
          placeholder="搜索成员"
          value={keyword}
          onInput={(event) => {
            const value = `${event.detail.value}`
            setKeyword(value)
            setPageNum(1)
            setHasMore(true)
            loadUsers(value, postIndex, deptIndex)
          }}
        />
        <View className="filters">
          <Picker mode="selector" range={postList.map((item) => item.postName || item.name)} onChange={(event) => {
            const index = Number(event.detail.value)
            setPostIndex(index)
            setPageNum(1)
            setHasMore(true)
            loadUsers(keyword, index, deptIndex)
          }}>
            <Text className="filter-item">{postIndex >= 0 ? (postList[postIndex]?.postName || postList[postIndex]?.name) : '职务'}</Text>
          </Picker>
          <Picker mode="selector" range={deptList.map((item) => item.deptName || item.name)} onChange={(event) => {
            const index = Number(event.detail.value)
            setDeptIndex(index)
            setPageNum(1)
            setHasMore(true)
            loadUsers(keyword, postIndex, index)
          }}>
            <Text className="filter-item">{deptIndex >= 0 ? (deptList[deptIndex]?.deptName || deptList[deptIndex]?.name) : '部门'}</Text>
          </Picker>
        </View>
      </View>

      <View className="member-list">
        {list.length ? list.map((item) => (
          <View className="member-card" key={item.id} onClick={() => Taro.navigateTo({ url: `/pages/memberStyle/detail?id=${item.id}` })}>
            <Image className="member-avatar" src={item.avatarUrl || item.avaterUrl} mode="aspectFill" />
            <Text className="member-name">{item.nickName || item.name}</Text>
            <Text className="member-desc">{item.postName || item.deptName || item.company}</Text>
          </View>
        )) : <View className="empty">暂无成员</View>}
      </View>
    </View>
  )
}
