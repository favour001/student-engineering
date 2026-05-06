import { useEffect, useState, type ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import { commonRequest, uploadFile } from '@/utils/request'
import { refreshAuthFromStorage } from '@/utils/app'
import avatarDefault from '@/static/images/mine/avatar.png'
import './index.scss'

declare const wx: {
  chooseMedia?: (options: {
    count?: number
    mediaType?: Array<'image' | 'video' | 'mix'>
    sizeType?: Array<'original' | 'compressed'>
    sourceType?: Array<'album' | 'camera'>
    success?: (result: { tempFiles?: Array<{ tempFilePath?: string }> }) => void
    fail?: (error: unknown) => void
  }) => void
} | undefined

const genderOptions = [
  { label: '未知', value: '3' },
  { label: '男', value: '1' },
  { label: '女', value: '2' }
]

type ProfileForm = {
  id: string
  userName: string
  nickName: string
  avatarUrl: string
  userEnglishName: string
  mobile: string
  email: string
  gender: string
  birthday: string
  nativePlace: string
  studyCountry: string
  studySchool: string
  major: string
  certificate: string
  companyName: string
  companyPost: string
  companyAddress: string
  socialPost: string
  remark: string
}

const defaultForm: ProfileForm = {
  id: '',
  userName: '',
  nickName: '',
  avatarUrl: '',
  userEnglishName: '',
  mobile: '',
  email: '',
  gender: '3',
  birthday: '',
  nativePlace: '',
  studyCountry: '',
  studySchool: '',
  major: '',
  certificate: '',
  companyName: '',
  companyPost: '',
  companyAddress: '',
  socialPost: '',
  remark: ''
}

export default function Profile() {
  const [form, setForm] = useState<ProfileForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

  const setField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const load = async () => {
    const { token, userId } = refreshAuthFromStorage()
    if (!userId) {
      Taro.showModal({
        title: '温馨提示',
        content: '请先登录后再编辑个人信息',
        showCancel: false
      })
      return
    }
    const data = await commonRequest<any>('GET', `app/wxuser/get/${userId}`, { token })
    setForm({
      ...defaultForm,
      id: `${data?.id || userId}`,
      userName: data?.userName || data?.name || '',
      nickName: data?.nickName || '',
      avatarUrl: data?.avatarUrl || data?.avatar || data?.avaterUrl || '',
      userEnglishName: data?.userEnglishName || '',
      mobile: data?.mobile || data?.phone || '',
      email: data?.email || '',
      gender: `${data?.gender || '3'}`,
      birthday: formatDate(data?.birthday),
      nativePlace: data?.nativePlace || data?.jiguan || '',
      studyCountry: data?.studyCountry || data?.liuxueGuo || '',
      studySchool: data?.studySchool || data?.liuxueSchool || '',
      major: data?.major || '',
      certificate: data?.certificate || '',
      companyName: data?.companyName || '',
      companyPost: data?.companyPost || '',
      companyAddress: data?.companyAddress || '',
      socialPost: data?.socialPost || data?.post || '',
      remark: data?.remark || ''
    })
  }

  useEffect(() => {
    load()
  }, [])

  const chooseAvatarByPicker = async () => {
    const filePath = await chooseSingleImage()
    if (!filePath) return
    await uploadAvatar(filePath)
  }

  const handleChooseAvatar = async (event: { detail?: { avatarUrl?: string } }) => {
    console.log('choose avatar event', event)
    const filePath = event.detail?.avatarUrl || ''
    if (!filePath) {
      Taro.showToast({ title: '未获取到头像文件', icon: 'none' })
      return
    }
    await uploadAvatar(filePath)
  }

  const uploadAvatar = async (filePath: string) => {
    if (!filePath) return
    setField('avatarUrl', filePath)
    const nextUrl = await uploadSelectedImage(filePath)
    if (nextUrl) setField('avatarUrl', nextUrl)
  }

  const chooseCertificate = async () => {
    const filePath = await chooseSingleImage()
    if (!filePath) return
    setField('certificate', filePath)
    const nextUrl = await uploadSelectedImage(filePath)
    if (nextUrl) setField('certificate', nextUrl)
  }

  const removeCertificate = () => {
    setField('certificate', '')
  }

  const previewCertificate = () => {
    if (!form.certificate) return
    Taro.previewImage({
      urls: [form.certificate],
      current: form.certificate
    })
  }

  const chooseSingleImage = async () => {
    const nativeWx = typeof wx !== 'undefined' ? wx : undefined
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      return chooseSingleImageWithWxMedia(nativeWx)
    }

    try {
      const result = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      return result.tempFilePaths?.[0] || ''
    } catch (error) {
      console.log('taro choose image failed', { error })
      return ''
    }
  }

  const chooseSingleImageWithWxMedia = (nativeWx?: typeof wx) => {
    return new Promise<string>((resolve) => {
      if (typeof nativeWx?.chooseMedia !== 'function') {
        Taro.showToast({ title: '当前环境不支持选择图片', icon: 'none' })
        resolve('')
        return
      }

      nativeWx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
        success: (result) => {
          const filePath = result.tempFiles?.[0]?.tempFilePath || ''
          console.log('wx choose media success', { filePath, result })
          resolve(filePath)
        },
        fail: (error) => {
          console.log('wx choose media failed', { error })
          Taro.showToast({ title: '选择图片失败，请在真机预览中重试', icon: 'none' })
          resolve('')
        }
      })
    })
  }

  const uploadSelectedImage = async (filePath: string) => {
    try {
      Taro.showLoading({ title: '上传中', mask: true })
      console.log('upload selected image start', { filePath })
      const file = await uploadFile(filePath)
      return file.url || file.previewUrl || ''
    } catch (error) {
      console.log('upload image failed', { error })
      Taro.showToast({ title: '图片上传失败', icon: 'none' })
      return ''
    } finally {
      Taro.hideLoading()
    }
  }

  const save = async () => {
    if (!form.id) return
    setSaving(true)
    try {
      await commonRequest('POST', 'app/wxuser/update', {}, {
        id: form.id,
        userName: form.userName,
        nickName: form.nickName,
        avatarUrl: form.avatarUrl,
        userEnglishName: form.userEnglishName,
        mobile: form.mobile,
        email: form.email,
        gender: form.gender,
        birthday: form.birthday,
        nativePlace: form.nativePlace,
        studyCountry: form.studyCountry,
        studySchool: form.studySchool,
        major: form.major,
        certificate: form.certificate,
        companyName: form.companyName,
        companyPost: form.companyPost,
        companyAddress: form.companyAddress,
        socialPost: form.socialPost,
        remark: form.remark
      })
      Taro.showToast({ title: '已保存', icon: 'success' })
      load()
    } finally {
      setSaving(false)
    }
  }

  const genderIndex = Math.max(0, genderOptions.findIndex((item) => item.value === form.gender))
  return (
    <View className="profile">
      <View className="profile-hero">
        <Image className="profile-avatar" src={form.avatarUrl || avatarDefault} mode="aspectFill" />
        <View className="profile-hero-main">
          <Text className="profile-name">{form.userName || form.nickName || '个人信息'}</Text>
          <Text className="profile-desc">完善头像和基础资料</Text>
        </View>
        {isWeapp ? (
          <Button className="profile-avatar-button" openType="chooseAvatar" onChooseAvatar={handleChooseAvatar}>
            更换头像
          </Button>
        ) : (
          <Button className="profile-avatar-button" onClick={chooseAvatarByPicker}>
            更换头像
          </Button>
        )}
      </View>

      <ProfileSection title="基础信息">
        <ProfileField label="姓名" value={form.userName} placeholder="请输入姓名" onChange={(value) => setField('userName', value)} />
        <ProfileField label="微信昵称" value={form.nickName} placeholder="请输入微信昵称" type="nickname" onChange={(value) => setField('nickName', value)} />
        <ProfileField label="英文名" value={form.userEnglishName} placeholder="请输入英文名" onChange={(value) => setField('userEnglishName', value)} />
        <ProfileField label="手机号" value={form.mobile} placeholder="请输入手机号" type="number" onChange={(value) => setField('mobile', value)} />
        <ProfileField label="邮箱" value={form.email} placeholder="请输入邮箱" onChange={(value) => setField('email', value)} />
        <ProfileFieldShell label="性别" clickable>
          <Picker mode="selector" range={genderOptions.map((item) => item.label)} value={genderIndex} onChange={(event) => setField('gender', genderOptions[Number(event.detail.value)]?.value || '3')}>
            <Text className="profile-picker-value">{genderOptions[genderIndex]?.label || '未知'}</Text>
          </Picker>
        </ProfileFieldShell>
        <ProfileFieldShell label="生日" clickable>
          <Picker mode="date" value={form.birthday} onChange={(event) => setField('birthday', `${event.detail.value || ''}`)}>
            <Text className={form.birthday ? 'profile-picker-value' : 'profile-picker-value is-placeholder'}>{form.birthday || '请选择生日'}</Text>
          </Picker>
        </ProfileFieldShell>
        <ProfileField label="籍贯" value={form.nativePlace} placeholder="请输入籍贯" onChange={(value) => setField('nativePlace', value)} />
      </ProfileSection>

      <ProfileSection title="留学信息">
        <ProfileField label="留学国家" value={form.studyCountry} placeholder="请输入留学国家" onChange={(value) => setField('studyCountry', value)} />
        <ProfileField label="留学学校" value={form.studySchool} placeholder="请输入留学学校" onChange={(value) => setField('studySchool', value)} />
        <ProfileField label="专业" value={form.major} placeholder="请输入专业" onChange={(value) => setField('major', value)} />
        <ProfileFieldShell label="证书" align="start">
          <View className="certificate-box">
            {form.certificate ? (
              <View className="certificate-preview" onClick={previewCertificate}>
                <Image className="certificate-image" src={form.certificate} mode="aspectFill" />
                <View className="certificate-actions">
                  <Button
                    className="profile-mini-button"
                    onClick={(event) => {
                      event.stopPropagation()
                      chooseCertificate()
                    }}
                  >
                    更换
                  </Button>
                  <Button
                    className="profile-mini-button is-danger"
                    onClick={(event) => {
                      event.stopPropagation()
                      removeCertificate()
                    }}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ) : (
              <View className="certificate-upload" onClick={chooseCertificate}>
                <Text className="certificate-upload-icon">+</Text>
                <Text className="certificate-upload-text">上传证书</Text>
              </View>
            )}
          </View>
        </ProfileFieldShell>
      </ProfileSection>

      <ProfileSection title="工作信息">
        <ProfileField label="单位名称" value={form.companyName} placeholder="请输入单位名称" onChange={(value) => setField('companyName', value)} />
        <ProfileField label="单位职位" value={form.companyPost} placeholder="请输入单位职位" onChange={(value) => setField('companyPost', value)} />
        <ProfileField label="单位地址" value={form.companyAddress} placeholder="请输入单位地址" onChange={(value) => setField('companyAddress', value)} />
        <ProfileField label="社会职务" value={form.socialPost} placeholder="请输入社会职务" onChange={(value) => setField('socialPost', value)} />
        <ProfileFieldShell label="个人简介" align="start">
          <Textarea
            className="profile-textarea"
            value={form.remark}
            placeholder="请输入个人简介"
            maxlength={500}
            placeholderClass="profile-placeholder"
            onInput={(event) => setField('remark', `${event.detail.value || ''}`)}
          />
        </ProfileFieldShell>
      </ProfileSection>

      <View className="profile-footer">
        <Button className="profile-save-button" loading={saving} onClick={save}>
          {saving ? '保存中' : '保存信息'}
        </Button>
      </View>
    </View>
  )
}

type ProfileFieldProps = {
  label: string
  value: string
  placeholder: string
  type?: 'text' | 'number' | 'nickname'
  onChange: (value: string) => void
}

function ProfileField({ label, value, placeholder, type = 'text', onChange }: ProfileFieldProps) {
  return (
    <ProfileFieldShell label={label}>
      <Input
        className="profile-input"
        type={type}
        value={value}
        placeholder={placeholder}
        placeholderClass="profile-placeholder"
        onInput={(event) => onChange(`${event.detail.value || ''}`)}
      />
    </ProfileFieldShell>
  )
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="profile-group">
      <View className="profile-group-title">{title}</View>
      <View className="profile-group-body">{children}</View>
    </View>
  )
}

function ProfileFieldShell({
  label,
  children,
  align = 'center',
  clickable = false
}: {
  label: string
  children: ReactNode
  align?: 'center' | 'start'
  clickable?: boolean
}) {
  return (
    <View className={`profile-field ${align === 'start' ? 'is-start' : ''} ${clickable ? 'is-clickable' : ''}`}>
      <Text className="profile-field-label">{label}</Text>
      <View className="profile-field-control">{children}</View>
    </View>
  )
}

function formatDate(value?: string | number | Date | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return `${value}`.slice(0, 10)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
