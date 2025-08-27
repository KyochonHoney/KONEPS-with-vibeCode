import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RowDataPacket } from 'mysql2';
import { db } from '../utils/database';

/**
 * 나라장터 입찰공고 API 응답 인터페이스
 */
interface BidNoticeResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: BidNoticeItem[];
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 입찰공고 데이터 구조
 */
interface BidNoticeItem {
  ntceInsttNm: string; // 공고기관명
  ntceInsttCd: string; // 공고기관코드
  ntceDt: string; // 공고일시
  ntceKnd: string; // 공고종류
  ntceSbjt: string; // 공고제목
  ntceNo: string; // 공고번호
  presmptPrce: string; // 추정가격
  opengDt: string; // 개찰일시
  rbidOpengDt: string; // 재입찰 개찰일시
  opengPlce: string; // 개찰장소
  bidNtceDtlUrl: string; // 입찰공고 상세 URL
  srvceDivNm: string; // 용역구분명
  rgstDt: string; // 등록일시
  bidNtceOrd: string; // 입찰공고차수
  reNtceYn: string; // 재공고여부
  ntceSpecFileUrl1: string; // 공고사양서 파일 URL 1
  ntceSpecFileUrl2: string; // 공고사양서 파일 URL 2
  ntceSpecFileUrl3: string; // 공고사양서 파일 URL 3
  bidPrtcptLmtYn: string; // 입찰참가제한여부
  cntrctCnclsMthdNm: string; // 계약체결방법명
  dminsttNm: string; // 수요기관명
  prdctClsfcNoNm: string; // 물품분류번호명
  asignBdgtAmt: string; // 배정예산액
  prjctNm: string; // 사업명
  bidMthdNm: string; // 입찰방법명
  cntrctKndNm: string; // 계약종류명
  exctvNm: string; // 집행관명
}

/**
 * API 요청 파라미터
 */
interface BidNoticeParams {
  serviceKey: string; // API 서비스키
  pageNo?: number; // 페이지번호 (기본값: 1)
  numOfRows?: number; // 한 페이지 결과 수 (기본값: 10, 최대: 999)
  type?: 'json' | 'xml'; // 응답타입 (기본값: json)
  inqryDiv?: '1' | '2'; // 조회구분 (1: 공고일 기준, 2: 입찰일 기준)
  inqryBgnDt?: string; // 조회시작일 (YYYYMMDD)
  inqryEndDt?: string; // 조회종료일 (YYYYMMDD)
  ntceInsttCd?: string; // 공고기관코드
  ntceKnd?: string; // 공고종류
  bidNtceOrd?: string; // 입찰공고차수
}

/**
 * 나라장터 API 서비스 클래스
 */
export class NarajangterApiService {
  private client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly serviceKey: string;
  private readonly defaultTimeout: number = 30000; // 30초

  constructor() {
    // 환경변수에서 API 설정 정보 가져오기
    this.baseUrl = process.env.NARAJANGTER_API_BASE_URL || 'http://apis.data.go.kr/1230000/BidPublicInfoService04';
    this.serviceKey = process.env.NARAJANGTER_API_SERVICE_KEY || '';

    if (!this.serviceKey) {
      throw new Error('NARAJANGTER_API_SERVICE_KEY is required in environment variables');
    }

    // Axios 클라이언트 설정
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NarajangterBot/1.0',
      },
    });

    // 응답 인터셉터 설정
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API 요청 성공: ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API 요청 실패: ${error.config?.url}`, error.message);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 입찰공고 목록 조회
   */
  async getBidNotices(params: Partial<BidNoticeParams>): Promise<BidNoticeItem[]> {
    try {
      const requestParams: BidNoticeParams = {
        serviceKey: this.serviceKey,
        pageNo: params.pageNo || 1,
        numOfRows: params.numOfRows || 100,
        type: 'json',
        inqryDiv: params.inqryDiv || '1', // 공고일 기준
        inqryBgnDt: params.inqryBgnDt || this.getDateString(-7), // 7일 전부터
        inqryEndDt: params.inqryEndDt || this.getDateString(0), // 오늘까지
        ...params,
      };

      const response: AxiosResponse<BidNoticeResponse> = await this.client.get('/getBidPblancListInfoServc04', {
        params: requestParams,
      });

      // API 응답 검증
      if (response.data.response.header.resultCode !== '00') {
        throw new Error(`API 에러: ${response.data.response.header.resultMsg}`);
      }

      const items = response.data.response.body?.items || [];
      console.log(`📊 입찰공고 ${items.length}건 조회 완료`);

      return items;
    } catch (error: any) {
      console.error('입찰공고 조회 실패:', error.message);
      throw error;
    }
  }

  /**
   * 오늘부터 지정된 일수 전/후의 날짜 문자열 반환 (YYYYMMDD)
   */
  private getDateString(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  /**
   * 입찰공고를 데이터베이스에 저장
   */
  async saveNoticesToDatabase(notices: BidNoticeItem[]): Promise<number> {
    try {
      let savedCount = 0;

      for (const notice of notices) {
        // 중복 체크
        const existingNotice = await db.findOne<RowDataPacket>(
          'SELECT id FROM announcements WHERE notice_number = ? AND notice_date = ?',
          [notice.ntceNo, this.parseDateString(notice.ntceDt)],
        );

        if (!existingNotice) {
          // 새로운 공고 저장
          await db.execute(
            `INSERT INTO announcements (
              notice_number, title, institution_name, institution_code, notice_date,
              notice_type, estimated_price, opening_date, reopening_date, opening_location,
              detail_url, service_division, registration_date, notice_order, is_renotice,
              spec_file_url1, spec_file_url2, spec_file_url3, participation_limit,
              contract_method, demand_institution, product_classification, assigned_budget,
              project_name, bid_method, contract_type, executive_name, status,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              notice.ntceNo,
              notice.ntceSbjt,
              notice.ntceInsttNm,
              notice.ntceInsttCd,
              this.parseDateString(notice.ntceDt),
              notice.ntceKnd,
              this.parsePrice(notice.presmptPrce),
              this.parseDateString(notice.opengDt),
              this.parseDateString(notice.rbidOpengDt),
              notice.opengPlce,
              notice.bidNtceDtlUrl,
              notice.srvceDivNm,
              this.parseDateString(notice.rgstDt),
              notice.bidNtceOrd,
              notice.reNtceYn === 'Y',
              notice.ntceSpecFileUrl1,
              notice.ntceSpecFileUrl2,
              notice.ntceSpecFileUrl3,
              notice.bidPrtcptLmtYn === 'Y',
              notice.cntrctCnclsMthdNm,
              notice.dminsttNm,
              notice.prdctClsfcNoNm,
              this.parsePrice(notice.asignBdgtAmt),
              notice.prjctNm,
              notice.bidMthdNm,
              notice.cntrctKndNm,
              notice.exctvNm,
              'active',
            ],
          );
          savedCount++;
        }
      }

      console.log(`💾 데이터베이스에 ${savedCount}건의 새로운 공고 저장 완료`);
      return savedCount;
    } catch (error: any) {
      console.error('데이터베이스 저장 실패:', error.message);
      throw error;
    }
  }

  /**
   * 날짜 문자열을 MySQL DATETIME 형식으로 변환
   */
  private parseDateString(dateStr: string): string | null {
    if (!dateStr) return null;

    try {
      // YYYYMMDDHHMISS 형식을 YYYY-MM-DD HH:MM:SS로 변환
      if (dateStr.length === 14) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(8, 10);
        const minute = dateStr.substring(10, 12);
        const second = dateStr.substring(12, 14);
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }
      // YYYYMMDD 형식인 경우
      else if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day} 00:00:00`;
      }
      return null;
    } catch (error) {
      console.error('날짜 파싱 실패:', dateStr);
      return null;
    }
  }

  /**
   * 가격 문자열을 숫자로 변환
   */
  private parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    // 숫자가 아닌 문자 제거
    const numericStr = priceStr.replace(/[^\d]/g, '');
    return parseInt(numericStr) || 0;
  }

  /**
   * API 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 나라장터 API 연결 테스트 중...');
      
      const result = await this.getBidNotices({
        numOfRows: 1,
        pageNo: 1,
      });

      console.log('✅ 나라장터 API 연결 성공');
      return result.length >= 0; // 빈 배열이어도 연결은 성공
    } catch (error: any) {
      console.error('❌ 나라장터 API 연결 실패:', error.message);
      return false;
    }
  }

  /**
   * 특정 기간의 입찰공고를 수집하고 데이터베이스에 저장
   */
  async collectAndSaveNotices(startDate?: string, endDate?: string, maxPages: number = 10): Promise<{
    totalFetched: number;
    totalSaved: number;
  }> {
    try {
      console.log('🚀 나라장터 입찰공고 수집 시작');
      
      let totalFetched = 0;
      let totalSaved = 0;
      let page = 1;

      while (page <= maxPages) {
        console.log(`📄 페이지 ${page} 수집 중...`);

        const notices = await this.getBidNotices({
          pageNo: page,
          numOfRows: 100, // 한 번에 최대 100건
          inqryBgnDt: startDate,
          inqryEndDt: endDate,
        });

        if (notices.length === 0) {
          console.log('더 이상 가져올 데이터가 없습니다.');
          break;
        }

        totalFetched += notices.length;
        const saved = await this.saveNoticesToDatabase(notices);
        totalSaved += saved;

        // API 부하 방지를 위한 지연
        await this.delay(1000);
        page++;
      }

      console.log(`✅ 수집 완료: 총 ${totalFetched}건 조회, ${totalSaved}건 저장`);
      
      return {
        totalFetched,
        totalSaved,
      };
    } catch (error: any) {
      console.error('입찰공고 수집 실패:', error.message);
      throw error;
    }
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스 내보내기
export const narajangterApiService = new NarajangterApiService();