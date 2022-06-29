import React, { useState } from 'react'
import Card from '../../../components/shared/Card/Card'
import Button from '../../../components/shared/Button/Button'
import TextInput from '../../../components/shared/TextInput/TextInput'
import { useDispatch, useSelector } from 'react-redux'
import { setName } from '../../../store/activateSlice'
import styles from './StepName.module.css'

const StepName = ({ onNext }) => {
  const { name } = useSelector((state) => state.activate)
  const dispatch = useDispatch()
  const [fullname, StepFullName] = useState(name)

  function nextStep() {
    if(!fullname) {
      return; 
    }
    dispatch(setName(fullname))
    onNext();
  }

  return (
    <>
      <Card title="What's your full name ?" icon="goggleEmoji.png">
        <TextInput value={fullname} onChange={(e) => StepFullName(e.target.value)} /> {/*e means event*/}
        <p className={styles.paragraph}>
            People use real names at talkNtoast :)
          </p>
          <div>
            <Button onClick={nextStep} text="Next" />
          </div>
      </Card>
    </>
  )
}

export default StepName