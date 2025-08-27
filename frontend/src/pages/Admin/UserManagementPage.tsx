import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, updateUser } from '../../services/api';
import { User } from '../../types/user';
import { debounce } from 'lodash';
import { ToastProvider, useToast } from '../../components/ToastProvider';
import { useQueryState } from '../../routes/useQueryState';

const UserManagementContent: React.FC = () => {
  const [keyword, setKeyword] = useQueryState('keyword', '');
  const [page, setPage] = useQueryState('page', 1, (val) => val ? parseInt(val, 10) : 1);
  const [size, setSize] = useQueryState('size', 10, (val) => val ? parseInt(val, 10) : 10);
  const [sort, setSort] = useQueryState('sort', 'createdAt:desc');
  
  const [localKeyword, setLocalKeyword] = useState(keyword);

  const queryClient = useQueryClient();
  const toast = useToast();

  const debouncedSetKeyword = useMemo(
    () => debounce((value: string) => {
      setKeyword(value);
      setPage(1);
    }, 300),
    [setKeyword, setPage]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminUsers', { keyword, page, size, sort }],
    queryFn: () => fetchUsers({ keyword, page, size, sort }),
    placeholderData: (previousData) => previousData,
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onMutate: async (updatedUser: Partial<User> & { id: string }) => {
      await queryClient.cancelQueries({ queryKey: ['adminUsers'] });
      const previousUsers = queryClient.getQueryData<any>(['adminUsers', { keyword, page, size, sort }]);
      
      if (previousUsers) {
        const newUsersData = previousUsers.data.map((user: User) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );
        queryClient.setQueryData(['adminUsers', { keyword, page, size, sort }], { ...previousUsers, data: newUsersData });
      }
      
      return { previousUsers };
    },
    onError: (err, updatedUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['adminUsers', { keyword, page, size, sort }], context.previousUsers);
      }
      toast.addToast(`사용자 정보 변경 실패: ${err.message}`, 'error');
    },
    onSuccess: () => {
      toast.addToast('사용자 정보가 성공적으로 변경되었습니다.', 'success');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers', { keyword, page, size, sort }] });
    },
  });

  const handleRoleChange = (id: string, role: 'user' | 'admin') => {
    updateUserMutation.mutate({ id, role });
  };

  const handleStatusChange = (id: string, status: 'active' | 'locked') => {
    updateUserMutation.mutate({ id, status });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalKeyword(e.target.value);
    debouncedSetKeyword(e.target.value);
  };

  const handleSortChange = (column: string) => {
    const [currentSortCol, currentSortDir] = sort.split(':');
    let newSortDir = 'asc';
    if (currentSortCol === column && currentSortDir === 'asc') {
      newSortDir = 'desc';
    }
    setSort(`${column}:${newSortDir}`);
  };

  const renderSortIndicator = (column: string) => {
    const [currentSortCol, currentSortDir] = sort.split(':');
    if (currentSortCol === column) {
      return currentSortDir === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  if (isLoading) return <div className="text-center p-4">로딩 중...</div>;
  if (isError) return <div className="text-center p-4 text-red-500">오류 발생: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">사용자 관리</h1>
      <div className="mb-4">
        <input
          type="text"
          value={localKeyword}
          onChange={handleKeywordChange}
          placeholder="이메일 또는 이름으로 검색"
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSortChange('id')}>ID{renderSortIndicator('id')}</th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSortChange('email')}>이메일{renderSortIndicator('email')}</th>
              <th className="py-2 px-4 border-b">역할</th>
              <th className="py-2 px-4 border-b">상태</th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSortChange('createdAt')}>가입일{renderSortIndicator('createdAt')}</th>
              <th className="py-2 px-4 border-b">작업</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((user: User) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                    className="border p-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded-full text-sm ${user.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'locked' : 'active')}
                    className={`px-3 py-1 rounded text-white ${user.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {user.status === 'active' ? '잠금' : '활성'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="border p-2 rounded">
            <option value={10}>10개씩</option>
            <option value={20}>20개씩</option>
            <option value={50}>50개씩</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span>{page} / {data?.meta.totalPages ?? 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= (data?.meta.totalPages ?? 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagementPage: React.FC = () => (
  <ToastProvider>
    <UserManagementContent />
  </ToastProvider>
);

export default UserManagementPage;
