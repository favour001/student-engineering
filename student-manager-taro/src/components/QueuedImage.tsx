import { useEffect, useMemo, useRef, useState } from 'react'
import { Image, View } from '@tarojs/components'
import { completeImageLoad, enqueueImageLoad } from '@/utils/imageQueue'
import './QueuedImage.scss'

type Props = {
  className?: string
  src?: string
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right'
  priority?: number
  lazyLoad?: boolean
  onClick?: () => void
}

export default function QueuedImage({
  className = '',
  src = '',
  mode = 'aspectFill',
  priority = 5,
  lazyLoad = true,
  onClick
}: Props) {
  const [visibleSrc, setVisibleSrc] = useState('')
  const [loaded, setLoaded] = useState(false)
  const completedRef = useRef(false)
  const isRemote = useMemo(() => /^(https?:)?\/\//i.test(src), [src])

  useEffect(() => {
    setVisibleSrc('')
    setLoaded(false)
    completedRef.current = false

    if (!src) return undefined
    if (!isRemote) {
      setVisibleSrc(src)
      return undefined
    }

    return enqueueImageLoad(priority, () => setVisibleSrc(src))
  }, [isRemote, priority, src])

  const finishLoad = () => {
    setLoaded(true)
    if (!isRemote || completedRef.current) return
    completedRef.current = true
    completeImageLoad()
  }

  return (
    <View className={`queued-image ${className} ${loaded ? 'is-loaded' : ''}`} onClick={onClick}>
      <View className="queued-image-skeleton" />
      {visibleSrc ? (
        <Image
          className="queued-image-node"
          src={visibleSrc}
          mode={mode}
          lazyLoad={lazyLoad}
          onLoad={finishLoad}
          onError={finishLoad}
        />
      ) : null}
    </View>
  )
}
