import React, { useState, useEffect } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { useInterval } from '@/hooks'
import { imgBlurToBase64 } from '@/utils/tools'
import './index.scss'

// 云村热评墙导航卡片
const HotwallNav = props => {
  // 从上往下轮播，当前显示项的index
  const [currentIndex, setCurrentIndex] = useState(0)

  const [songCoverUrl, setSongCoverUrl] = useState()
  const [songCoverUrlCache, setSongCoverUrlCache] = useState([])

  const { hotwallNavList } = props

  // 周期性currentIndex+1，到最后就又从0开始
  useInterval(() => {
    const nextIndex = (currentIndex + 1) % hotwallNavList.length
    setCurrentIndex(nextIndex)
  }, 3000)

  const currentItem = hotwallNavList[currentIndex]

  // 图片高斯模糊
  useEffect(() => {
    ;(async function () {
      // 图片大概30张左右，给模糊后的图片做个缓存，避免imgBlurToBase64()的性能消耗
      for (let item of songCoverUrlCache) {
        if (item.initialUrl === currentItem.songCoverUrl) {
          setSongCoverUrl(item.blurUrl)
          return
        }
      }
      const blurUrl = await imgBlurToBase64(currentItem.songCoverUrl + '?param=200y200', 20)
      setSongCoverUrl(blurUrl)
      setSongCoverUrlCache([
        ...songCoverUrlCache,
        { initialUrl: currentItem.songCoverUrl, blurUrl }
      ])
    })()
  }, [currentItem.songCoverUrl, songCoverUrlCache])

  const month = Date().slice(4, 7) + '.'
  const day = Date().slice(8, 10)

  return (
    <div className="hotwall-nav">
      <div
        className="hotwall-nav-bg-img"
        style={{
          backgroundImage: `url(${songCoverUrl})`,
          transition: songCoverUrlCache.length > 1 && 'background-image 1s'
        }}
      ></div>
      <div className="hot-nav-main">
        <div className="left-side">
          <div className="title">
            <span>云村热评墙</span>
            <i className="iconfont icon-gengduo"></i>
          </div>
          <div className="hotwall-nav-animate-wrapper">
            <TransitionGroup>
              <CSSTransition timeout={500} classNames="hotwall-nav-animate" key={currentItem.id}>
                <div className="content-wrapper">
                  <img
                    className="avatar"
                    src={currentItem.avatar + '?param=200y200'}
                    alt="avatar"
                  />
                  <p className="content one-line-ellipsis">{currentItem.content}</p>
                </div>
              </CSSTransition>
            </TransitionGroup>
          </div>
        </div>
        <div className="right-side">
          <span className="month">{month}</span>
          <span className="day">{day}</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(HotwallNav)
