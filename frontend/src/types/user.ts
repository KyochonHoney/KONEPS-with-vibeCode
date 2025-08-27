export type User = {
  id: string;
  email: string;
  role: 'user' | 'superadmin';
  status: 'active' | 'locked';
  createdAt: string;
};

export type UsersResponse = {
  items: User[];
  pageInfo: {
    page: number;
    size: number;
    total: number;
  };
};