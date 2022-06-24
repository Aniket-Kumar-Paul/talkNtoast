import { useSelector } from "react-redux"
import { useLocation, Navigate, Outlet } from "react-router-dom"

const SemiProtectedRoute = () => {
    const { user, isAuth } = useSelector((state) => state.auth)
    const location = useLocation()

    return (
        (!isAuth) ? <Navigate to="/" state={{ from: location }} replace />
            : (isAuth && !user.activated) ? <Outlet />
                : <Navigate to="/rooms" state={{ from: location }} replace />
    )
}

export default SemiProtectedRoute;