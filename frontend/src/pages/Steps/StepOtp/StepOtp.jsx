import React, { useState } from 'react'
import Button from '../../../components/shared/Button/Button';
import Card from '../../../components/shared/Card/Card';
import TextInput from '../../../components/shared/TextInput/TextInput';
import styles from './StepOtp.module.css'

const StepOtp = ({ onNext }) => {
  const [otp, setOtp] = useState('');
  function next() {
    
  }
  return (
    <div className={styles.cardWrapper}>

      <Card title="Enter the code we just texted you" icon="lock.png">
        <TextInput value={otp} onChange={(e) => setOtp(e.target.value)} /> {/*e means event*/}
        <div>
          <div className={styles.actionButtonWrap}>
            <Button onClick={next} text="Next" />
          </div>

          <p className={styles.bottomParagraph}>
            By entering your number, you're agreeing to our Terms of Service and Privacy Policy. Thanks!
          </p>
        </div>
      </Card>
    </div>
  )
}

export default StepOtp