const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

/** Whether photos can be shown (the Cloudinary cloud name is set in .env). */
export const canShowPhotos = Boolean(CLOUD_NAME)

/** URL of a public Cloudinary image at the given width, or '' when there is no photo or no cloud name. */
export function cloudinaryUrl(publicId, width = 200) {
  if (!publicId || !CLOUD_NAME) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width},c_limit/${publicId}`
}
