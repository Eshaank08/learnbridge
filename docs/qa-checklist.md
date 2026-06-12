# LearnBridge — QA Checklist

## Critical flows
- [x] Hindi query returns Biology → Photosynthesis → beginner cards.
- [x] English query "Why does gravity work?" returns Physics cards.
- [x] Follow-up after Biology lesson answers from lesson only.
- [x] Off-topic follow-up returns: "I can only help with questions about this lesson."
- [x] Mock mode returns pre-seeded responses with simulated latency.

## Error handling
- [ ] Empty search query shows nothing or inline error.
- [ ] Backend unreachable shows "Something went wrong. Try again."
- [ ] Lesson ID not found shows friendly not-found state.
- [ ] Slow API keeps skeleton cards visible.

## Verification commands

```bash
# Frontend
cd frontend && npm run build && npm run start

# Backend match mock
curl -X POST http://localhost:8000/api/match \
  -H "Content-Type: application/json" \
  -d '{"query":"explain gravity"}'

# Backend followup mock
curl -X POST http://localhost:8000/api/followup \
  -H "Content-Type: application/json" \
  -d '{"question":"What is chlorophyll?","lesson_id":"bio-001","lesson_summary":"Plants make their own food..."}'
```
