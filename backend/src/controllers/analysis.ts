import { Request, Response, NextFunction } from 'express';
import { AnalysisService } from '../services/AnalysisService';

const analysisService = new AnalysisService();

// 모든 분석 결과 조회
export const getAllAnalysisResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (req.query.page || req.query.limit) {
      const result = await analysisService.getAnalysisWithPagination(page, limit);
      res.json(result);
    } else {
      const analysisResults = await analysisService.getAllAnalysisResults();
      res.json(analysisResults);
    }
  } catch (error) {
    next(error);
  }
};

// 특정 분석 결과 조회
export const getAnalysisResultById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const analysisResult = await analysisService.getAnalysisResultById(id);

    if (!analysisResult) {
      return res.status(404).json({
        error: 'Analysis result not found',
        message: `Analysis result with id ${id} does not exist`
      });
    }

    res.json(analysisResult);
  } catch (error) {
    next(error);
  }
};

// 공고별 분석 결과 조회
export const getAnalysisResultsByAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcementId = parseInt(req.params.announcementId);
    const analysisResults = await analysisService.getAnalysisResultsByAnnouncementId(announcementId);
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 새 분석 결과 생성
export const createAnalysisResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      announcement_id,
      summary,
      key_requirements,
      technical_specs,
      evaluation_criteria,
      complexity_score,
      feasibility_score,
      analysis_status,
      analysis_notes
    } = req.body;

    if (!announcement_id || !summary) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'announcement_id and summary are required'
      });
    }

    const analysisResult = await analysisService.createAnalysisResult({
      announcement_id: parseInt(announcement_id),
      summary,
      key_requirements,
      technical_specs,
      evaluation_criteria,
      complexity_score: complexity_score ? parseFloat(complexity_score) : undefined,
      feasibility_score: feasibility_score ? parseFloat(feasibility_score) : undefined,
      analysis_status,
      analysis_notes
    });

    res.status(201).json(analysisResult);
  } catch (error) {
    next(error);
  }
};

// 분석 결과 수정
export const updateAnalysisResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    if (updateData.complexity_score) {
      updateData.complexity_score = parseFloat(updateData.complexity_score);
    }
    if (updateData.feasibility_score) {
      updateData.feasibility_score = parseFloat(updateData.feasibility_score);
    }
    if (updateData.announcement_id) {
      updateData.announcement_id = parseInt(updateData.announcement_id);
    }

    const analysisResult = await analysisService.updateAnalysisResult(id, updateData);

    if (!analysisResult) {
      return res.status(404).json({
        error: 'Analysis result not found',
        message: `Analysis result with id ${id} does not exist`
      });
    }

    res.json(analysisResult);
  } catch (error) {
    next(error);
  }
};

// 분석 결과 삭제
export const deleteAnalysisResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await analysisService.deleteAnalysisResult(id);

    if (!success) {
      return res.status(404).json({
        error: 'Analysis result not found',
        message: `Analysis result with id ${id} does not exist`
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// 상태별 분석 결과 조회
export const getAnalysisResultsByStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.params;
    const analysisResults = await analysisService.getAnalysisResultsByStatus(status);
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 대기 중인 분석 조회
export const getPendingAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analysisResults = await analysisService.getPendingAnalysis();
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 완료된 분석 조회
export const getCompletedAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analysisResults = await analysisService.getCompletedAnalysis();
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 복잡도 범위별 분석 결과 조회
export const getAnalysisByComplexityRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const minScore = parseFloat(req.query.min as string) || 0;
    const maxScore = parseFloat(req.query.max as string) || 10;

    if (minScore < 0 || maxScore > 10 || minScore > maxScore) {
      return res.status(400).json({
        error: 'Invalid score range',
        message: 'Scores must be between 0-10 and min must be less than max'
      });
    }

    const analysisResults = await analysisService.getAnalysisByComplexityRange(minScore, maxScore);
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 실현가능성 범위별 분석 결과 조회
export const getAnalysisByFeasibilityRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const minScore = parseFloat(req.query.min as string) || 0;
    const maxScore = parseFloat(req.query.max as string) || 10;

    if (minScore < 0 || maxScore > 10 || minScore > maxScore) {
      return res.status(400).json({
        error: 'Invalid score range',
        message: 'Scores must be between 0-10 and min must be less than max'
      });
    }

    const analysisResults = await analysisService.getAnalysisByFeasibilityRange(minScore, maxScore);
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 분석을 완료로 표시
export const markAnalysisAsCompleted = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { analysis_notes } = req.body;
    
    const success = await analysisService.markAnalysisAsCompleted(id, analysis_notes);

    if (!success) {
      return res.status(404).json({
        error: 'Analysis result not found',
        message: `Analysis result with id ${id} does not exist`
      });
    }

    res.json({ message: 'Analysis marked as completed successfully' });
  } catch (error) {
    next(error);
  }
};

// 분석을 실패로 표시
export const markAnalysisAsFailed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { error_message } = req.body;

    if (!error_message) {
      return res.status(400).json({
        error: 'Missing error message',
        message: 'error_message is required when marking analysis as failed'
      });
    }

    const success = await analysisService.markAnalysisAsFailed(id, error_message);

    if (!success) {
      return res.status(404).json({
        error: 'Analysis result not found',
        message: `Analysis result with id ${id} does not exist`
      });
    }

    res.json({ message: 'Analysis marked as failed successfully' });
  } catch (error) {
    next(error);
  }
};

// 분석 통계
export const getAnalysisStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analysisService.getAnalysisStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// 최근 분석 결과 조회
export const getRecentAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const analysisResults = await analysisService.getRecentAnalysis(days);
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 분석 처리 실행
export const processAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await analysisService.processAnalysis(id);

    if (!success) {
      return res.status(400).json({
        error: 'Analysis processing failed',
        message: 'Analysis not found or not in pending status'
      });
    }

    res.json({ message: 'Analysis processing initiated successfully' });
  } catch (error) {
    next(error);
  }
};

// 고복잡도 분석 조회
export const getHighComplexityAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const threshold = parseFloat(req.query.threshold as string) || 7.0;
    const analysisResults = await analysisService.getHighComplexityAnalysis(threshold);
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 고실현가능성 분석 조회
export const getHighFeasibilityAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const threshold = parseFloat(req.query.threshold as string) || 7.0;
    const analysisResults = await analysisService.getHighFeasibilityAnalysis(threshold);
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};

// 추천 공고 조회
export const getRecommendedAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analysisResults = await analysisService.getRecommendedAnnouncements();
    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
};