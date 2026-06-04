"use client";

import { useState } from "react";
import RsvpModal from "./RsvpModal";

interface EventDetailRsvpProps {
  eventId: string;
  eventTitle: string;
  rsvpCount: number;
}

export default function EventDetailRsvp({ eventId, eventTitle, rsvpCount }: EventDetailRsvpProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <div className="flex items-center gap-4">
        {rsvpCount >= 1 && (
          <span className="text-sm text-primary-600 font-medium">
            {rsvpCount} {rsvpCount === 1 ? "person" : "people"} going
          </span>
        )}
        <button
          onClick={() => setModalOpen(true)}
          className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          Going &rarr;
        </button>
      </div>
      <RsvpModal
        eventId={eventId}
        eventTitle={eventTitle}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
