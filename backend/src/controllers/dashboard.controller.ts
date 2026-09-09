import type { NextFunction, Request, Response } from "express";
import type { DashboardFilters } from "../services/dashboard.service.js";
import * as dashboardService from "../services/dashboard.service.js";

function parseString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseDashboardFilters(query: Request["query"]): DashboardFilters {
  const weekStartDate = parseString(query.weekStartDate);

  return weekStartDate ? { weekStartDate } : {};
}

export async function getSummary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const summary = await dashboardService.getSummary(
      req.user!,
      parseDashboardFilters(req.query),
    );
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
}

export async function getTaskTrends(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const trends = await dashboardService.getTaskTrends(
      req.user!,
      parseDashboardFilters(req.query),
    );
    res.status(200).json({ data: trends });
  } catch (error) {
    next(error);
  }
}

export async function getStatusByMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await dashboardService.getStatusByMember(
      req.user!,
      parseDashboardFilters(req.query),
    );
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getWorkloadByProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await dashboardService.getWorkloadByProject(
      req.user!,
      parseDashboardFilters(req.query),
    );
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getTimeByTaskType(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await dashboardService.getTimeByTaskType(
      req.user!,
      parseDashboardFilters(req.query),
    );
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getRecentActivity(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await dashboardService.getRecentActivity(
      req.user!,
      parseDashboardFilters(req.query),
    );
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}
