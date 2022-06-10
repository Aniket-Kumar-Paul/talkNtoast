import React from 'react'
import styles from './Home.module.css'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/shared/Card/Card'
import Button from '../../components/shared/Button/Button'

const Home = () => {
  const signInLinkStyle = {
    color: '#0077ff',
    fontWeight: 'bold',
    textDecoration: 'none',
    marginLeft: '10px'
  }

  const navigate = useNavigate();
  function startRegister() {
    navigate('/authenticate');
  }

  return (
    <div className={styles.cardWrapper}>
      <Card title="Welcome to talkNtoast !" icon="logo.png">
        <p className={styles.text}>
          We're working hard to get talkNtoast ready for everyone! While we wrap up the finishing touches, we're adding people gradually to make sure nothing breaks :)
        </p>

        <div>
          <Button onClick={startRegister} text="Let's Go"></Button>
        </div>

        <div className={styles.signinWrapper}>
          <span className={styles.hasInvite}>Have an invite test?</span>
        </div>
      </Card>
    </div>
  )
}

export default Home