import { useSelector } from "react-redux"
import { useLocation, Navigate, Outlet } from "react-router-dom"


const GuestRoute = () => {
    const { isAuth } = useSelector((state) => state.auth)
    const location = useLocation()

    return (
        (!isAuth) ? <Outlet />
                  : <Navigate to="/rooms" state={{ from: location }} replace />
    )
}

export default GuestRoute;