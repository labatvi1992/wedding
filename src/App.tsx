import React, { useState, useEffect } from 'react';
import { WeddingConfig, Guest, GuestWish } from './types/wedding';
import {
  INITIAL_WEDDING_CONFIG,
  INITIAL_GUESTS,
  INITIAL_WISHES,
} from './data/initialData';
import { WeddingInvitationFeed } from './components/WeddingInvitationFeed';
import { GuestManagement } from './components/GuestManagement';

const STORAGE_KEYS = {
  GUESTS: 'wedding_invitation_guests_v4',
  CONFIG: 'wedding_invitation_config_v4',
  WISHES: 'wedding_invitation_wishes_v4',
};

export default function App() {
  const [view, setView] = useState<'invitation' | 'management'>('invitation');

  // Wedding Configuration state
  const [config, setConfig] = useState<WeddingConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : INITIAL_WEDDING_CONFIG;
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
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);

  useEffect(() => {
    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('guest') || params.get('name');
    const viewParam = params.get('view');

    if (viewParam === 'admin' || viewParam === 'management') {
      setView('management');
    }

    if (guestParam) {
      const decodedParam = decodeURIComponent(guestParam).toLowerCase().trim();
      const matched = guests.find(
        (g) =>
          (g.customSlug && g.customSlug.toLowerCase() === decodedParam) ||
          g.name.toLowerCase().includes(decodedParam) ||
          decodedParam.includes(g.name.toLowerCase())
      );

      if (matched) {
        setCurrentGuest(matched);
      } else {
        // Create personalized guest object for display
        const customName = decodeURIComponent(guestParam);
        setCurrentGuest({
          id: `guest-${Date.now()}`,
          name: customName,
          relationship: 'Khách quý',
          group: 'Bạn Chú rể',
          phone: '',
          status: 'pending',
          attendeesCount: 1,
        });
      }
    }
  }, [guests]);

  // Persist to local storage
  const handleUpdateGuests = (updated: Guest[]) => {
    setGuests(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(updated));
    } catch {
      // Storage quota or error
    }
  };

  const handleUpdateConfig = (updated: WeddingConfig) => {
    setConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    } catch {
      // Storage quota or error
    }
  };

  const handleAddWish = (newWish: GuestWish) => {
    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(updated));
    } catch {
      // Storage quota or error
    }
  };

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
      {view === 'invitation' ? (
        <WeddingInvitationFeed
          config={config}
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
