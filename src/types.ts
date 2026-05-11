export interface ApiResponse<T = unknown> {
  data: T
  message: string
  code: number
}

export interface UserInfo {
  id: number
  email: string
  username: string
  avatar: string
  [key: string]: unknown
}

export interface AddUrlBookmarkReq {
  target_url: string
  target_title?: string
  thumbnail?: string
  description?: string
  tags: string[]
  is_archive?: boolean
}

export interface AddUrlBookmarkResp {}

export interface AddBookmarkReq {
  target_url: string
  target_title: string
  target_icon: string
  target_cover: string
  content: string
  description: string
  tag: string[]
}

export interface AddBookmarkResp {
  bmId: string
}
