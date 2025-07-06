import axios from "axios"

const axiosInstance = axios.create({
 baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // for auth-token cookies
})

export default axiosInstance
