"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { QuestRoomHero } from './QuestRoomHero';
import { QuestRoomStats } from './QuestRoomStats';
import { QuestRoomComparison } from './QuestRoomComparison';
import { QuestRoomReasons } from './QuestRoomReasons';
import { QuestRoomPicker } from './QuestRoomPicker';
import { QuestRoomProcess } from './QuestRoomProcess';
import { QuestRoomTrust } from './QuestRoomTrust';
import { QuestRoomFAQ } from './QuestRoomFAQ';
import { QuestRoomCTA } from './QuestRoomCTA';

export function QuestRoomClient() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <QuestRoomHero />
        <QuestRoomPicker />
        <QuestRoomStats />
        <QuestRoomComparison />
        <QuestRoomReasons />
        <QuestRoomProcess />
        <QuestRoomTrust />
        <QuestRoomFAQ />
        <QuestRoomCTA />
      </main>
      <Footer />
    </div>
  );
}
