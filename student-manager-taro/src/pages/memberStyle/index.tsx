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

  const loadMembers = async (nextKeyword = keyword, nextPost = postIndex, nextDept = deptIndex, nextPage = 1, append = false) => {
    if (loading.current) return
    loading.current = true
    try {
      const data = await commonRequest<any>('GET', 'app/member-style/list', {}, {
        keyword: nextKeyword || undefined,
        postId: nextPost >= 0 ? postList[nextPost]?.id : undefined,
        deptId: nextDept >= 0 ? deptList[nextDept]?.id : undefined,
        pageNum: nextPage,
        pageSize
      })
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
      const posts = await commonRequest<any[]>('GET', 'app/member-style/posts', {})
      const depts = await commonRequest<any[]>('GET', 'app/member-style/departments', {})
      setPostList(Array.isArray(posts) ? posts : [])
      setDeptList(Array.isArray(depts) ? depts : [])
    }
    loadMeta()
    loadMembers('', -1, -1)
  }, [])

  useReachBottom(() => {
    if (hasMore) loadMembers(keyword, postIndex, deptIndex, pageNum + 1, true)
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
            loadMembers(value, postIndex, deptIndex)
          }}
        />
        <View className="filters">
          <Picker mode="selector" range={['全部岗位'].concat(postList.map((item) => item.postName || item.name))} onChange={(event) => {
            const selected = Number(event.detail.value) - 1
            setPostIndex(selected)
            setPageNum(1)
            setHasMore(true)
            loadMembers(keyword, selected, deptIndex)
          }}>
            <Text className="filter-item">{postIndex >= 0 ? (postList[postIndex]?.postName || postList[postIndex]?.name) : '全部岗位'}</Text>
          </Picker>
          <Picker mode="selector" range={['全部部门'].concat(deptList.map((item) => item.deptName || item.name))} onChange={(event) => {
            const selected = Number(event.detail.value) - 1
            setDeptIndex(selected)
            setPageNum(1)
            setHasMore(true)
            loadMembers(keyword, postIndex, selected)
          }}>
            <Text className="filter-item">{deptIndex >= 0 ? (deptList[deptIndex]?.deptName || deptList[deptIndex]?.name) : '全部部门'}</Text>
          </Picker>
        </View>
      </View>

      <View className="member-list">
        {list.length ? list.map((item) => (
          <View className="member-card" key={item.id} onClick={() => Taro.navigateTo({ url: `/pages/memberStyle/detail?id=${item.id}` })}>
            <Image className="member-avatar" src={item.avatarUrl} mode="aspectFill" />
            <Text className="member-name">{item.displayName || item.name}</Text>
            <Text className="member-desc">{item.postName || item.deptName || item.company}</Text>
          </View>
        )) : <View className="empty">暂无成员</View>}
      </View>
    </View>
  )
}
