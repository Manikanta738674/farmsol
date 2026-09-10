// Universal Persistent Repository for SmartFarmer Operator Desk

export const persistentRepo = {
  saveOperator(operator: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_active_operator', JSON.stringify(operator));
    } catch (e) {}
  },

  getOperator(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('farmsol_active_operator');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveQueue(queue: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_operator_queue', JSON.stringify(queue));
    } catch (e) {}
  },

  getQueue(): any[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('farmsol_operator_queue');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveServing(serving: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_current_serving', JSON.stringify(serving));
    } catch (e) {}
  },

  getServing(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('farmsol_current_serving');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  savePaymentsLedger(ledger: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_payments_ledger', JSON.stringify(ledger));
    } catch (e) {}
  },

  getPaymentsLedger(): any[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('farmsol_payments_ledger');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
};
