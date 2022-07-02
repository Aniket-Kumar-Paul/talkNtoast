import React from 'react'
import styles from './RoomCard.module.css'

function RoomCard({ room }) {
    return (
        <div className={styles.card}>
            <h3 className={styles.topic}>{room.topic}</h3>
            
            <div className={styles.speakers}>
                <div className={styles.avatars}>
                    {room.speakers.map(speaker => (
                        <img key={speaker.id} src={speaker.avatar} alt="speaker avatar" />
                    ))}
                </div>
                <div className={styles.names}>
                    {room.speakers.map(speaker => (
                        <div key={speaker.id} className={styles.nameWrapper}>
                            <span>{speaker.name}</span>
                            <img src="/images/chat-bubble.png" alt="" />
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.peopleCount}>
                <span>{room.totalPeople}</span>
                <img src="/images/user.png" alt="" />
            </div>
        </div>
    )
}

export default RoomCard