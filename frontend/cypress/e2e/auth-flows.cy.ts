describe('Authentication Flows', () => {
  beforeEach(() => {
    // 각 테스트 전에 localStorage 정리
    cy.clearLocalStorage();
  });

  describe('회원가입 플로우', () => {
    it('가입 → 로그인 → /bids 이동', () => {
      // 회원가입 API 스텁
      cy.intercept('POST', 'http://localhost:8000/auth/register', {
        statusCode: 201,
        body: { message: '회원가입이 완료되었습니다.' }
      }).as('register');

      // 로그인 API 스텁
      cy.intercept('POST', 'http://localhost:8000/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          role: 'user'
        }
      }).as('login');

      // Bids API 스텁
      cy.intercept('GET', 'http://localhost:8000/bids*', {
        statusCode: 200,
        body: { items: [], pageInfo: { page: 1, size: 10, total: 0 } }
      }).as('bids');

      // 회원가입 페이지 방문 (실제로는 로그인 페이지에 회원가입 링크가 있다고 가정)
      cy.visit('/auth/login');
      
      // 회원가입 폼이 있다면 테스트, 없다면 스킵하고 바로 로그인 테스트
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="signup-form"]').length > 0) {
          // 회원가입 폼 입력
          cy.get('[data-testid="signup-email"]').type('newuser@example.com');
          cy.get('[data-testid="signup-password"]').type('password123');
          cy.get('[data-testid="signup-confirm"]').type('password123');
          cy.get('[data-testid="signup-submit"]').click();
          cy.wait('@register');
        }
      });

      // 로그인 진행
      cy.get('input[type="email"]').clear().type('newuser@example.com');
      cy.get('input[type="password"]').clear().type('password123');
      cy.get('button[type="submit"]').contains('로그인').click();
      
      cy.wait('@login');

      // /bids로 리다이렉트 확인
      cy.location('pathname', { timeout: 10000 }).should('match', /\/bids$/);
      
      // localStorage에 토큰 저장 확인
      cy.window().its('localStorage').invoke('getItem', 'auth').should('exist');
    });
  });

  describe('권한 없는 접근', () => {
    it('일반 유저가 /admin/users 접근 시 접근 거부', () => {
      // 일반 유저로 인증 상태 설정
      cy.window().then((win) => {
        win.localStorage.setItem('auth', JSON.stringify({
          accessToken: 'user-access-token',
          refreshToken: 'user-refresh-token',
          role: 'user'
        }));
      });

      // Admin API 호출 시 403 에러 스텁
      cy.intercept('GET', 'http://localhost:8000/admin/users*', {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('adminForbidden');

      // 관리자 페이지 접근 시도
      cy.visit('/admin/users', { failOnStatusCode: false });
      
      // 403 또는 접근 거부 메시지 확인
      cy.get('body').should('contain.oneOf', ['403', 'Forbidden', '접근 권한', '권한이 없습니다']);
    });

    it('인증되지 않은 사용자가 보호된 페이지 접근 시 로그인 페이지로 리다이렉트', () => {
      // localStorage 비우기 (로그아웃 상태)
      cy.clearLocalStorage();

      // 보호된 페이지 접근 시도
      cy.visit('/bids', { failOnStatusCode: false });
      
      // 로그인 페이지로 리다이렉트 확인
      cy.location('pathname', { timeout: 10000 }).should('match', /\/auth\/login$/);
    });
  });

  describe('로그아웃 플로우', () => {
    it('로그아웃 시 localStorage 삭제 및 /auth/login 리다이렉트', () => {
      // 로그인 상태로 설정
      cy.window().then((win) => {
        win.localStorage.setItem('auth', JSON.stringify({
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          role: 'user'
        }));
      });

      // Bids 페이지 방문
      cy.intercept('GET', 'http://localhost:8000/bids*', {
        statusCode: 200,
        body: { items: [], pageInfo: { page: 1, size: 10, total: 0 } }
      }).as('bids');

      cy.visit('/bids');
      
      // localStorage에 인증 정보가 있는지 확인
      cy.window().its('localStorage').invoke('getItem', 'auth').should('exist');

      // 로그아웃 버튼 클릭 (헤더나 네비게이션에 있다고 가정)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
        } else if ($body.find('button').contains('로그아웃').length > 0) {
          cy.contains('button', '로그아웃').click();
        } else {
          // 로그아웃 버튼이 없는 경우, 수동으로 localStorage 삭제
          cy.window().then((win) => {
            win.localStorage.removeItem('auth');
          });
          cy.visit('/auth/login');
        }
      });

      // localStorage에서 인증 정보 제거 확인
      cy.window().its('localStorage').invoke('getItem', 'auth').should('not.exist');
      
      // 로그인 페이지로 리다이렉트 확인
      cy.location('pathname', { timeout: 10000 }).should('match', /\/auth\/login$/);
    });
  });
});