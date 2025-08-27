import { Request, Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/AnnouncementService';

const announcementService = new AnnouncementService();

// 모든 공고 조회
export const getAllAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (req.query.page || req.query.limit) {
      // 페이지네이션 적용
      const result = await announcementService.getAnnouncementsWithPagination(page, limit);
      res.json(result);
    } else {
      // 모든 공고 조회
      const announcements = await announcementService.getAllAnnouncements();
      res.json(announcements);
    }
  } catch (error) {
    next(error);
  }
};

// 특정 공고 조회
export const getAnnouncementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const announcement = await announcementService.getAnnouncementById(id);

    if (!announcement) {
      return res.status(404).json({
        error: 'Announcement not found',
        message: `Announcement with id ${id} does not exist`
      });
    }

    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

// 공고번호로 조회
export const getAnnouncementByBidNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bidNumber } = req.params;
    const announcement = await announcementService.getAnnouncementByBidNumber(bidNumber);

    if (!announcement) {
      return res.status(404).json({
        error: 'Announcement not found',
        message: `Announcement with bid number ${bidNumber} does not exist`
      });
    }

    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

// 새 공고 생성
export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      bid_number,
      title,
      description,
      contracting_agency,
      budget_amount,
      announcement_date,
      application_deadline,
      status = 'active',
      requirements,
      original_url
    } = req.body;

    // 기본 유효성 검사
    if (!bid_number || !title || !description || !contracting_agency || !budget_amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'bid_number, title, description, contracting_agency, and budget_amount are required'
      });
    }

    const announcement = await announcementService.createAnnouncement({
      bid_number,
      title,
      description,
      contracting_agency,
      budget_amount: parseInt(budget_amount),
      announcement_date: new Date(announcement_date),
      application_deadline: new Date(application_deadline),
      status,
      requirements,
      original_url
    });

    res.status(201).json(announcement);
  } catch (error) {
    if ((error as Error).message.includes('Duplicate entry')) {
      return res.status(409).json({
        error: 'Duplicate bid number',
        message: 'An announcement with this bid number already exists'
      });
    }
    next(error);
  }
};

// 공고 수정
export const updateAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    // 날짜 필드 변환
    if (updateData.announcement_date) {
      updateData.announcement_date = new Date(updateData.announcement_date);
    }
    if (updateData.application_deadline) {
      updateData.application_deadline = new Date(updateData.application_deadline);
    }
    if (updateData.budget_amount) {
      updateData.budget_amount = parseInt(updateData.budget_amount);
    }

    const announcement = await announcementService.updateAnnouncement(id, updateData);

    if (!announcement) {
      return res.status(404).json({
        error: 'Announcement not found',
        message: `Announcement with id ${id} does not exist`
      });
    }

    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

// 공고 삭제
export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await announcementService.deleteAnnouncement(id);

    if (!success) {
      return res.status(404).json({
        error: 'Announcement not found',
        message: `Announcement with id ${id} does not exist`
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// 활성 공고 조회
export const getActiveAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcements = await announcementService.getActiveAnnouncements();
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// 상태별 공고 조회
export const getAnnouncementsByStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.params;
    const announcements = await announcementService.getAnnouncementsByStatus(status);
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// 공고 검색
export const searchAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({
        error: 'Missing search term',
        message: 'Please provide a search term using the "q" query parameter'
      });
    }

    const announcements = await announcementService.searchAnnouncements(searchTerm);
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// 마감 예정 공고 조회
export const getUpcomingDeadlines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const announcements = await announcementService.getUpcomingDeadlines(days);
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// 공고 통계
export const getAnnouncementStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await announcementService.getAnnouncementStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};