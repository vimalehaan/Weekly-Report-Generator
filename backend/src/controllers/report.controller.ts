import type { NextFunction, Request, Response } from "express";
import * as reportService from "../services/report.service.js";
import { AppError } from "../utils/app-error.js";
import type { ReportListQueryInput } from "../validators/report.validator.js";

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
      req.query as ReportListQueryInput,
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

export async function getVersions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const versions = await reportService.getReportVersions(
      req.user!,
      req.params.id!,
    );
    res.status(200).json({ data: versions });
  } catch (error) {
    next(error);
  }
}

export async function getVersionById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const versionNumber = parsePositiveInteger(req.params.versionNumber);

    if (versionNumber === undefined) {
      throw new AppError(
        422,
        "VALIDATION_ERROR",
        "versionNumber: Must be a positive integer",
      );
    }

    const version = await reportService.getReportVersionById(
      req.user!,
      req.params.id!,
      versionNumber,
    );
    res.status(200).json({ data: version });
  } catch (error) {
    next(error);
  }
}
