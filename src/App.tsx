import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WeddingConfig, Guest, GuestWish } from './types/wedding';
import {
  INITIAL_WEDDING_CONFIG,
  INITIAL_GUESTS,
  INITIAL_WISHES,
} from './data/initialData';
import { WeddingInvitationFeed } from './components/WeddingInvitationFeed';
import { GuestManagement } from './components/GuestManagement';
import { SetupGuestLinkPage } from './components/SetupGuestLinkPage';

const STORAGE_KEYS = {
  GUESTS: 'wedding_invitation_guests_v6',
  CONFIG: 'wedding_invitation_config_v6',
  WISHES: 'wedding_invitation_wishes_v6',
};

const detectInitialView = (): 'invitation' | 'management' | 'setup' => {
  if (typeof window === 'undefined') return 'invitation';

  const path = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');

  if (
    path === '/thiet-lap' ||
    path.endsWith('/thiet-lap') ||
    hash === 'thiet-lap' ||
    viewParam === 'setup' ||
    viewParam === 'thiet-lap' ||
    params.has('thiet-lap')
  ) {
    return 'setup';
  }

  if (
    path === '/quan-ly' ||
    hash === 'quan-ly' ||
    viewParam === 'admin' ||
    viewParam === 'management'
  ) {
    return 'management';
  }

  return 'invitation';
};

export default function App() {
  const [view, setView] = useState<'invitation' | 'management' | 'setup'>(detectInitialView);

  // Wedding Configuration state (prioritize code constants in INITIAL_WEDDING_CONFIG, keep saved Sheet URLs)
  const [config, setConfig] = useState<WeddingConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          ...INITIAL_WEDDING_CONFIG,
          googleSheetUrl: parsed.googleSheetUrl || INITIAL_WEDDING_CONFIG.googleSheetUrl,
          googleSheetWebAppUrl:
            INITIAL_WEDDING_CONFIG.googleSheetWebAppUrl || parsed.googleSheetWebAppUrl || '',
        };
      }
      return INITIAL_WEDDING_CONFIG;
    } catch {
      return INITIAL_WEDDING_CONFIG;
    }
  });

  // Guest List state
  const [guests, setGuests] = useState<Guest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUESTS);
      return saved ? JSON.parse(saved) : INITIAL_GUESTS;
    } catch {
      return INITIAL_GUESTS;
    }
  });

  // Wishes state
  const [wishes, setWishes] = useState<GuestWish[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHES);
      return saved ? JSON.parse(saved) : INITIAL_WISHES;
    } catch {
      return INITIAL_WISHES;
    }
  });

  // Identify current guest if opened via personalized link (?guest=... or ?name=...)
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const guestParam = params.get('name') || params.get('guest');
      if (guestParam) {
        const customName = decodeURIComponent(guestParam).trim();
        if (customName) {
          return {
            id: `guest-init`,
            name: customName,
            relationship: 'Khách quý',
            group: 'Bạn Chú rể',
            phone: '',
            status: 'pending',
            attendeesCount: 1,
          };
        }
      }
    }
    return null;
  });

  const guestsRef = useRef(guests);
  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);

  useEffect(() => {
    const syncFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      const guestParam = params.get('name') || params.get('guest');

      setView(detectInitialView());

      if (guestParam) {
        const decodedParam = decodeURIComponent(guestParam).trim();
        const lowerParam = decodedParam.toLowerCase();
        const matched = guestsRef.current.find(
          (g) =>
            (g.customSlug && decodeURIComponent(g.customSlug).toLowerCase() === lowerParam) ||
            g.name.toLowerCase() === lowerParam
        );

        if (matched) {
          setCurrentGuest(matched);
        } else if (decodedParam) {
          setCurrentGuest({
            id: `guest-${Date.now()}`,
            name: decodedParam,
            relationship: 'Khách quý',
            group: 'Bạn Chú rể',
            phone: '',
            status: 'pending',
            attendeesCount: 1,
          });
        } else {
          setCurrentGuest(null);
        }
      } else {
        setCurrentGuest(null);
      }
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, []);

  const handleNavigateToHomeWithGuest = (guestName?: string) => {
    const trimmed = guestName?.trim();
    const targetUrl = trimmed ? `/?name=${encodeURIComponent(trimmed)}` : '/';
    window.history.pushState({}, '', targetUrl);
    if (trimmed) {
      setCurrentGuest({
        id: `guest-${Date.now()}`,
        name: trimmed,
        relationship: 'Khách quý',
        group: 'Bạn Chú rể',
        phone: '',
        status: 'pending',
        attendeesCount: 1,
      });
    } else {
      setCurrentGuest(null);
    }
    setView('invitation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Persist to local storage
  const handleUpdateGuests = useCallback((updated: Guest[]) => {
    setGuests((prev) => {
      if (prev.length === updated.length && JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }
      try {
        localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(updated));
      } catch {
        // Storage quota or error
      }
      return updated;
    });
  }, []);

  const handleUpdateConfig = useCallback((updated: WeddingConfig) => {
    setConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    } catch {
      // Storage quota or error
    }
  }, []);

  const handleAddWish = useCallback((newWish: GuestWish) => {
    setWishes((prev) => {
      const updated = [newWish, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(updated));
      } catch {
        // Storage quota or error
      }
      return updated;
    });
  }, []);

  const handleSaveRsvp = (guestData: Partial<Guest>, wishContent?: string) => {
    if (!guestData.name) return;

    // Check if guest exists in list
    const existingIdx = guests.findIndex(
      (g) =>
        (currentGuest && g.id === currentGuest.id) ||
        g.name.toLowerCase() === guestData.name?.toLowerCase() ||
        (guestData.phone && g.phone === guestData.phone)
    );

    let updatedGuests: Guest[];
    if (existingIdx >= 0) {
      updatedGuests = [...guests];
      updatedGuests[existingIdx] = {
        ...updatedGuests[existingIdx],
        ...guestData,
        confirmedAt: new Date().toISOString(),
      } as Guest;
      setCurrentGuest(updatedGuests[existingIdx]);
    } else {
      const newGuest: Guest = {
        id: `g-${Date.now()}`,
        name: guestData.name,
        relationship: guestData.relationship || 'Khách mời xác nhận',
        group: guestData.group || 'Bạn Chú rể',
        phone: guestData.phone || '',
        status: guestData.status || 'attending',
        attendeesCount: guestData.attendeesCount || 1,
        dietaryPreference: guestData.dietaryPreference || 'standard',
        wish: guestData.wish,
        confirmedAt: new Date().toISOString(),
      };
      updatedGuests = [newGuest, ...guests];
      setCurrentGuest(newGuest);
    }

    handleUpdateGuests(updatedGuests);

    // If guest left a wish, also add it to wishes guestbook
    if (wishContent && wishContent.trim()) {
      handleAddWish({
        id: `w-${Date.now()}`,
        author: guestData.name,
        relationship: 'Khách mời',
        content: wishContent.trim(),
        createdAt: new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans-clean antialiased selection:bg-rose-900 selection:text-white">
      {view === 'setup' ? (
        <SetupGuestLinkPage
          config={config}
          guests={guests}
          onUpdateGuests={handleUpdateGuests}
          onUpdateConfig={handleUpdateConfig}
          onBackToHome={handleNavigateToHomeWithGuest}
        />
      ) : view === 'invitation' ? (
        <WeddingInvitationFeed
          config={config}
          guests={guests}
          currentGuest={currentGuest}
          wishes={wishes}
          onSaveRsvp={handleSaveRsvp}
          onAddWish={handleAddWish}
          onOpenManagement={() => setView('management')}
        />
      ) : (
        <GuestManagement
          guests={guests}
          config={config}
          wishes={wishes}
          onUpdateGuests={handleUpdateGuests}
          onUpdateConfig={handleUpdateConfig}
          onBackToInvitation={() => setView('invitation')}
        />
      )}
    </div>
  );
}
