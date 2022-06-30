import React, { useState } from 'react'
import Card from '../../../components/shared/Card/Card'
import Button from '../../../components/shared/Button/Button'
import styles from './StepAvatar.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { setAvatar } from '../../../store/activateSlice'
import { activate } from '../../../http'
import { setAuth } from '../../../store/authSlice'
import Loader from '../../../components/shared/Loader/Loader'
import { useEffect } from 'react'

const StepAvatar = ({ onNext }) => {
  const { name, avatar } = useSelector((state) => state.activate)
  const dispatch = useDispatch()
  const [image, setImage] = useState('/images/monkey.png')
  const [loading, setLoading] = useState(false)
  const [unmounted, setUnMounted] = useState(false)

  async function submit() {
    if(!name || !avatar) return; 
    
    setLoading(true)
    try {
      const { data } = await activate({ name, avatar })
      if (data.auth) {
        // check
        if(!unmounted) {
          dispatch(setAuth(data))
        }
      }
      
    } catch (err) {
      console.log(err)
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => { // cleanup function - after component unmounts, this callback runs, used for any async/promises etc.
      setUnMounted(true)
    }
  }, [])

  if (loading) return <Loader message="Activation in Progress" />;

  function captureImage(e) { // e -> event
    // console.log(e)
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function () { // after image loads, run this function
      setImage(reader.result) // reader.result -> returns processed base64 image string
      dispatch(setAvatar(reader.result))
    }
  }

  return (
    <>
      <Card title={`Okay, ${name}`} icon="monkeyEmoji.png">
        <p className={styles.subHeading}>How's this photo?</p>
        <div className={styles.avatarWrapper}>
          <img className={styles.avatarImage} src={image} alt="avatar" />
        </div>

        <div>
          <input
            onChange={captureImage}
            id='avatarInput'
            type="file"
            className={styles.avatarInput} />

          <label className={styles.avatarLabel} htmlFor="avatarInput">
            Choose a different photo
          </label>
        </div>

        <div>
          <Button onClick={submit} text="Next" />
        </div>
      </Card>
    </>
  )
}

export default StepAvatar