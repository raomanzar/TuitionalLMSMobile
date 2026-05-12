export type GetAllUsers_Api_Payload_Type = {
  startDate?: string;
  endDate?: string;
  userType?: number | null;
  limit?: number | null; // Pagination limit
  page?: number | null; // Current page number
  name?: string; // User name to filter
  countryCode?: string; // Country code to filter
  email?: string; // Email to filter
  exportData?: boolean;
  status?: boolean | string;
};

/**
 * POST /api/user/signUp — multipart/form-data. The helper converts this to
 * FormData; `profileImage` follows React Native's file shape (`{ uri, name, type }`)
 * which RN's FormData accepts directly.
 *
 * `ticket` is required by the backend when `roleId` corresponds to the Student
 * role; the form attaches it conditionally based on the picked role's name.
 */
export type AddUser_Api_Payload_Type = {
  name: string;
  email: string;
  password: string;
  roleId: number;
  country_code?: string;
  phone_number?: string;
  gender?: string;
  ticket?: string;
  profileImage?: { uri: string; name: string; type: string };
};

export type AddRelation_Api_Payload_Type = {
  studentId: number;
  parentId: number;
  relation?: string;
};

export type DeactivateUser_Api_Payload_Type = {
  id: string;
  status: boolean;
  permanent: string;
  message: string;
};

export type Gmail_Api_Payload_Type = {
  name: string;
  email: string;
};

export type User_Object_Type = {
  id: number;
  name: string;
  email: string;
  password: string; // Note: Be careful with storing passwords directly
  status: boolean;
  is_verified: boolean;
  firebase_token: string;
  token: string | null;
  roleId: number;
  reset_token: string | null;
  city: string | null;
  gender: string;
  country: string | null;
  profileImageUrl: string;
  pseudo_name: string;
  phone_number: string;
  country_code: string;
  reset_token_expiry: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null;
  isSync: boolean;
  calendar_integration_enabled: boolean;
  role: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
  };
};

export type GetAllUsers_Api_Response_Type = {
  users: User_Object_Type[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

/** GET /api/user/getUserById — backend wraps the user in a `user` envelope. */
export type GetUserById_Api_Response_Type = {
  user: User_Object_Type;
};

export type AddRelation_Api_Response_Type = {
  id: number;
  studentId: number;
  parentId: number;
  relation: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Student: User_Object_Type;
}[];

//get user by group

// Define the User type for both students and teachers
export type User = {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
};

export type UserByGroup_Object = {
  roleId?: number;
  role?: { name: string };
  users?: User[];
};

export type GetAllUsersByGroup_ApiResponse_Type = {
  students: UserByGroup_Object;
  teachers: UserByGroup_Object;
  parents: UserByGroup_Object;
};

/** PUT /api/user/update — application/json. Mirrors the swagger schema exactly. */
export type UpdateUser_Api_Payload_Type = {
  id: number;
  name?: string;
  email?: string;
  /** Boolean per Edit-form spec — Active = true, Inactive = false. */
  status?: boolean;
  roleId?: number;
  pseudo_name?: string;
  profileImageUrl?: string;
  city?: string;
  country?: string;
  country_code?: string;
  phone_number?: string;
  isSync?: boolean;
  permanent?: string;
  message?: string;
  ticket?: string;
};

export type UpdateUser_ApiResponse_Type = {
  name: string;
  id: number;
  email: string;
  profileImageUrl?: string; // Optional
  status: boolean;
  country_code: string;
  roleId: number;
  pseudo_name?: string;
  phone_number?: string;
  updatedAt: string;
};

export type Add_Delete_Gmail_Api_Response_Type = {
  message: string;
  user: {
    id: string;
    connectedEmails: string;
    pseudo_names: string;
  };
};
