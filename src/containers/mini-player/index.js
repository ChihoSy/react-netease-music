import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import Swiper from 'react-id-swiper'
import { useStores } from '@/stores'
import Ticker from '@/components/ticker'
import { usePageVisibility } from '@/hooks'
import './index.scss'

// 页面下方的mini播放器
const MiniPlayer = observer(function MiniPlayer() {
  const [activeIndex, setActiveIndex] = useState(1)

  const { playerStore, triggerStore } = useStores()

  const history = useHistory()
  const location = useLocation()
  const isVisible = usePageVisibility()

  useEffect(() => {
    if (activeIndex === 0) {
      playerStore.prevSong()
    } else if (activeIndex === 2) {
      playerStore.nextSong()
    }
    // eslint-disable-next-line
  }, [activeIndex])

  const params = {
    initialSlide: 1,
    speed: 200,
    resistanceRatio: 0,
    on: {
      transitionEnd: function () {
        // 只有当初始化和滑动swiper时，才触发
        if (playerStore.swiperLoadSongs.length > 0) {
          setActiveIndex(this.activeIndex)
          this.slideTo(1, 0, false)
        }
      }
    }
  }

  return (
    <div className="mini-player">
      {playerStore.swiperLoadSongs.length > 0 && (
        <Swiper {...params}>
          {playerStore.swiperLoadSongs.map(song => (
            <div key={song.id + '-' + song?.keyId}>
              <div
                className="main"
                onClick={() => {
                  history.push('/player')
                }}
              >
                <div className="album-img-wrapper">
                  <img className="album-img" src={song.al.picUrl + '?param=200y200'} alt="" />
                </div>
                <div className="info">
                  <div className="title">
                    {isVisible && (
                      <Ticker
                        speed={window.innerWidth / 150}
                        childMargin={window.innerWidth / 7.5}
                        key={playerStore.currentSongId + location.pathname}
                      >
                        <span style={{ whiteSpace: 'nowrap' }}>
                          {song.name}
                          {song.alia.length > 0 && (
                            <span className="alias">（{song.alia[0]}）</span>
                          )}
                        </span>
                      </Ticker>
                    )}
                  </div>
                  <p className="lyrics one-line-ellipsis">
                    {playerStore.currentSongId === song?.id &&
                    playerStore.isPlaying &&
                    playerStore.lyrics.length > 0
                      ? playerStore.lyrics[playerStore.activeLyricIndex]?.lyric
                      : song.ar.reduce((total, item, index) => {
                          return index !== song.ar.length - 1
                            ? total + item.name + '/'
                            : total + item.name
                        }, '')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Swiper>
      )}
      <div className="options">
        <div
          className="play-btn"
          onClick={() => {
            playerStore.initAudioContext()
            playerStore.isPlaying
              ? playerStore.audio.current.pause()
              : playerStore.audio.current.play()
            playerStore.setIsPlaying(!playerStore.isPlaying)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg">
            {/* 外圈内外两层 */}
            <circle
              className="c1"
              cx="50%"
              cy="50%"
              r="40%"
              strokeWidth="1"
              strokeDashoffset="0%"
              style={{ stroke: playerStore.isPlaying ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.6)' }}
            ></circle>
            {/* 外圈里面夹着的红色进度 */}
            <circle
              className="c2"
              cx="50%"
              cy="50%"
              r="40%"
              strokeWidth="1"
              // 从255%降到0，就是一首歌的进度了
              strokeDashoffset={`${255 * (1 - playerStore.currentTime / playerStore.totalTime)}%`}
              style={{ stroke: '#fe3a3b' }}
            ></circle>
          </svg>
          {/* 圈里面的播放和暂停 */}
          <i
            style={{ color: playerStore.isPlaying ? '#fe3a3b' : '#000' }}
            className={`iconfont ${playerStore.isPlaying ? 'icon-zanting-bar' : 'icon-bofang-bar'}`}
          ></i>
        </div>
        <i
          className="iconfont icon-caidan2"
          onClick={() => triggerStore.changeShowPlayListDrawer(true)}
        ></i>
      </div>
      <audio></audio>
    </div>
  )
})

export default React.memo(MiniPlayer)
