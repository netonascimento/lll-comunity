import { UserProfile, UserRole } from "@/types/auth";

type MockUserRecord = UserProfile & { password: string };

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: "user-master",
    name: "Marina Master",
    email: "master@escolaonline.com",
    role: "master",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=60",
    password: "master123",
  },
  {
    id: "user-tutor",
    name: "Tiago Tutor",
    email: "tutor@escolaonline.com",
    role: "tutor",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=200&q=60",
    password: "tutor123",
  },
  {
    id: "user-professor",
    name: "Paula Professora",
    email: "professora@escolaonline.com",
    role: "professor",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=200&q=60",
    password: "prof123",
  },
  {
    id: "user-aluno",
    name: "Lucas Aprendiz",
    email: "aluno@escolaonline.com",
    role: "aluno",
    status: "active",
    avatarUrl:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=60",
    password: "aluno123",
  },
];

export function findMockUser(email: string, password: string) {
  return MOCK_USERS.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
}

export function findMockUserById(id?: string) {
  if (!id) return undefined;
  return MOCK_USERS.find((user) => user.id === id);
}

export function createMockUser(
  payload: Pick<UserProfile, "name" | "email" | "role"> & { password: string }
) {
  const newUser: MockUserRecord = {
    id: `mock-${Math.random().toString(36).slice(2, 10)}`,
    name: payload.name,
    email: payload.email,
    role: payload.role as UserRole,
    status: "active",
    password: payload.password,
  };
  MOCK_USERS.push(newUser);
  return newUser;
}
