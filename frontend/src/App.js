import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';
import Layout from './components/shared/Layout';
import Missing from './pages/Missing/Missing';
import GuestRoute from './Protected Routes/GuestRoute';
import SemiProtectedRoute from './Protected Routes/SemiProtectedRoute';
import ProtectedRoute from './Protected Routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        {/* Protected Routes */}
        <Route element={<GuestRoute />}>
          <Route path='/' element={<Home />} />
          <Route path='/authenticate' element={<Authenticate />} />
        </Route>
        <Route element={<SemiProtectedRoute />}>
          <Route path='/activate' element={<Activate />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path='/rooms' element={<Rooms />} />
        </Route>

        {/* Catch all / No path matched  */}
        <Route path='*' element={<Missing />} />
      </Route>
    </Routes>
  )
}

export default App;