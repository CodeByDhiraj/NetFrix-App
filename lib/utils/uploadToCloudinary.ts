export async function uploadToCloudinary(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "netfrix_unsigned") // Your preset name
  formData.append("cloud_name", "duksmkzhl")           // From your env

  const res = await fetch(`https://api.cloudinary.com/v1_1/duksmkzhl/image/upload`, {
    method: "POST",
    body: formData,
  })

  const data = await res.json()
  return data.secure_url // ✅ This is your final image URL
}
