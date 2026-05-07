import { useEffect, useRef, useState } from 'react'
import Taro, { useReachBottom } from '@tarojs/taro'
import { Button, Image, Input, ScrollView, Text, View } from '@tarojs/components'
import { commonRequest } from '@/utils/request'
import { normalizePageResult } from '@/utils/pagination'
import './index.scss'

const ALL_DEPT_ID = '__all__'

export default function MemberStyle() {
  const [keyword, setKeyword] = useState('')
  const [deptList, setDeptList] = useState<any[]>([])
  const [activeDeptId, setActiveDeptId] = useState<number | string>(ALL_DEPT_ID)
  const [list, setList] = useState<any[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const loading = useRef(false)
  const requestSeq = useRef(0)
  const activeFilter = useRef({ keyword, deptId: activeDeptId })
  const pageSize = 10

  const loadMembers = async (
    nextKeyword = keyword,
    nextDeptId: number | string = activeDeptId,
    nextPage = 1,
    append = false
  ) => {
    if (append && loading.current) return
    const currentSeq = requestSeq.current + 1
    requestSeq.current = currentSeq
    loading.current = true
    setIsLoading(true)
    try {
      const data = await commonRequest<any>('GET', 'app/member-style/list', {}, {
        keyword: nextKeyword || undefined,
        deptId: nextDeptId === ALL_DEPT_ID ? undefined : nextDeptId,
        pageNum: nextPage,
        pageSize
      })
      const page = normalizePageResult<any>(data, nextPage, pageSize)
      if (
        currentSeq !== requestSeq.current ||
        nextKeyword !== activeFilter.current.keyword ||
        `${nextDeptId}` !== `${activeFilter.current.deptId}`
      ) return
      setList((prev) => append ? prev.concat(page.list) : page.list)
      setPageNum(nextPage)
      setTotal(page.total)
      setHasMore(page.hasMore)
    } finally {
      if (currentSeq === requestSeq.current) {
        loading.current = false
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    async function loadMeta() {
      const depts = await commonRequest<any[]>('GET', 'app/member-style/departments', {})
      const normalizedDepts = normalizeDeptTabs(Array.isArray(depts) ? depts : [])
      setDeptList(normalizedDepts)
      activeFilter.current = { keyword: '', deptId: ALL_DEPT_ID }
      setActiveDeptId(ALL_DEPT_ID)
      loadMembers('', ALL_DEPT_ID)
    }
    loadMeta()
  }, [])

  useReachBottom(() => {
    loadNextPage()
  })

  const loadNextPage = () => {
    if (!hasMore || loading.current) return
    loadMembers(keyword, activeDeptId, pageNum + 1, true)
  }

  const searchMembers = () => {
    activeFilter.current = { keyword, deptId: activeDeptId }
    setPageNum(1)
    setHasMore(true)
    loadMembers(keyword, activeDeptId)
  }

  const switchDept = (deptId: number | string) => {
    if (`${deptId}` === `${activeDeptId}`) return
    activeFilter.current = { keyword, deptId }
    setActiveDeptId(deptId)
    setPageNum(1)
    setHasMore(true)
    loadMembers(keyword, deptId)
  }

  const activeDept = deptList.find((item) => `${item.id}` === `${activeDeptId}`)
  const activeDeptName = activeDept?.deptName || activeDept?.name || '全部成员'
  const isAllDept = `${activeDeptId}` === ALL_DEPT_ID

  return (
    <View className="member-style">
      <View className="member-toolbar">
        <View className="toolbar-copy">
          <Text className="toolbar-title">成员风采</Text>
          <Text className="toolbar-subtitle">{activeDeptName} · {total} 位成员</Text>
        </View>
        <View className="member-search">
          <View className="search-form">
            <Text className="search-icon" />
            <Input
              className="search-input"
              placeholder="搜索姓名、学校或地区"
              confirmType="search"
              maxlength={20}
              value={keyword}
              onInput={(event) => setKeyword(`${event.detail.value}`)}
              onConfirm={searchMembers}
            />
            {keyword ? (
              <Text
                className="clear-key"
                onClick={() => {
                  setKeyword('')
                  activeFilter.current = { keyword: '', deptId: activeDeptId }
                  loadMembers('', activeDeptId)
                }}
              >
                ×
              </Text>
            ) : null}
          </View>
          <Button className="search-btn" onClick={searchMembers}>搜索</Button>
        </View>
      </View>

      <View className="member-body">
        <View className="dept-tabs">
          {deptList.map((item) => {
            const isActive = `${activeDeptId}` === `${item.id}`
            return (
              <View
                className={`dept-tab ${isActive ? 'active' : ''}`}
                key={item.id}
                onClick={() => switchDept(item.id)}
              >
                <Text>{item.deptName || item.name}</Text>
              </View>
            )
          })}
        </View>

        <ScrollView
          className="member-area"
          scrollY
          lowerThreshold={80}
          enhanced
          showScrollbar={false}
          onScrollToLower={loadNextPage}
        >
          <View className="member-area-inner">
            {list.length ? list.map((item) => (
              (() => {
                const postNames = getNames(item.posts, 'postName', 'name')
                const awardNames = getNames(item.awards, 'awardName', 'name')
                const deptName = item.deptName || ''
                const showDeptName = Boolean(deptName && (isAllDept || deptName !== activeDeptName))

                return (
              <View
                className="member-item"
                key={item.id}
                onClick={() => Taro.navigateTo({ url: `/pages/memberStyle/detail?id=${item.id}` })}
              >
                <Image className="member-avatar" src={item.avatarUrl} mode="aspectFill" />
                <View className="member-info">
                  <View className="member-title">
                    <Text className="member-name">{item.displayName || item.name}</Text>
                    {postNames.length ? (
                      <View className="post-badges">
                        {postNames.map((name) => (
                          <Text className="post-badge" key={name}>{name}</Text>
                        ))}
                      </View>
                    ) : item.postName ? <Text className="post-badge">{item.postName}</Text> : null}
                  </View>
                  <View className="member-meta">
                    {item.studyCountry || item.studyArea ? (
                      <Text className="meta-chip">{item.studyCountry || item.studyArea}</Text>
                    ) : null}
                    {showDeptName ? <Text className="meta-chip muted">{deptName}</Text> : null}
                  </View>
                  {awardNames.length ? (
                    <View className="award-list">
                      {awardNames.slice(0, 3).map((name) => (
                        <Text className="award-chip" key={name}>{name}</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
                )
              })()
            )) : (
              <View className="empty">
                <Text>{isLoading ? '数据加载中...' : '暂无数据'}</Text>
              </View>
            )}
            {list.length && hasMore ? <Text className="list-end">{isLoading ? '加载中...' : '上拉加载更多'}</Text> : null}
            {list.length && !hasMore ? <Text className="list-end">没有更多了</Text> : null}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

function normalizeDeptTabs(depts: any[]) {
  const withoutLegacyAll = depts.filter((item) => {
    const name = item.deptName || item.name
    return `${item.id}` !== '100' && name !== '全部'
  })
  return [{ id: ALL_DEPT_ID, name: '全部', deptName: '全部' }].concat(withoutLegacyAll)
}

function getNames(rows: any[] = [], ...keys: string[]) {
  return Array.from(new Set(
    rows
      .map((item) => keys.map((key) => item?.[key]).find(Boolean))
      .filter(Boolean)
      .map((item) => `${item}`)
  ))
}
