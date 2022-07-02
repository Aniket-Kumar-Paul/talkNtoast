import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
    headers: {
        'Content-type': 'application/json',
        Accept: 'applicaton/json'
    }
})

// list of all endpoints
export const sendOtp = (data) => api.post('/api/send-otp', data)
export const verifyOtp = (data) => api.post('/api/verify-otp', data)
export const activate = (data) => api.post('/api/activate', data)
export const logout = () => api.post('/api/logout');
export const createRoom = (data) => api.post('/api/rooms', data)

// interceptors - used to check requests, responses

// to login automatically if error code is 401, i.e tokens expired etc.
api.interceptors.response.use( // (function for config, function for error)
    (config) => {
        console.log(`config: ${config}`)
        return config
    },
    async (error) => {
        const originalRequest = error.config;
        console.log(originalRequest)

        if (error.response.status === 401 &&
            originalRequest &&
            !originalRequest._isRetry) {

            originalRequest._isRetry = true
            try {
                console.log(originalRequest._isRetry)
                console.log('getting refresh')
                await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/refresh`,
                    {
                        withCredentials: true,
                    }
                )
                console.log("refreshed")
                return api.request(originalRequest)
            } catch (err) {
                console.log('error aa gaya')
                console.log(err.message)
            }
        }

        // throw error;
    }
)

export default api;