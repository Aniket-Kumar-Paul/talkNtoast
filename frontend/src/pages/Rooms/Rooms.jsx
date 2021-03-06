import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import AddRoomModal from '../../components/AddRoomModal/AddRoomModal'
import RoomCard from '../../components/shared/RoomCard/RoomCard'
import { getAllRooms } from '../../http'
import styles from './Rooms.module.css'

const Rooms = () => {
  const [showModal, setShowModal] = useState(false)
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await getAllRooms();
      setRooms(data)
    }
    fetchRooms();
  }, [])

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