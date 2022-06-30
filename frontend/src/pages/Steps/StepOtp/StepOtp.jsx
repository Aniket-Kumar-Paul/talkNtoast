import React, { useState } from 'react'
import Button from '../../../components/shared/Button/Button';
import Card from '../../../components/shared/Card/Card';
import TextInput from '../../../components/shared/TextInput/TextInput';
import styles from './StepOtp.module.css'
import { verifyOtp } from '../../../http';
import { useSelector } from 'react-redux';
import { setAuth } from '../../../store/authSlice';
import { useDispatch } from 'react-redux';

const StepOtp = ({ onNext }) => {
  const [otp, setOtp] = useState('');
  const { phone, hash } = useSelector((state) => state.auth.otp)
  const dispatch = useDispatch()

  async function submit() {
    if(!otp || !phone || !hash) return;
    try {
      const { data } = await verifyOtp({ otp, phone, hash })
      console.log(data)
      dispatch(setAuth(data))
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className={styles.cardWrapper}>
      <Card title="Enter the code we just texted you" icon="lock.png">
        <TextInput value={otp} onChange={(e) => setOtp(e.target.value)} /> {/*e means event*/}
        <div>
          <div className={styles.actionButtonWrap}>
            <Button onClick={submit} text="Next" />
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