export interface LoginRequest {
  account: string;
  password: string;
}

export interface LoginResponse {
  id: number
  userName: string
  account: string
  email?: string
  sex?: string
  phoneNumber?: string
  profileImage?: string
  status: number
  roles?: Array<{ id: number; name: string }>
  department?: { id: number; name: string }
  sysUserPosts?: Array<{ id: number; name: string }>
  access_token: string
  refresh_token: string
}

export interface LoginApiResponse {
  data: LoginResponse;
  msg: string;
  code: number;
  timestamp: string;
}

export interface LoginError {
  error?: string;
  message?: string;
}
