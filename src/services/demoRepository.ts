import { initialState } from "../data/fixtures";
import type { DemoState } from "../domain/model";
const key = "occidental-crm-demo-v1";
export function loadDemo(): DemoState {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const state = JSON.parse(data);
      if (
        state.inquiries &&
        state.customers &&
        state.tasks &&
        state.quotes &&
        state.savedViews
      )
        return state;
    }
  } catch {
    /* corrupt or unavailable storage; fixtures are explicit demo only */
  }
  return initialState();
}
export function persistDemo(state: DemoState) {
  localStorage.setItem(key, JSON.stringify(state));
}
export function resetDemo() {
  localStorage.removeItem(key);
  return initialState();
}
