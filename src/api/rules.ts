import api from "./axios";
import { PaginatedResponse } from "./analyses";

export type SeverityType = "low" | "medium" | "high" | "critical";
export type RuleType = "payload" | "port";

export interface CustomRuleRead {
  id: string;
  user_id: string;
  name: string;
  rule_type: RuleType;
  value: string;
  alert_type: string;
  severity: SeverityType;
}

export interface CustomRuleCreate {
  name: string;
  rule_type: RuleType;
  value: string;
  alert_type: string;
  severity: SeverityType;
}

export interface CustomRuleUpdate {
  name?: string;
  rule_type?: RuleType;
  value?: string;
  alert_type?: string;
  severity?: SeverityType;
}

export const getRules = async (page = 1, size = 10): Promise<PaginatedResponse<CustomRuleRead>> => {
  const response = await api.get<PaginatedResponse<CustomRuleRead>>("/rules/", {
    params: { page, size },
  });
  return response.data;
};

export const createRule = async (ruleData: CustomRuleCreate): Promise<CustomRuleRead> => {
  const response = await api.post<CustomRuleRead>("/rules/", ruleData);
  return response.data;
};

export const updateRule = async (ruleId: string, ruleData: CustomRuleUpdate): Promise<CustomRuleRead> => {
  const response = await api.put<CustomRuleRead>(`/rules/${ruleId}`, ruleData);
  return response.data;
};

export const deleteRule = async (ruleId: string): Promise<void> => {
  await api.delete(`/rules/${ruleId}`);
};