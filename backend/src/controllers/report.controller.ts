import { ReportStatus } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import * as reportService from "../services/report.service.js";

type ReportListFilters = {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  userId?: string;
  weekStartDate?: string;
};

function parsePositiveInteger(value: unknown): number | undefined {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function parseReportStatus(value: unknown): ReportStatus | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return Object.values(ReportStatus).includes(value as ReportStatus)
    ? (value as ReportStatus)
    : undefined;
}

function parseString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseReportListFilters(query: Request["query"]): ReportListFilters {
  return {
    page: parsePositiveInteger(query.page),
    limit: parsePositiveInteger(query.limit),
    status: parseReportStatus(query.status),
    userId: parseString(query.userId),
    weekStartDate: parseString(query.weekStartDate),
  };
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await reportService.createReport(req.user!, req.body);
    res.status(201).json({ data: report });
  } catch (error) {
    next(error);
  }
}

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { reports, pagination } = await reportService.getReports(
      req.user!,
      parseReportListFilters(req.query),
    );

    res.status(200).json({
      data: reports,
      pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await reportService.getReportById(req.params.id!, req.user!);
    res.status(200).json({ data: report });
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await reportService.updateReport(
      req.params.id!,
      req.user!,
      req.body,
    );
    res.status(200).json({ data: report });
  } catch (error) {
    next(error);
  }
}

export async function submit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await reportService.submitReport(req.params.id!, req.user!);
    res.status(200).json({ data: report });
  } catch (error) {
    next(error);
  }
}
