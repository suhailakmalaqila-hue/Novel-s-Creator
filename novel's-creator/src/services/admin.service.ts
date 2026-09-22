import { apiRequest } from "./api";

export type AdminRole = "admin" | "user";

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  author_name: string | null;
  pen_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserPayload {
  email?: string;
  password?: string;
  authorName?: string;
  penName?: string;
  role?: AdminRole;
}

interface AdminUsersResponse {
  success: boolean;
  data: AdminUser[];
}

interface AdminUserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

interface AdminActionResponse {
  success: boolean;
  message: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiRequest<AdminUsersResponse>(
    "/admin/users"
  );

  return response.data;
}

export async function createAdminUser(
  data: Required<
    Pick<AdminUserPayload, "email" | "password">
  > &
    Omit<
      AdminUserPayload,
      "email" | "password"
    >
): Promise<AdminUser> {
  const response =
    await apiRequest<AdminUserResponse>(
      "/admin/users",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

  return response.data;
}

export async function updateAdminUser(
  userId: string,
  data: AdminUserPayload
): Promise<AdminUser> {
  const response =
    await apiRequest<AdminUserResponse>(
      `/admin/users/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

  return response.data;
}

export async function deleteAdminUser(
  userId: string
): Promise<void> {
  await apiRequest<AdminActionResponse>(
    `/admin/users/${userId}`,
    {
      method: "DELETE",
    }
  );
}
