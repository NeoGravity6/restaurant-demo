import { useState, useEffect, useRef } from "react";

export const ORDER_STAGES = [
  { key: "confirmed", label: "Confirmée" },
  { key: "preparing", label: "En préparation" },
  { key: "delivering", label: "En livraison" },
  { key: "delivered", label: "Livrée" },
];

// Cumulative fraction of DEMO_TOTAL_DURATION_MS at which each stage begins.
const STAGE_START_FRACTIONS = [0, 0.15, 0.5, 1.0];

export const DEMO_TOTAL_DURATION_MS = 30_000;

// Must match the CSS transition length used for stage/connector animation.
const STAGE_TRANSITION_MS = 550;

const TICK_MS = 200;

const STORAGE_KEY = "restaurant-demo:activeOrder";

export function generateOrderNumber() {
  return "DL-" + Math.floor(10000 + Math.random() * 90000);
}

export function computeTargetStage(elapsedMs) {
  const t = Math.min(Math.max(elapsedMs, 0) / DEMO_TOTAL_DURATION_MS, 1);
  let stageIndex = 0;
  for (let i = STAGE_START_FRACTIONS.length - 1; i >= 0; i--) {
    if (t >= STAGE_START_FRACTIONS[i]) {
      stageIndex = i;
      break;
    }
  }
  return { stageIndex, overallProgress: t };
}

export function computeDeliveringProgress(elapsedMs) {
  const start = STAGE_START_FRACTIONS[2] * DEMO_TOTAL_DURATION_MS;
  const end = STAGE_START_FRACTIONS[3] * DEMO_TOTAL_DURATION_MS;
  return Math.min(Math.max((elapsedMs - start) / (end - start), 0), 1);
}

export function computeRemainingEtaMinutes(elapsedMs, totalEtaMinutes) {
  const remainingMs = Math.max(DEMO_TOTAL_DURATION_MS - elapsedMs, 0);
  return Math.max(Math.ceil((remainingMs / DEMO_TOTAL_DURATION_MS) * totalEtaMinutes), 0);
}

export function loadActiveOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.orderTime !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveActiveOrder(order) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore storage failures (e.g. private browsing quota)
  }
}

export function clearActiveOrder() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useOrderProgress(orderTimeMs) {
  const [stageIndex, setStageIndex] = useState(
    () => computeTargetStage(Date.now() - orderTimeMs).stageIndex
  );
  const lockedRef = useRef(false);

  useEffect(() => {
    function tick() {
      if (lockedRef.current) return;
      const { stageIndex: target } = computeTargetStage(Date.now() - orderTimeMs);
      setStageIndex((current) => {
        if (target > current) {
          lockedRef.current = true;
          setTimeout(() => {
            lockedRef.current = false;
          }, STAGE_TRANSITION_MS);
          return current + 1;
        }
        return current;
      });
    }

    const id = setInterval(tick, TICK_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [orderTimeMs]);

  const elapsedMs = Date.now() - orderTimeMs;
  const deliveringProgress = computeDeliveringProgress(elapsedMs);

  return { stageIndex, deliveringProgress, elapsedMs };
}
