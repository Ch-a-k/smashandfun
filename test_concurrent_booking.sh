#!/bin/bash
# =============================================================
# Test: Concurrent booking race condition
#
# This script sends N concurrent booking requests to the same
# time slot and verifies that at most [number_of_rooms] succeed.
#
# Usage:
#   chmod +x test_concurrent_booking.sh
#   ./test_concurrent_booking.sh
#
# Prerequisites:
#   - Dev server running: npm run dev (http://localhost:3000)
#   - supabase_booking_lock.sql migration applied
#   - A valid package ID (update PACKAGE_ID below)
# =============================================================

BASE_URL="http://localhost:3000"
PACKAGE_ID="REPLACE_WITH_YOUR_PACKAGE_ID"  # <-- set a real package ID
DATE="2026-05-01"       # Pick a date with no existing bookings
TIME="15:00"
CONCURRENT=5            # Send 5 requests simultaneously

echo "=== Concurrent Booking Test ==="
echo "Sending $CONCURRENT simultaneous booking requests..."
echo "Package: $PACKAGE_ID"
echo "Date: $DATE Time: $TIME"
echo ""

PIDS=()
RESULTS=()

for i in $(seq 1 $CONCURRENT); do
  curl -s -o "/tmp/booking_result_$i.json" -w "%{http_code}" \
    -X POST "$BASE_URL/api/booking/create" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"test${i}@example.com\",
      \"packageId\": \"$PACKAGE_ID\",
      \"date\": \"$DATE\",
      \"time\": \"$TIME\",
      \"name\": \"Test User $i\",
      \"phone\": \"+48500000${i}00\"
    }" > "/tmp/booking_status_$i.txt" &
  PIDS+=($!)
done

# Wait for all requests to complete
for pid in "${PIDS[@]}"; do
  wait $pid
done

echo "Results:"
echo "--------"

SUCCESS=0
CONFLICT=0
ERROR=0

for i in $(seq 1 $CONCURRENT); do
  STATUS=$(cat "/tmp/booking_status_$i.txt")
  BODY=$(cat "/tmp/booking_result_$i.json")

  if [ "$STATUS" = "200" ]; then
    ROOM_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('booking',{}).get('room_id','?'))" 2>/dev/null)
    echo "  Request $i: ✅ SUCCESS (status=$STATUS, room=$ROOM_ID)"
    SUCCESS=$((SUCCESS + 1))
  elif [ "$STATUS" = "409" ]; then
    echo "  Request $i: 🚫 NO ROOM (status=$STATUS) — correctly rejected"
    CONFLICT=$((CONFLICT + 1))
  else
    echo "  Request $i: ❌ ERROR (status=$STATUS)"
    echo "    $BODY"
    ERROR=$((ERROR + 1))
  fi

  rm -f "/tmp/booking_result_$i.json" "/tmp/booking_status_$i.txt"
done

echo ""
echo "=== Summary ==="
echo "Successful bookings: $SUCCESS"
echo "Correctly rejected:  $CONFLICT"
echo "Errors:              $ERROR"
echo ""

if [ $ERROR -eq 0 ]; then
  echo "✅ Test PASSED — no unexpected errors"
  if [ $SUCCESS -le 3 ]; then
    echo "✅ At most 3 rooms were booked (allowed_rooms limit respected)"
  else
    echo "⚠️  More than 3 rooms booked — check allowed_rooms config"
  fi
else
  echo "❌ Test had errors — check output above"
fi

echo ""
echo "Don't forget to clean up test bookings in Supabase!"
echo "DELETE FROM bookings WHERE user_email LIKE 'test%@example.com' AND date = '$DATE';"
