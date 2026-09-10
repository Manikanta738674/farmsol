// Universal Persistent Repository for SmartFarmer Frontends

export const persistentRepo = {
  // Active Farmer Profile
  saveActiveFarmer(farmer: any) {
    if (typeof window === 'undefined') return;
    try {
      if (!farmer) {
        localStorage.removeItem('farmsol_active_farmer');
        return;
      }
      localStorage.setItem('farmsol_active_farmer', JSON.stringify(farmer));
      // Also append or update in registered farmers directory
      const existing = this.getRegisteredFarmers();
      const cleanMobile = farmer.mobile ? String(farmer.mobile).replace(/\D/g, '') : '';
      const foundIdx = existing.findIndex(f => {
        const fClean = f.mobile ? String(f.mobile).replace(/\D/g, '') : '';
        return (cleanMobile && fClean && fClean === cleanMobile) || (farmer.farmerId && f.farmerId === farmer.farmerId);
      });
      if (foundIdx >= 0) {
        existing[foundIdx] = { ...existing[foundIdx], ...farmer };
      } else {
        existing.unshift(farmer);
      }
      localStorage.setItem('farmsol_registered_farmers', JSON.stringify(existing));
    } catch (e) {}
  },

  getActiveFarmer(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('farmsol_active_farmer');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  getRegisteredFarmers(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('farmsol_registered_farmers');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Active Booking
  saveActiveBooking(booking: any | null) {
    if (typeof window === 'undefined') return;
    try {
      if (booking) {
        localStorage.setItem('farmsol_active_booking', JSON.stringify(booking));
        // Also update my bookings list
        const list = this.getMyBookings();
        const idx = list.findIndex(b => b.bookingId === booking.bookingId || b.tokenId === booking.tokenId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...booking };
        } else {
          list.unshift(booking);
        }
        localStorage.setItem('farmsol_my_bookings', JSON.stringify(list));
      } else {
        localStorage.removeItem('farmsol_active_booking');
      }
    } catch (e) {}
  },

  getActiveBooking(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('farmsol_active_booking');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Bookings List
  saveMyBookings(bookings: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_my_bookings', JSON.stringify(bookings));
    } catch (e) {}
  },

  getMyBookings(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('farmsol_my_bookings');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Crops & Guaranteed MSP Rates
  saveCrops(crops: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_crops_list', JSON.stringify(crops));
    } catch (e) {}
  },

  getCrops(): any[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('farmsol_crops_list');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Procurement Payments & Passbook Records
  saveProcurements(records: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_procurements', JSON.stringify(records));
    } catch (e) {}
  },

  getProcurements(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('farmsol_procurements');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Language Preference
  saveLanguage(lang: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('farmsol_lang', lang);
    } catch (e) {}
  },

  getLanguage(): string {
    if (typeof window === 'undefined') return 'te';
    try {
      return localStorage.getItem('farmsol_lang') || 'te';
    } catch (e) {
      return 'te';
    }
  },

  clearSession() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('farmsol_active_farmer');
      localStorage.removeItem('farmsol_active_booking');
    } catch (e) {}
  }
};
