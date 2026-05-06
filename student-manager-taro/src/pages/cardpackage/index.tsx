import { useEffect, useRef, useState } from 'react'
import { useReachBottom } from '@tarojs/taro'
import Tabs from '@/components/Tabs'
import CardList, { CardItem } from '@/components/CardList'
import { commonRequest } from '@/utils/request'
import { refreshAuthFromStorage } from '@/utils/app'
import { normalizePageResult } from '@/utils/pagination'
import { CARD_RECEIVE_STATUS, cardTypeTabs } from '@/constants/card'

export default function CardPackage() {
  const [type, setType] = useState(1)
  const [list, setList] = useState<CardItem[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loading = useRef(false)
  const pageSize = 10

  const load = async (nextPage = 1, append = false, nextType = type) => {
    if (loading.current) return
    loading.current = true
    try {
      const { token, userId } = refreshAuthFromStorage()
      const data = await commonRequest<any>('GET', `app/card/list/${nextType}/${userId}/1`, { token }, { pageNum: nextPage, pageSize })
      const page = normalizePageResult<CardItem>(data, nextPage, pageSize)
      const receivedList = page.list.filter((item) => String(item.status || '') === CARD_RECEIVE_STATUS.RECEIVED)
      setList((prev) => append ? prev.concat(receivedList) : receivedList)
      setPageNum(nextPage)
      setHasMore(page.hasMore)
    } finally {
      loading.current = false
    }
  }

  useEffect(() => {
    load(1, false, type)
  }, [type])

  useReachBottom(() => {
    if (hasMore) load(pageNum + 1, true)
  })

  return (
    <>
      <Tabs
        value={type}
        tabs={cardTypeTabs}
        onChange={(value) => {
          setList([])
          setPageNum(1)
          setHasMore(true)
          setType(Number(value))
        }}
      />
      <CardList list={list} type={type} target="cardpackage" />
    </>
  )
}
