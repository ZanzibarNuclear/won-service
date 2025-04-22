import path from 'path'

function generateRandomString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomString += characters.charAt(randomIndex)
  }
  return randomString
}

export const genKey = (digits = 10) => {
  return generateRandomString(digits)
}

export const adjustProfileImagePaths = (profile: any, imageViewPath: string) => {
  return Object.assign({}, profile, {
    avatar: profile.avatar ? path.join(imageViewPath, profile.avatar) : null,
    glamShot: profile.glamShot ? path.join(imageViewPath, profile.glamShot) : null
  })
}
