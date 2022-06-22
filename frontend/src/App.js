import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';
import { useSelector } from 'react-redux';

// const isAuth = false;
// const user = {
//   activated: true
// }

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path='/' element={<GuestRoute Component={Home} />}></Route>
        <Route path='/authenticate' element={<GuestRoute Component={Authenticate} />}></Route>
        <Route path='/activate' element={<SemiProtectedRoute Component={Activate} />}></Route>
        <Route path='/rooms' element={<ProtectedRoute Component={Rooms} />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

const GuestRoute = (props) => {
  const { isAuth } = useSelector((state) => state.auth)

  const { Component } = props
  const navigate = useNavigate()

  if (isAuth) {
    navigate('/rooms')
  } else {
    return (
      <Component />
    )
  }
}

const SemiProtectedRoute = (props) => {
  const { user, isAuth } = useSelector((state) => state.auth)

  const { Component } = props
  const navigate = useNavigate()

  if (!isAuth) {
    navigate('/')
  } else if (isAuth && !user.activated) {
    return (
      <Component />
    )
  } else {
    navigate('/rooms')
  }
}

const ProtectedRoute = (props) => {
  const { user, isAuth } = useSelector((state) => state.auth);
  
  const { Component } = props
  const navigate = useNavigate()

  if (!isAuth) {
    navigate('/')
  } else if (isAuth && !user.activated) {
    navigate('/activate')
  } else {
    return (
      <Component />
    )
  }
}

export default App;