// Universal Persistent Repository for SmartFarmer DoCA Admin Portal

export const persistentRepo = {
  saveAdmin(admin: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_active_admin', JSON.stringify(admin));
    } catch (e) {}
  },

  getAdmin(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('farmsol_active_admin');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveOperators(operators: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('smartfarmer_operators_list', JSON.stringify(operators));
    } catch (e) {}
  },

  getOperators(): any[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('smartfarmer_operators_list');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCrops(crops: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('smartfarmer_crop_rates', JSON.stringify(crops));
    } catch (e) {}
  },

  getCrops(): any[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('smartfarmer_crop_rates');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCentres(centres: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('smartfarmer_centres_list', JSON.stringify(centres));
    } catch (e) {}
  },

  getCentres(): any[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('smartfarmer_centres_list');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveAuditLogs(logs: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('smartfarmer_audit_logs', JSON.stringify(logs));
    } catch (e) {}
  },

  getAuditLogs(): any[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('smartfarmer_audit_logs');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
};
