import { useSelector } from "react-redux"
import { useLocation, Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
    const { user, isAuth } = useSelector((state) => state.auth)
    const location = useLocation()

    return (
        (!isAuth) ? <Navigate to="/" state={{ from: location }} replace />
            : (isAuth && !user.activated) ? <Navigate to="/activate" state={{ from: location }} replace />
                : <Outlet />
    )
}

export default ProtectedRoute;