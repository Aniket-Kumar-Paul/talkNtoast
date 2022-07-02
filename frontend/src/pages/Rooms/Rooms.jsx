import React from 'react'
import { useState } from 'react'
import AddRoomModal from '../../components/AddRoomModal/AddRoomModal'
import RoomCard from '../../components/shared/RoomCard/RoomCard'
import styles from './Rooms.module.css'

const rooms = [
  {
    id: 1,
    topic: 'which framework is best?',
    speakers: [
      {
        id: 1,
        name: 'John Doe',
        avatar: '/images/monkey.png'
      },
      {
        id: 2,
        name: 'Jane Doe',
        avatar: '/images/monkey.png'
      }
    ],
    totalPeople: 40
  },
  {
    id: 2,
    topic: 'which framework is best?',
    speakers: [
      {
        id: 1,
        name: 'John Doe',
        avatar: '/images/monkey.png'
      },
      {
        id: 2,
        name: 'Jane Doe',
        avatar: '/images/monkey.png'
      }
    ],
    totalPeople: 50
  }
]



const Rooms = () => {
  const [showModal, setShowModal] = useState(false)

  function openModal() {
    setShowModal(true)
  }

  return (
    <>
      <div className='container'>
        <div className={styles.roomsHeader}>

          <div className={styles.left}>
            <span className={styles.heading}>All voice rooms</span>
            <div className={styles.searchBox}>
              <img className={styles.searchIcon} src="/images/search.png" alt="search" />
              <input type="text" className={styles.searchInput} />
            </div>
          </div>

          <div className={styles.right}>
            <button onClick={openModal} className={styles.startRoomButton}>
              <img src="/images/speaking.png" alt="add room" />
              <span>Start a room</span>
            </button>
          </div>

        </div>
        <div className={styles.roomList}>
          {
            rooms.map(room => <RoomCard key={room.id} room={room} />)
          }
        </div>
      </div>

      {showModal &&
        <AddRoomModal onClose={() => setShowModal(false)}/>
      }
    </>
  )
}

export default Rooms