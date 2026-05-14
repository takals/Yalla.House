# Glossary

## Terms
| Term | Meaning |
|------|---------|
| CF decode | Cloudflare email XOR obfuscation decode |
| coverage_areas | jsonb field on agent_profiles with postcode_prefixes array |
| edge function | Supabase Deno serverless function (bypasses CORS) |
| GIN index | Postgres index type for jsonb containment queries |
| Propertymark | UK professional body (NAEA/ARLA), source of 17K agents |
| IVD | Immobilienverband Deutschland, German agent association (~6K members) |
| FNAIM | French national estate agent federation |
| NVM | Dutch estate agent association (75% market share) |
| PLZ | German postcode (5-digit, e.g. 10115) |
| outward code | First half of UK postcode (e.g. SW11 from SW11 3RA) |
| RLS | Row Level Security (Supabase/Postgres) |
| seed email | Fake email pattern: name.location@propertymark.seed |
| flywheel | Self-reinforcing growth loop (signup research + user contributions + background discovery) |
| Home Passport | Hunter intake flow — conversational UI collecting search preferences |
| brief | Structured summary of what a hunter/owner is looking for |

## Project Codenames
| Name | What |
|------|------|
| Sprint Zero | GTM launch preparation phase |
| Street Team | Agent partnership outreach team |
| Command Centre | Operational dashboard (also a Drive folder) |

## File Locations
| What | Where |
|------|-------|
| GitHub PAT | Yalla.House/.claude/.gh-token |
| Vercel PAT | Yalla.House/.claude/.vercel-token |
| Strategy doc | Yalla.House/Agent-Database-Rollout-Strategy.docx |
| Agent data xlsx | Yalla.House/reports/ or Agent_Data_Strategy.xlsx |
| Edge functions | Supabase dashboard → Edge Functions |
