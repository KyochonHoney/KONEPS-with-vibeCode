import { Request, Response } from 'express';
import { narajangterApiService } from '../services/NarajangterApiService';

/**
 * 나라장터 API 연결 테스트
 */
export const testConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const isConnected = await narajangterApiService.testConnection();
    
    if (isConnected) {
      res.status(200).json({
        success: true,
        message: '나라장터 API 연결 성공',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: '나라장터 API 연결 실패',
        error: 'API 서비스에 연결할 수 없습니다',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('나라장터 API 연결 테스트 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '나라장터 API 연결 테스트 중 오류 발생',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * 입찰공고 수집 및 저장
 */
export const collectNotices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, maxPages } = req.body;

    // 입력값 검증
    if (startDate && !/^\d{8}$/.test(startDate)) {
      res.status(400).json({
        success: false,
        message: '시작일은 YYYYMMDD 형식이어야 합니다',
      });
      return;
    }

    if (endDate && !/^\d{8}$/.test(endDate)) {
      res.status(400).json({
        success: false,
        message: '종료일은 YYYYMMDD 형식이어야 합니다',
      });
      return;
    }

    const result = await narajangterApiService.collectAndSaveNotices(
      startDate,
      endDate,
      maxPages || 10,
    );

    res.status(200).json({
      success: true,
      message: '입찰공고 수집 완료',
      data: {
        totalFetched: result.totalFetched,
        totalSaved: result.totalSaved,
        duplicates: result.totalFetched - result.totalSaved,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('입찰공고 수집 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '입찰공고 수집 중 오류 발생',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * 특정 조건으로 입찰공고 조회 (API에서 직접)
 */
export const getBidNotices = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      pageNo = 1,
      numOfRows = 10,
      inqryDiv = '1',
      inqryBgnDt,
      inqryEndDt,
      ntceInsttCd,
      ntceKnd,
    } = req.query;

    const notices = await narajangterApiService.getBidNotices({
      pageNo: parseInt(pageNo as string) || 1,
      numOfRows: Math.min(parseInt(numOfRows as string) || 10, 100), // 최대 100건 제한
      inqryDiv: inqryDiv as '1' | '2',
      inqryBgnDt: inqryBgnDt as string,
      inqryEndDt: inqryEndDt as string,
      ntceInsttCd: ntceInsttCd as string,
      ntceKnd: ntceKnd as string,
    });

    res.status(200).json({
      success: true,
      message: '입찰공고 조회 성공',
      data: {
        notices,
        count: notices.length,
        pageNo: parseInt(pageNo as string) || 1,
        numOfRows: Math.min(parseInt(numOfRows as string) || 10, 100),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('입찰공고 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      message: '입찰공고 조회 중 오류 발생',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * API 서비스 상태 정보 조회
 */
export const getApiStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const isConnected = await narajangterApiService.testConnection();
    
    res.status(200).json({
      success: true,
      data: {
        apiConnected: isConnected,
        baseUrl: process.env.NARAJANGTER_API_BASE_URL,
        hasServiceKey: !!process.env.NARAJANGTER_API_SERVICE_KEY,
        serviceKeyConfigured: process.env.NARAJANGTER_API_SERVICE_KEY !== 'your_api_service_key_here',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API 상태 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      message: 'API 상태 조회 중 오류 발생',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};