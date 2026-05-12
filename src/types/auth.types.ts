// signin
export type SignIn_Payload_Type = {
  email: string;
  password: string;
};

export type User_Type = {
  id: number;
  name: string;
  pseudo_name: string;
  email: string;
  phone_number: string;
  gender: string | null;
  profileImageUrl: string;
  firebase_token: string | null;
  city: string | null;
  country: string | null;
  country_code: string;
  roleId: number;
  is_verified: boolean;
  isSync: boolean;
  status: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null; // ISO date string or null
  reset_token: string | null;
  reset_token_expiry: string | null; // ISO date string or null
  password: string;
  token: string;
  role: {
    id: number;
    name: string;
  };
};

export type SignIn_Response_Type = {
  token: string;
  user: User_Type;
  enrollementIds?: number[];
  childrens?: number[];
};

// forgot-password
export type ForgotPassword_Payload_Type = {
  email: string;
};
export type ForgotPassword_Response_Type = {
  message: string;
};

// reset-password
export type ResetPasword_Type_Payload = {
  email: string;
  token: string;
};
export type ResetPasword_Type_Response = {
  message: string;
  error: string;
};

// confirm-password
export type ConfirmPassword_Type_Payload = {
  email: string;
  newPassword: string;
  token: string;
};
export type ConfirmPassword_Type_Response = {
  message: string;
  error: string;
};
