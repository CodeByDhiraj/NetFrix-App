import axios from "axios"

const axiosInstance = axios.create({
 baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://netfrix.fallmodz.in",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // for auth-token cookies
})

export default axiosInstance
