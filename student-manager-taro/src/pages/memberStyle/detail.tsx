import { useEffect, useState } from 'react'
import { useRouter } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import HtmlContent from '@/components/HtmlContent'
import { commonRequest } from '@/utils/request'
import './index.scss'

export default function MemberStyleDetail() {
  const router = useRouter()
  const id = `${router.params.id || ''}`
  const [user, setUser] = useState<any>({})

  useEffect(() => {
    async function load() {
      if (!id) return
      const data = await commonRequest<any>('GET', `app/member-style/${id}`)
      setUser(data || {})
    }
    load()
  }, [id])

  const heroImage = user.backgroundUrl && user.backgroundUrl !== 'null'
    ? user.backgroundUrl
    : user.avatarUrl || user.avaterUrl
  const postNames = getNames(user.posts, 'postName', 'name')
  const deptNames = getNames(user.departments, 'deptName', 'name')
  const awardNames = getNames(user.awards, 'awardName', 'name')

  return (
    <View className="member-detail-page">
      <View className="detail-hero">
        {heroImage ? <Image className="detail-hero-image" src={heroImage} mode="aspectFill" /> : null}
        <View className="detail-hero-shade" />
      </View>

      <View className="member-detail-card">
        <View className="profile-card">
          <Image className="member-detail-avatar" src={user.avatarUrl || user.avaterUrl} mode="aspectFill" />
          <View className="profile-info">
            <Text className="member-detail-name">{user.displayName || user.name || '成员'}</Text>
            <View className="detail-tags">
              {postNames.length ? postNames.map((name) => (
                <Text className="detail-post-badge" key={name}>{name}</Text>
              )) : user.postName ? <Text className="detail-post-badge">{user.postName}</Text> : null}
              {user.studyCountry ? <Text className="country-badge">{user.studyCountry}</Text> : null}
              {deptNames.length ? deptNames.map((name) => (
                <Text className="dept-badge" key={name}>{name}</Text>
              )) : user.deptName ? <Text className="dept-badge">{user.deptName}</Text> : null}
            </View>
            {user.studySchool ? <Text className="profile-school">{user.studySchool}</Text> : null}
          </View>
        </View>

        <View className="intro-section">
          {user.studySchool ? (
            <View className="detail-block">
              <View className="block-heading">
                <Text className="block-kicker">Education</Text>
                <Text className="intro-title">毕业学校</Text>
              </View>
              <Text className="intro-text">{user.studySchool}</Text>
            </View>
          ) : null}

          {user.company ? (
            <View className="detail-block">
              <View className="block-heading">
                <Text className="block-kicker">Company</Text>
                <Text className="intro-title">公司名称</Text>
              </View>
              <View className="intro-rich">
                <HtmlContent content={user.company} />
              </View>
            </View>
          ) : null}

          {user.jobRemark ? (
            <View className="detail-block">
              <View className="block-heading">
                <Text className="block-kicker">Position</Text>
                <Text className="intro-title">职务</Text>
              </View>
              <View className="intro-rich">
                <HtmlContent content={user.jobRemark} />
              </View>
            </View>
          ) : null}

          {user.socialPost ? (
            <View className="detail-block">
              <View className="block-heading">
                <Text className="block-kicker">Association</Text>
                <Text className="intro-title">社务职务</Text>
              </View>
              <View className="intro-rich">
                <HtmlContent content={user.socialPost} />
              </View>
            </View>
          ) : null}

          {user.honorRemark || user.introduce || user.remark || user.content ? (
            <View className="detail-block">
              <View className="block-heading">
                <Text className="block-kicker">Honors</Text>
                <Text className="intro-title">荣誉</Text>
              </View>
              <View className="intro-rich">
                <HtmlContent content={user.honorRemark || user.introduce || user.remark || user.content} />
              </View>
            </View>
          ) : null}

          {awardNames.length ? (
            <View className="detail-block">
              <View className="block-heading">
                <Text className="block-kicker">Awards</Text>
                <Text className="intro-title">奖项</Text>
              </View>
              <View className="detail-awards">
                {awardNames.map((name) => (
                  <Text className="detail-award-chip" key={name}>{name}</Text>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}

function getNames(rows: any[] = [], ...keys: string[]) {
  return Array.from(new Set(
    rows
      .map((item) => keys.map((key) => item?.[key]).find(Boolean))
      .filter(Boolean)
      .map((item) => `${item}`)
  ))
}
