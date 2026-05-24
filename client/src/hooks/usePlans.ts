import { useState, useCallback } from 'react';
import * as planApi from '../api/plan';
import type { BodyDataDTO, FitnessPlanDTO } from '../types';

export function usePlans() {
  const [plans, setPlans] = useState<FitnessPlanDTO[]>([]);
  const [currentPlan, setCurrentPlan] = useState<FitnessPlanDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await planApi.getPlans();
      setPlans(res.data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePlan = useCallback(async (data: BodyDataDTO): Promise<FitnessPlanDTO> => {
    setLoading(true);
    try {
      const res = await planApi.generatePlan(data);
      setCurrentPlan(res.data);
      return res.data;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlanById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await planApi.getPlanById(id);
      setCurrentPlan(res.data);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch plan:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const removePlan = useCallback(async (id: string) => {
    try {
      await planApi.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete plan:', error);
      throw error;
    }
  }, []);

  return {
    plans,
    currentPlan,
    loading,
    fetchPlans,
    generatePlan,
    fetchPlanById,
    removePlan,
  };
}
