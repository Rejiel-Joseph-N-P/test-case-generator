import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../lib/api";
import type { Requirement, TestCase, TestCaseUpdate } from "../types";

const keys = {
  list: ["requirements"] as const,
  one: (id: string) => ["requirements", id] as const,
};

export function useRequirements() {
  return useQuery({
    queryKey: keys.list,
    queryFn: () => request<Requirement[]>("/requirements"),
  });
}

export function useRequirement(id: string | null) {
  return useQuery({
    queryKey: keys.one(id ?? ""),
    queryFn: () => request<Requirement>(`/requirements/${id}`),
    enabled: !!id,
  });
}

export function useCreateRequirement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; rawText: string }) =>
      request<Requirement>("/requirements", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.list }),
  });
}

export function useGenerate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; feedback?: string }) =>
      request<Requirement>(`/requirements/${input.id}/generate`, {
        method: "POST",
        body: JSON.stringify({ feedback: input.feedback || undefined }),
      }),
    onSuccess: (data) => {
      qc.setQueryData(keys.one(data.id), data);
      qc.invalidateQueries({ queryKey: keys.list });
    },
  });
}

export function useSaveRequirement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<Requirement>(`/requirements/${id}/save`, { method: "POST" }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: keys.one(id) });
      qc.invalidateQueries({ queryKey: keys.list });
    },
  });
}

export function useDeleteRequirement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/requirements/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.list }),
  });
}

export function useUpdateTestCase(requirementId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; changes: TestCaseUpdate }) =>
      request<TestCase>(`/test-cases/${input.id}`, {
        method: "PATCH",
        body: JSON.stringify(input.changes),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.one(requirementId) }),
  });
}

export function useDeleteTestCase(requirementId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/test-cases/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.one(requirementId) }),
  });
}