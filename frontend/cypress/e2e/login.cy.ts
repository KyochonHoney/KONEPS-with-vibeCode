describe('Login flow and admin access', () => {
  it('logs in and reaches /bids, then visits /admin/users', () => {
    // Mock API 호출
    cy.intercept('POST', 'http://localhost:8000/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'test-access',
        refreshToken: 'test-refresh',
        role: 'superadmin'
      }
    }).as('login');

    cy.intercept('GET', 'http://localhost:8000/bids*', {
      statusCode: 200,
      body: { items: [], pageInfo: { page: 1, size: 10, total: 0 } }
    }).as('bids');

    cy.intercept('GET', 'http://localhost:8000/admin/users*', {
      statusCode: 200,
      body: { items: [], pageInfo: { page: 1, size: 10, total: 0 } }
    }).as('users');

    // 로그인 페이지 방문
    cy.visit('/auth/login');
    
    // 로그인 폼 요소 확인 및 입력
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').contains('로그인').click();
    
    cy.wait('@login');

    // 로그인 후 /bids로 이동했는지 확인
    cy.location('pathname', { timeout: 10000 }).should('match', /\/bids$/);

    // 관리자 목록 스텁
    cy.intercept('GET', 'http://localhost:8000/admin/users*', {
      statusCode: 200,
      body: {
        items: [],
        pageInfo: { page: 1, size: 10, total: 0 }
      }
    }).as('users');

    // 관리자 페이지 접근
    cy.visit('/admin/users');
    cy.wait('@users');
    cy.contains('사용자 관리').should('exist');
    cy.contains('이메일').should('exist');
    cy.contains('역할').should('exist');
    cy.contains('상태').should('exist');
  });
});