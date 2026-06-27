export type CurrentUser = {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LoginInput = {
  login_id: string;
  password: string;
};

export type LoginResponse = {
  user: CurrentUser;
  expires_at: string;
};
