import { useEffect, useMemo, useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import type { User } from '../../types/user';

export default function UserManagementPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState('createdAt:desc');

  const params = useMemo(() => ({ keyword, page, size, sort }), [keyword, page, size, sort]);
  const { users, pageInfo, isLoading, error, refetch, mutateRole, mutateStatus } = useUsers(params);

  useEffect(() => {
    // 검색어 변경 시 첫 페이지로
    setPage(1);
  }, [keyword]);

  const onChangeRole = (u: User, next: User['role']) => {
    if (u.role === next) return;
    mutateRole.mutate({ userId: u.id, nextRole: next });
  };

  const onToggleLock = (u: User) => {
    const next = u.status === 'active' ? 'locked' : 'active';
    mutateStatus.mutate({ userId: u.id, nextStatus: next });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">사용자 관리</h2>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="검색(이메일)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
          />
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 200 }}>
            <option value="createdAt:desc">최신 가입순</option>
            <option value="createdAt:asc">오래된 가입순</option>
            <option value="email:asc">이메일 A→Z</option>
            <option value="email:desc">이메일 Z→A</option>
          </select>
          <button className="btn btn-outline-secondary" onClick={() => refetch()}>새로고침</button>
        </div>
      </div>

      {isLoading && <div className="phx-skeleton">불러오는 중…</div>}
      {error && <div className="alert alert-danger">목록 조회 실패: {(error as any)?.message ?? 'Error'}</div>}

      {!isLoading && !error && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: 140 }}>ID</th>
                <th>이메일</th>
                <th style={{ width: 140 }}>역할</th>
                <th style={{ width: 120 }}>상태</th>
                <th style={{ width: 160 }}>가입일</th>
                <th style={{ width: 180 }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><code>{u.id}</code></td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={u.role}
                      onChange={(e) => onChangeRole(u, e.target.value as User['role'])}
                      disabled={mutateRole.isPending}
                    >
                      <option value="user">user</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="d-flex gap-2">
                    <button
                      className={`btn btn-sm ${u.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      onClick={() => onToggleLock(u)}
                      disabled={mutateStatus.isPending}
                    >
                      {u.status === 'active' ? '잠금' : '해제'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">사용자가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination */}
      {pageInfo && pageInfo.total > 0 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
          <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
            이전
          </button>
          <span>Page {page} / {Math.ceil(pageInfo.total / pageInfo.size)}</span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page * pageInfo.size >= pageInfo.total}
            onClick={() => setPage(page + 1)}
          >
            다음
          </button>
          <select
            className="form-select form-select-sm ms-2"
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
            style={{ width: 100 }}
          >
            <option value={10}>10/페이지</option>
            <option value={20}>20/페이지</option>
            <option value={50}>50/페이지</option>
          </select>
        </div>
      )}
    </div>
  );
}