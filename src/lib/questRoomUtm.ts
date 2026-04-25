/**
 * UTM tagging for /quest-room page traffic.
 *
 * Stamps `utm_content=quest-room-page` on outbound booking links from the
 * /quest-room landing. Uses utm_content (not utm_source) so the original
 * acquisition source (Google Ads, organic, social, etc.) is preserved —
 * only the last-touch content marker is overwritten on the booking record.
 */

export const QUEST_ROOM_UTM_QUERY = 'utm_content=quest-room-page';

export function withQuestRoomUtm(path: string): string {
  return `${path}${path.includes('?') ? '&' : '?'}${QUEST_ROOM_UTM_QUERY}`;
}
