import type { NextFunction, Request, Response } from "express";
import * as reviewService from "../services/review.service.js";

export async function requestCorrection(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await reviewService.requestCorrection(
      req.params.id!,
      req.user!,
      req.body.comment,
    );
    res.status(200).json({ data: report });
  } catch (error) {
    next(error);
  }
}

export async function approve(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await reviewService.approveReport(
      req.params.id!,
      req.user!,
      req.body.comment,
    );
    res.status(200).json({ data: report });
  } catch (error) {
    next(error);
  }
}

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const review = await reviewService.addComment(
      req.params.id!,
      req.user!,
      req.body.comment,
    );
    res.status(201).json({ data: review });
  } catch (error) {
    next(error);
  }
}

export async function getReviews(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reviews = await reviewService.getReviews(req.params.id!, req.user!);
    res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function getStatusHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const history = await reviewService.getStatusHistory(
      req.params.id!,
      req.user!,
    );
    res.status(200).json({ data: history });
  } catch (error) {
    next(error);
  }
}
