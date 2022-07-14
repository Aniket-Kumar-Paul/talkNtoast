import React from 'react'
import { useWebRTC } from '../../hooks/useWebRTC'
import styles from './Room.module.css'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useState } from 'react'
import { getRoom } from '../../http'

function Room() {
  const { id: roomId } = useParams();
  const { user } = useSelector(state => state.auth)
  const { clients, provideRef, handleMute } = useWebRTC(roomId, user);
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [isMute, setMute] = useState(true)

  useEffect(() => {
    handleMute(isMute, user.id)
  }, [isMute])

  const handleManualLeave = () => {
    navigate('/rooms')
  }

  useEffect(() => {
    const fetchRoom = async () => {
      const { data } = await getRoom(roomId);
      setRoom((prev) => data)
    }
    fetchRoom()
  }, [roomId])

  const handleMuteClick = (clientId) => {
    if(clientId !== user.id) return ;
    setMute((prev) => !prev)
  }

  return (
    <div>
      <div className='container'>
        <button onClick={handleManualLeave} className={styles.goBack}>
          <img src="/images/arrow.png" alt="arrow-left" />
          <span>All voice rooms</span>
        </button>
      </div>

      <div className={styles.clientsWrap}>
        <div className={styles.header}>
          <h2 className={styles.topic}>{room?.topic}</h2>
          <div className={styles.actions}>
            <button className={styles.actionBtn}>
              <img className={styles.btnImage} src="/images/raiseHand.png" alt="handRaise" />
            </button>
            <button onClick={handleManualLeave} className={styles.actionBtn}>
              <img className={styles.btnImage} src="/images/two-fingers.png" alt="" />
              <span>Leave quietly</span>
            </button>
          </div>
        </div>
        <div className={styles.clientsList}>
          {
            clients.map(client => {
              return (
                <div className={styles.client} key={client.id}>
                  <div className={styles.userHead}>
                    <audio
                      ref={(instance) => provideRef(instance, client.id)}
                      autoPlay>
                    </audio>
                    <img className={styles.useAvatar} src={client.avatar} alt="avatar" />

                    {/* mic */}
                    <button onClick={() => handleMuteClick(client.id)} className={styles.micBtn}>
                      {
                        client.muted
                          ? (<img src="/images/muted.png" alt="" />)
                          : (<img src="/images/unmuted.png" alt="" />)
                      }
                    </button>

                    <h4>{client.name}</h4>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Room;