# Memory

## Me
Soshanna Salsman (Sosh), VP of Acquisition at Toothpillow.

## People
| Who | Role |
|-----|------|
| **Bree** | Customer Success / customer service |
| **Michele** | Approvals — ambassador cards, content |
| **Marci** | Ambassador incentive payouts, travel, billing |
| **Dr. Leary** | Ambassador dashboard dev |
| **Jamie** | Design — assessment page, creative |
| **Andrea** | Circle.so design, GHL, social post design |
| **Tania** | Sosh's assistant — ambassador-parent onboarding, social media DM management, Circle.so; available for broader help but Sosh is a perfectionist and hard to fully delegate to |
| **Kenny P** | Content; co-manages dev request channel with Roberto |
| **Britain** | Ambassador Slack tracking |
| **Caroline** | Before/afters for ambassadors — pending check |
| **Trevor** | Video team — reels |
| **Mark** | Video editor |
| **Roberto** | Reviews copyright bot requests in Slack; co-manages dev request channel with Kenny |
| **Noah Olson** | Alex Clark / Culture Apothecary (noah.olson@tpusa.com) |
| **Sharon Kitchell** | Daily Wire contact |
| **Alex Tombul** | Discover Ag Podcast (alex@tombulmedia.com) |
| **Katherine** | Zebra brand contact |
| **Ryan McWood** | Dream Recovery (ryan@dreamrecovery.io) |
| **Natalie** | Discover Ag host; also Alex Clark guest scheduling |
| **Tara** | Discover Ag host |
| **Kamryn** | Newsletter links — Culture Apothecary |

## Terms
| Term | Meaning |
|------|---------|
| GHL | GoHighLevel — email/automation platform (Andrea manages) |
| Circle.so | Community platform for the Ambassador Course |
| EverWebinar / eWebinar | On-demand webinar platform — email sequences drafted, promo code PILLO for free video upgrade |
| AudioGo | SiriusXM's digital ad platform |
| NNM | NATURALNURSEMOMMA — Lauren Johnson's Instagram (545K followers, high-performing ambassador) |
| "Shadow Trip" | Transcription error for "Shannon Tripp" — if it appears in transcripts/notes, it means Shannon Tripp, not a trip |
| MTD | Month-to-date — MTD tracking dashboard in Tracking & Analytics folder |
| DISCOVER | Promo code for Discover Ag podcast listeners |
| PILLO | Promo code for webinar attendees — free video upgrade on assessment |

## People (additional)
| Who | Role |
|-----|------|
| **Keeley Boehm** | SiriusXM Sales Executive (keeley.boehm@siriusxm.com, 619-606-0519) — existing relationship |
| **Taylor Calmus** | DudeDad influencer — potential ambassador tip from Elise Hylden (don't reference Elise) |
| **Tricia Ross** | Ambassador — opening bookstore/classroom space in May, potential in-person event |

## Projects
| Project | What |
|---------|------|
| **Assessment Page** | Live since Feb 27 — example video still needed |
| **Ambassador Course** | Circle.so — invite links + access groups configured, voice refinement ongoing |
| **Ambassador Ebook** | Layout v3 exists — copy refinement first, then design |
| **Affiliate Link Log** | `Affiliate Program/Affiliate-Link-Log.md` — cross-reference of who has an affiliate link vs. who doesn't. Updated Jun 19. To refresh: re-export affiliates CSV from affiliate platform + Full List from Salesforce, then re-run cross-reference. High priority section flags active producers without links. |
| **Affiliate Tier System** | Scalable tier structure — design phase |
| **Alex Clark / Culture Apothecary** | $27K Feb–May + $23K June–Dec. Noah = contact. **Aug schedule:** Newsletter Wk 3, ad read 8/10, IG Story Wk 2. **Sep schedule:** Newsletter Wk 3, ad read 9/10, IG Story Wk 2. |
| **Daily Wire** | Michael Knowles completed. Isabel Brown airing Friday 8/15. Surprise second Knowles filming done, air date TBD. Waiting on schedule for remaining ad reads. Sharon Kitchell = contact. |
| **Discover Ag Podcast** | Re-engaged. $4,500 package: 1x guest + 5x :60 ad reads. Code DISCOVER. Need dates for remaining ad reads. Alex Tombul = contact. |
| **SiriusXM / AudioGo** | Paused — not doing at this time. |
| **Google Ads** | Live since late March. Conversion action broke ~Jul 14, fixed ~Jul 26. Conversions tracking again (14-27/day in Aug). Do NOT suggest healthcare verification or negative keyword additions as action items — Sosh cannot execute these and has asked not to see them surfaced. |
| **Podcast Outreach** | 12 target shows, emails drafted. Top priority: Dr. Mark Hyman (had Nestor on). Mel Robbins + Megyn Kelly via SiriusXM relationship. |
| **FAQ Page** | Full spec + interactive mockup complete — waiting on dev to build |
| **Adult Landing Page** | Wireframe built — waiting on dev |
| **EWebinar** | Email sequences done (code PILLO). Still needs to go live. |
| **Ambassador Text Outreach** | Complete (per Sosh, Aug 13). Convo log in Affiliate Program folder. |
| **Meta Ads** | Paused — not running. Previous whitelist ad through Wendy ended. |
| **Shannon Tripp** | Top ambassador, currently in Japan, hard to pin down — re-engage when she's back. (Older notes saying "Shadow Trip" were a voice-transcription error for her name.) |
| **Savvy Giveaway** | IG giveaway starting Aug 28, 2026. Expected to drive a significant wave of new IG followers. |
| **Pinterest** | Automated pin link updater running daily |
| **Zebra** | Brand partnership — shared story in progress. Katherine = contact. |
| **Dream Recovery** | Ryan McWood. Product received. Keep warm. |
| **IG Creator Pipeline** | Mini-HypeAuditor: find 30K+ creators among Toothpillow's 132,492 IG followers. LIVE as of Aug 13. Existing "Toothpillow App" (Meta app 2427635767580584, toothpillow_official portfolio) got Instagram API use case + instagram_basic/instagram_manage_insights/pages_show_list/business_management. 60-day token in `.ig-token` at brain root (expires ~Oct 12 — regenerate in Graph Explorer + re-run exchange with `.ig-secret`). IG account ID 17841457248258389. Crawler: `Tracking & Analytics/IG-Followers/crawler.py` (resumable, ~189 lookups/hr, newest followers first, full pass ≈ 4 weeks). Results: `results.csv` (status ok/not_found; not_found = personal account). Restart after reboot: double-click `run-crawler.command` (starts crawler + sync loop). DEPLOYED: "IG Creators" dashboard tab live at toothpillow-dashboard-rho.vercel.app (basic-auth creds in `.dashboard-auth`, dashboard URL in `.dashboard-url`, both in IG-Followers folder). Supabase table `ig_creators`; `sync.py --loop` pushes results every 5 min to `/api/creators`. First 262 analyzed → 6 accounts at 30K+. Next: cross-ref vs ambassador list (`is_ambassador` column exists, unpopulated). |
| **Baby Submissions** | Not launched yet. Sosh will own acquisition. |
| **Adult Submissions** | Not launched yet. Sosh will own acquisition. |

## Ambassador Program Stats (August 13, 2026)
544 total ambassadors (401 Amb, 125 Inf, 17 Podcast) as of Aug 13. 2026 YTD adds: 183 (Jan 8, Feb 14, Mar 13, Apr 33, May 26, Jun 32, Jul 32, Aug 25). July adds: Kathryn Holland (Amb 7/1), Abigale Walk (Amb 7/1), Jordan Fuentes (Amb 7/1), Kirstin Robison (Amb 7/2), Alicia Nussbaum (Amb 7/6), Katriina Kumpula (Amb 7/6), Kelsey Grba (Amb 7/6), Shyanne Pilch (Inf 7/6), Jennifer Abreau (Amb 7/8), Mandee Allen (Amb 7/13), Elizaveta Nebesnaia (Amb 7/13), Isabel Brown Podcast (Podcast 7/17), Stephanie Shupe 1 (Amb 7/20), Alisabeth Dixon (Amb 7/20), Jillian Jerele (Amb 7/20), Sarah Budd (Amb 7/21), Hillary Russon (Amb 7/22), Sarah Steuart (Amb 7/22), Andrea Incollingo (Amb 7/22), Makenze Cameron (Amb 7/22), Kailee May (Amb 7/22), Kristan Rausch (Amb 7/22), Lauren Jarvis (Amb 7/22), Krista Morgan (Amb 7/22), Jessica Gingrich (Amb 7/22), Kari Wilson (Amb 7/22), Madison Repavich (Amb 7/22), Juanique Grover (Inf 7/22), Kelsey Vinsel (Amb 7/23), Season Swift (Amb 7/27), Bridget Sutton (Amb 7/27), Dr Juleah Cintron (Amb 7/30). August adds: Lucy Bochsler (Amb 8/3), Dana Mazzarella (Amb 8/3), Lisa Watson (Amb 8/3), Ariana Perdomo Ramirez (Amb 8/3), Brittany Fisher (Amb 8/3), Evelyn Coto-Chang (Amb 8/3), Jorgina Andrea (Amb 8/3), Haleigh Markar (Amb 8/3), Lauren Kight (Amb 8/3), Ana Altamirano (Amb 8/5), Maria Loewen (Amb 8/5), Mary Smith (Amb 8/5), Shelby Norwick (Amb 8/6), Elle Ritenburg (Amb 8/6), She MD (Podcast 8/6), Tell Me More/ Tell Me I'm a Good Mom (Podcast 8/6), Healthy Elizabeth (Podcast 8/6), After bedtime with Big Little Feelings (Podcast 8/6), Behaviour Blueprint (Podcast 8/6), The Sarah Fraser Show (Podcast 8/6), Emeline Robbin (Amb 8/7), Kyleigh Stennis (Amb 8/10), Amanda Herbert (Amb 8/10), Kim Petree (Amb 8/10), Christian Velez (Inf 8/12). July 2026 final submissions (referral type, corrected for retroactive reclassification): 1,967 total (Influencer 599, Dental Office 390, Online Search 329, Podcast 161, Parent 121, Google Ad 93, Airway Ambassador 73, Instagram 79, Unknown Referral 68, Facebook 22, Unknown Prof Ref 18, Brand Amb 4, Meta Ad 4, MYO 3, HCP 2, TikTok 1). August 2026 submissions (through 13 days, referral type, corrected): 600 total (Dental Office 200, Influencer 120, Online Search 108, Podcast 50, Google Ad 37, Airway Ambassador 23, Parent 22, Instagram 21, Unknown Referral 14, Unknown Prof Ref 3, Facebook 1, Brand Amb 1). Launch Bonus Tier 2 earners (50+ from window start, $1,250 each): 9 (Lauren Johnson 403, Soshanna 127, Shannon Tripp 116, Emily Boazman 71, Eden Lee 69, Kendra Needham 65, Jeff Cruz 53, Melody Brandon 53, Amy Bernhard 52). Tier 1 earners (25-49, $250 each): 7 (Jasyra Santiago-Hines 47, Ginny Yurich 44, Carly Brown 43, Katelyn Alsop 42, Taylor Kulik 32, Hayley Lombard 26, Hilary Fritsch 26). Bonus subs count only from each ambassador's window start date (04/01/2026 for pre-2026, onboard date for 2026 adds). Data combined from two Launch Bonus Tracker exports: H1 (Jan 1-Jun 30) + H2 (Jul 1-Aug 13). 221 ambassadors with ≥1 window sub.

## Launch Bonus Payouts
Payouts happen on the 1st of each month for the prior month's earnings. Track in `LAUNCH_BONUS_PAYOUTS` in `src/components/AmbassadorGrowth.tsx` and update the `paid` field on each ambassador's row.

**May 2026 payouts (paid June 1):** $2,500 total
| Ambassador | Amount | Tier |
|------------|--------|------|
| Shannon Tripp | $1,250 | Tier 2 |
| Lauren Johnson | $250 | Tier 1 |
| Kendra Needham | $250 | Tier 1 |
| Katelyn Alsop (James) | $250 | Tier 1 |
| Emily Boazman | $250 | Tier 1 |
| Jeff Cruz | $250 | Tier 1 |

**July 2026 payouts (paid July 13):** $3,250 total
| Ambassador | Amount | Tier |
|------------|--------|------|
| Lauren Johnson | $1,000 | Tier 2 |
| Emily Boazman | $1,000 | Tier 2 |
| Amy Bernhard | $250 | Tier 1 |
| Ginny Yurich | $250 | Tier 1 |
| Jasyra Santiago-Hines | $250 | Tier 1 |
| Melody Brandon | $250 | Tier 1 |
| Carly Brown | $250 | Tier 1 |

**August 2026 payouts (pending — not yet paid):** $2,500 total
| Ambassador | Amount | Tier | Notes |
|------------|--------|------|-------|
| Kendra Needham | $1,000 | Tier 2 | Hit 50+ on 07/13 |
| Eden Lee | $1,250 | Tier 2 | Hit T1 07/10, T2 07/30 — first payout |
| Hayley Lombard | $250 | Tier 1 | Has a balance — apply toward |

**September 2026 payouts (owed — not yet paid):** $3,500 total
| Ambassador | Amount | Tier | Notes |
|------------|--------|------|-------|
| Amy Bernhard | $1,000 | Tier 2 | Hit 50+ on 07/29 |
| Jeff Cruz | $1,000 | Tier 2 | Hit 50+ on 07/31 |
| Melody Brandon | $1,000 | Tier 2 | Hit 50+ on 08/03 |
| Taylor Kulik | $250 | Tier 1 | Hit 25+ on 07/25 |
| Hilary Fritsch | $250 | Tier 1 | Hit 25+ on 07/31 |

**Outstanding balances (earned but not yet paid):**
| Ambassador | Earned | Paid | Remaining | Notes |
|------------|--------|------|-----------|-------|
| Soshanna Salsman | $1,250 | $0 | $1,250 | Internal — not paid out |
| Eden Lee | $1,250 | $0 | $1,250 | Aug payout pending |
| Kendra Needham | $1,250 | $250 | $1,000 | Aug payout pending |
| Hayley Lombard | $250 | $0 | $250 | Aug payout pending; has balance to offset |
| Amy Bernhard | $1,250 | $250 | $1,000 | Sep payout owed |
| Jeff Cruz | $1,250 | $250 | $1,000 | Sep payout owed |
| Melody Brandon | $1,250 | $250 | $1,000 | Sep payout owed |
| Taylor Kulik | $250 | $0 | $250 | Sep payout owed |
| Hilary Fritsch | $250 | $0 | $250 | Sep payout owed |

**When Sosh provides new payout data:** Update `LAUNCH_BONUS_PAYOUTS` array (add new month entry), update `paid` field on each ambassador's row in `launchBonusData`, and update this section in CLAUDE.md.

## Toothpillow — What It Is
Airway-first pediatric growth company. Connects families to a network of hundreds of airway-focused doctors via a free virtual assessment. The product is a night-worn dental guide + myofunctional therapy that expands the palate and retrains tongue posture naturally — no surgery. For children ages 3–12 (corrective window closes ~age 12). Addresses Sleep Disordered Breathing (SDB) caused by underdeveloped jaws from formula feeding and soft/processed food diets. Untreated SDB leads to ADHD misdiagnosis in childhood and cardiovascular disease in adulthood. Sosh came to Toothpillow because it transformed her son's health — he had adenoids blocking 90% of his airway, speech delays from fluid in his ears, and snoring from birth. Six months of treatment: snoring gone, dark circles gone, nasal breathing restored, focus at school improved. This is her mission now, not just her job.
Full program detail: `memory/context/toothpillow-program.md`

## Carousel & Reel Captions
Before writing any carousel or reel caption, read these three files in order:
1. `Claude-Code/social-media/CAROUSEL-SYSTEM-INDEX.md` — master map of the carousel system, where files live, what's stale, recommended workflow.
2. `Claude-Code/social-media/CAROUSEL-INDEX.md` — searchable record of all 85+ carousels (type, hook, trigger, symptoms covered, status). Check this BEFORE drafting to see what's been covered and on what angle.
3. `Claude-Code/social-media/CAROUSEL-CAPTION-FORMAT.md` — locked caption spec (structure, banned phrases, CTA template, reference examples, 2,200-character limit, structural-only emoji rule).

All caption work for this project lives in `Claude-Code/social-media/` — drafts, format spec, and any new files. Each new carousel gets its own folder at `Claude-Code/social-media/carousels/YYYY-MM-DD-topic-slug/` with `slides.txt`, `caption.txt`, and `meta.md`. Do not save to `Working Drafts/` or other root folders.

## Airway 101 Carousels
Before writing any Airway 101 carousel, read `Marketing Assets/Social Media/Carousels/AIRWAY-101-FRAMEWORK.md`. It contains the universal arc, the five slide roles, approved language for every core concept, and a tracker of which entry point angles have already been used. Pick the next unused angle from the tracker and update it after the carousel is written.

## Website Copy (Full Literal Extractions)
Literal copy from every Toothpillow website page is saved in `memory/context/website-pages/`. Read the relevant file(s) any time you're writing content, brainstorming, building carousels, drafting emails, or answering detailed questions about how Toothpillow works.

| File | Page |
|------|------|
| `memory/context/website-pages/program-page.md` | Program — four pillars, how it works, results |
| `memory/context/website-pages/assessment-page.md` | Assessment — process, what's reviewed, FAQs |
| `memory/context/website-pages/appliances-page.md` | Appliances — Vivos/Myobrace, Phase 1/2, growth window |
| `memory/context/website-pages/avoiding-braces-page.md` | Avoiding Braces — braces limitations, palate/tongue, milestones |
| `memory/context/website-pages/symptoms-page.md` | Symptoms — full symptom list, picky eating, sleep mechanics |
| `memory/context/website-pages/myofunctional-therapy-page.md` | Myo Therapy — what it is, benefits, signs |
| `memory/context/website-pages/home-page.md` | Home — hero copy, positioning, entry points |

## TP Kids Color Palette (official)
Use these exact hex values for any Toothpillow Kids UI, prototype, or graphic.
Primary: Sky blue #B6CAE3 · Blue #3A6EA4 · Cream #FEF8EE · Green #8CD1C8 · Yellow #FDBE67 · Peach #FBCCC5 · Red #DD5759 · Dark purple #B26CA6 · Bubblegum #F6AACB · Maroon #D46476.
Secondary: Light blue #D6E5F7 · Light purple #DDBBD9.
Text: Dark gray #333333.
Typical mapping in prototypes: Sky blue = primary/pill button fill; Blue = accents/headings-eyebrow/selected states; Cream = warm cards; Light blue = tints; Yellow = warm accents; Red = required/error.

## Brand Voice
Before writing any Toothpillow content, read `Toothpillow-Brand-Voice-Guide.md` in the same folder.
Sosh's personal Instagram voice and Toothpillow's corporate voice are SEPARATE — never blend them.
Key rules: educational not persuasive, symptom → cause → consequence → action structure, no buzzwords (thrive/holistic/root cause/unlock/game changer), no rhetorical openers, no fear tactics, no fragments for dramatic effect.

## Preferences
- Clarity over cleverness — write to explain, not impress
- Educational, not persuasive — lay out cause and effect, let the reader connect the dots
- No AI-sounding writing, no bullet fragments, no buzzwords, no rhetorical questions
- Direct and literal — state what's happening, why it matters, how it affects people
- Emotionally grounded, never dramatic
- Execution and concrete deliverables, not planning
- SEO and organic Google traffic as a long-term goal

## Acquisition Levers — What to Suggest and What to Skip
**Do not suggest as submission levers:**
- Sosh's personal Instagram. She is not a solution for Toothpillow submissions and does not want it surfaced as one.
- Google Ads healthcare verification, D&B, or negative keyword additions. She cannot execute these.

**Suggest when relevant:**
- Podcast drop amplification (timing social posts, stories, ambassador pushes to scheduled ad reads and guest episodes)
- GHL re-engagement emails to warm segments (abandoned assessments, webinar attendees, lapsed subscribers)
- Top-producer ambassador check-ins (top 4 = 60.6% of submissions, any dropoff is meaningful)
- Ambassador incentive structure / flash pushes
- Toothpillow corporate social channels (not Sosh's personal)

## Carousel Headline Rule
Carousel slide headlines should be questions a parent would actually ask, not editorial framings like "What You're Actually Seeing" or "The Direction Most People Miss." The question should name the subject of the slide so it works as a standalone shared slide. Example: "Is a gummy smile an excess gum issue?" not "What You're Actually Seeing."

Opening lines should state what something IS, not what it isn't. Never lead with "X is not Y" — open directly with the positive claim. Example: "A gummy smile shows how your child's upper jaw developed in the vertical direction" not "A gummy smile is not excess gum tissue. It reflects..."

Remove hedging words from opening lines: "specifically," "over time," "essentially," "basically."

## Before/After Caption Rules
These rules were refined through production. Apply before writing, not as a post-draft fix.

**Name before explaining.** In before/after captions, state what the child has before explaining why it matters. "She had a deep overbite and a narrow palate" before the mechanism. The parent is looking at a photo — tell them what they're seeing first.

**Consistent vocabulary throughout.** Use the same word from introduction to resolution. If the problem was a "narrow palate," the result is "her palate widened" — not "her arches widened." Switching vocabulary mid-caption breaks the thread.

**Possessive language: "their" not "the."** "Their tongue," "their palate," "their upper jaw" — not "the tongue," "the jaw." Keeps the education personal to the child, not abstract anatomy.

**Breathing outcomes: one causal sentence beats two separate observations.** "As her upper jaw widened, her tongue had more room to rest properly and her breathing during sleep stabilized" — not "Her breathing improved. A wider jaw creates more room for the tongue." Build cause and effect into a single sentence.

**Match the age stat to the child.** If the child started treatment at age 6, use the age 6 stat (about 60% of jaw growth is complete by age 6) alongside the age 12 stat. Always connect the growth window to the child's actual story.

**Remove hedging language.** "May warrant evaluation" → "needs evaluation." "Roughly" → "about." Direct language is more credible than clinical hedging.

## Caption Writing Rules (General)
**Name → explain → mechanism → result.** This is the correct order for both before/after captions and educational captions. State what something is, then explain why, then trace the mechanism, then show the outcome.

**Word choices that weaken copy:** "roughly," "may warrant," "alongside those structural changes," "in many cases." Replace with direct, specific language.

**No short sentences used for emphasis.** Even when technically complete, short punchy sentences feel like dramatic fragments and are not acceptable. Fold them into the preceding sentence using a subordinate clause instead. Example: "Most pediatric and ENT practices don't assess jaw growth, tongue posture, or airway health, which are the structures that determine how well a child's ears drain. Without that evaluation, the cycle continues." — not two separate punchy lines.

**Warmth before facts.** Captions should not open as clinical fact blasts. When the topic involves a parent who has already tried standard care (antibiotics, tubes, tonsil removal, braces, etc.) and it hasn't worked, open by acknowledging that experience first. One or two sentences that validate what they've been through before pivoting to education. Example: "Most parents who end up here have already done everything their doctor recommended. Antibiotics, ear tubes, adenoid removal. And the infections kept coming back." This is the default opening posture for educational and before/after captions unless the topic is purely structural with no obvious parent frustration angle.

**Warmth does not mean soft.** After the warm opener, the education is still direct, dense, and factual. Warmth is in the entry point, not throughout. Do not sprinkle empathy language into the mechanism paragraphs.

**No em dashes.** Use commas or periods instead throughout all captions and slide copy.

## Email Writing — Recovery vs. First-Touch
Two different jobs require two different emails. Do not treat them the same. Before writing any email, identify which job this email is doing.

**First-touch email (cold lead, new subscriber, exploring):**
- Job: establish legitimacy, build confidence, answer "is this worth starting?"
- Can be longer and education-forward
- Full "what you'll receive" breakdown makes sense because they are still deciding whether to begin
- Mirrors a landing page arc: what it is → how it works → what you get → outcomes → CTA

**Recovery email (they started but didn't finish):**
- Job: create momentum, answer "is it worth finishing?"
- Must feel like continuation, not introduction. They already clicked and started. Do not reset to zero on education.
- Lead with friction removal: you're X steps away, takes Y minutes, done from your phone. The friction-remover is the conversion driver and must not be buried.
- "What it is" should be 1–2 sentences, not a full section. They already know the basics or they wouldn't have started.
- "What you'll receive" should be brief. They already considered this when they started — full detail is for someone deciding whether to begin, not finish.
- Emotional tension matters: proximity to completion ("you're six photos away from answers") is stronger than information dump.

**Recovery email structure (use this order, do not deviate without reason):**
1. You started + you're close (acknowledge progress, create momentum)
2. What this is (1–2 sentences, not sections)
3. What's left (this is the CORE — make the remaining task feel small, defined, and close)
4. Why it's worth finishing (short payoff, not full breakdown)
5. Primary CTA: finish
6. Safety net CTA: book a call with Tania (or relevant person)

**Common mistake to avoid:** pasting website/education content into a recovery email. The site builds trust through linear progression. Recovery builds momentum through proximity and reduced friction. Different jobs, different lengths, different emphasis. "Too long and too neutral" is the failure mode.

**Before writing any email, ask which type it is.** If it's unclear from the brief, ask the user.

## SEO — Phase 2 (Deployed ~May 11–12, with gaps — verified Aug 4, 2026)
Title tags, meta descriptions, and H1 fixes for 6 pages (Home, Symptoms, Assessment, Avoiding Braces, FAQs, Our Doctors). Pricing and Myo Therapy excluded — Pricing removed by choice, Myo Therapy page being rebuilt. Dev request doc: `SEO/Toothpillow-Phase-2-SEO-Dev-Request.docx`. Keyword mapping spreadsheet: `SEO/Toothpillow-SEO-Keyword-Mapping-Phase-2.xlsx`.

**Aug 4, 2026 verification (full report: `SEO/SEO-Traffic-Investigation-2026-08-04.md`):** Phase 1 (robots.txt, sitemap.xml, canonicals) is live. Phase 2 is live on 5 of 6 pages. Two dev gaps need re-submission: (1) **/faqs was skipped entirely** — old title, no meta description, no H1, not in sitemap; (2) **/avoiding-braces is broken** — an entire second Webflow HTML document (with old duplicate `<title>`) is nested inside `<main>`, the empty first H1 was never fixed, and Google is displaying the OLD title in search results. Root cause of flat non-branded traffic: zero content targeting non-branded keywords was ever published — the blog/article phase never started (no CMS; 5 finished articles stuck in medical review since April with reviewer TBD). Site is hand-coded Rails on Heroku, not Webflow as the strategy assumed. A legacy `/articles` Rails path exists (~18 broken stubs titled "Back Office | Toothpillow") and may be the fastest publishing route. GSC data (monthly/weekly/daily, keyword climbers, non-branded breakdown) lives hardcoded in `OrganicGrowth.tsx` at the brain root — non-branded is ~3% of organic clicks (335 of 11,550 in June 2026); on-page fixes ARE lifting long-tail positions since May but those queries total only a few hundred impressions/month.

**Publishing plan (decided Aug 4):** Keep /articles as the blog home, rebuilt on current site design, NOT linked in nav (search-entry pages only, breadcrumb to /articles index). The 16 old research stubs get rewritten into ~8 keyword-targeted articles (mouth breathing face, adenoid face, palate expander before/after, SDB+ADHD, child snoring, tongue thrust, airway 101, untreated SDB) with 301s from old slugs as each publishes. Dev request: `SEO/Toothpillow-Dev-Request-Article-System-SEO.docx` — also covers stray-page cleanup (/live, /results, /refer, /products/* → 404; /start, /sign_up, /login.password → noindex) and the /faqs + /avoiding-braces Phase 2 re-fixes. Pending Sosh decisions: /premium and /insurance_compliance_faqs (keep or archive). Pending blocker: named medical reviewer for the 5 finished articles.

**ARTICLE SYSTEM IS LIVE (Aug 2026).** The /articles library is rebuilt on the Rails site with topic taxonomy, related articles, share buttons, images, and CTAs. Two new keyword-targeted articles published:
1. `/articles/mouth-breathing-face` — "Mouth Breathing Face: What It Is and Why It Happens" (Aug 4, 2026) — targets #1 keyword (22,200/mo)
2. `/articles/thumb-sucking-teeth` — "What Thumb Sucking Does to a Child's Teeth and Jaw" (Aug 5, 2026) — indexed Aug 10
Both have proper SEO (title tags, meta descriptions, canonical, OG/Twitter tags, alt text on images, 16 references with DOIs). The 10 legacy research stubs from Aug/Nov 2023 are still present and have NOT been 301'd yet. Next priority articles from the pipeline: adenoid face, palate expander before/after, tongue thrust, SDB+ADHD.

## SEO — Future Phases
These are the remaining blockers for organic search growth, in priority order:

### Blog Infrastructure ~~(Biggest Blocker)~~ — RESOLVED
Article system is live at /articles on the Rails site as of Aug 2026. Topic taxonomy, related articles, images, share buttons, CTAs all working. Two keyword-targeted articles published (mouth-breathing-face, thumb-sucking-teeth). 10 legacy research stubs still present. No external CMS needed — articles are built directly on the existing Rails app.

### Domain Authority (DA 30)
Low compared to competitors like Vivos. No backlink strategy exists. Need to build links from medical/parenting sites, pursue guest posts, and create linkable content (original research, tools, guides).

### Internal Linking
Pages don't cross-link. Symptoms → Assessment, Avoiding Braces → Assessment, Myo → Symptoms are natural paths. Add 3–5 internal links per page. No dev needed — can be done in the page content.

### Structured Data / Schema Markup
No JSON-LD schema on any page. Add: Organization schema site-wide, FAQPage schema on /faqs, MedicalWebPage schema on clinical pages. Improves search appearance and rich results.

### Image Alt Text
~890 images without alt attributes across the site. Prioritize Symptoms, Assessment, and Avoiding Braces pages first.

### Myo Therapy Page Migration
When the new myo page is ready, publish at toothpillow.com/myofunctional-therapy (not the subdomain). 301 redirect from lp.toothpillow.com/myo-overview. Consolidates domain authority.

### Blog Posts — Published & Pipeline
Published:
1. ✅ Mouth breathing face (22,200/mo, KD 1) — `/articles/mouth-breathing-face` Aug 4, 2026
2. ✅ Thumb sucking teeth — `/articles/thumb-sucking-teeth` Aug 5, 2026 (indexed Aug 10)

Next priority (unpublished):
3. Mewing before and after (15,000/mo, KD 4)
4. Adenoid face in children (8,100/mo, KD 0)
5. Palate expander before and after (9,900/mo, KD 0)
6. Tongue thrust in children (3,700/mo, KD 8)
7. How to stop mouth breathing at night (2,900/mo, KD 2)

Full keyword research file: `SEO/Toothpillow-Keyword-Research-Complete.txt`
Full content pipeline (52 articles prioritized): same file, Section 5.

## SEO — Reference Files
All SEO files are in the `SEO/` folder.
| File | What |
|------|------|
| `SEO/Toothpillow-Phase-2-SEO-Dev-Request.docx` | Dev request: title tags, meta descriptions, H1 fixes |
| `SEO/Toothpillow-SEO-Keyword-Mapping-Phase-2.xlsx` | Keyword mapping, opportunities, content gaps, competitor comparison, action plan |
| `SEO/Toothpillow-Keyword-Research-Complete.txt` | 87 keywords with volume/KD, 97 Google Ads keywords, 52-article content pipeline |
| `SEO/SEO-Optimizer.md` | SEO optimization framework/workflow reference |
| `SEO/SEO-Authority-Builder.md` | Link building and domain authority framework |
| `SEO/Toothpillow-SEO-Audit-2026-04-07.docx` | Full on-page audit from April 7 |
| `SEO/Toothpillow-SEO-Strategy-2026.docx` | 12-month SEO roadmap |
| `Projects/Toothpillow-SEO-Keyword-Report.xlsx` | Master keyword list with cluster data |

## Monthly Submission Goals — 2026 (Full Year)
Goals are built from three components: Online (10% MOM from March baseline of 1,291), Hybrid/Pediatric (Q1 back-calculated from total goals, Q2 ramp to 500/month baseline by June, then 500/month Q3+), and Prime (25/month = 75/quarter). Jan–Mar online goals derived by working backwards from March baseline at 10% MOM; hybrid = total goal − online − prime.

| Month | Online | Hybrid | Prime | Total |
|-------|--------|--------|-------|-------|
| January | 1,067 | 363 | 25 | 1,455 |
| February | 1,174 | 401 | 25 | 1,600 |
| March | 1,291 | 444 | 25 | 1,760 |
| April | 1,420 | 355 | 25 | 1,800 |
| May | 1,562 | 405 | 25 | 1,992 |
| June | 1,718 | 460 | 25 | 2,203 |
| July | 1,890 | 500 | 25 | 2,415 |
| August | 2,079 | 500 | 25 | 2,604 |
| September | 2,287 | 500 | 25 | 2,812 |
| October | 2,516 | 500 | 25 | 3,041 |
| November | 2,767 | 500 | 25 | 3,292 |
| December | 3,044 | 500 | 25 | 3,569 |

**Hybrid Q2 KRs (from OKR):**
- Q2 total: 1,285 (stretch 1,500)
- Lead TR: 200 Apr → 230 May → 260 Jun (~25% of her time)
- Three developing TRs combined: 125 Apr → 145 May → 170 Jun (15–20% MOM growth each)
- KR3: Average days submission → enrollment ≤ 14 days
- KR4: Reach and sustain 500 screenings/month by June (Q3 baseline)

## Dashboard Rules (`submission-dashboard.html`)
- **Single HTML file** with all JS/CSS inline, Chart.js 3.9.1, localStorage for data storage.
- **When editing charts, get it right the first time.** Do not iterate through multiple chart types or label placements. Ask what the user wants before building, then build it once. Sosh does not want to go back and forth fixing chart labels, overlapping text, or swapping chart types.
- **Chart labels must not overlap.** Before placing any text label on a chart, think through where every other label will be at the same coordinates. If a segment is too small to fit a label inside (like Prime at ~20 submissions), put the label outside the bar or in the table only — not floating on top of other labels.
- **Stacked bar charts are the default for submission mix breakdowns.** Online (blue) + Hybrid (gold) + Prime (red) stacked, with a dashed goal line. Total above the bar, gap to goal above the goal line.
- **The "Submission Mix vs Goal" section** on the Annual tab shows a stacked bar chart with goal line. Table below shows raw counts with percentage in parentheses, goal, and gap. This is the format — do not change it without being asked.
- **Data structure:** `annualSeedData` holds completed months (online/hybrid/prime/total/goal/visitors). Current month auto-pulls from localStorage tracker data. `online2024`, `online2025` hold historical online-only counts. Revenue data in `revenueData` localStorage key.
- **Visitor data source**: GA4 (not Clarity). All visitor counts — total and USA — come from GA4. localStorage keys still use `clarityVisitors_` and `clarityVisitorsUSA_` prefixes for backward compatibility, but the data is from GA4.
- **USA conversion tracking** uses `clarityVisitorsUSA_YEAR_MONTH` localStorage keys. Seed data has `usaVisitors` and `usaConversionRate` fields.
- **DATA PROTECTION RULE — HARDCODE EVERYTHING.** localStorage is volatile and WILL be lost. Every piece of data Sosh provides — Google Ads daily entries, submission tracker entries, visitor counts, conversion rates, commission amounts — MUST be hardcoded into the HTML file immediately. The hardcoded arrays (`googleAdsSeedData`, `jan2026Daily`, `feb2026Daily`, `mar2026Daily`, `apr2026Daily`, `may2026Seed`, `annualSeedData`, etc.) are the source of truth. localStorage is a cache that gets rebuilt from hardcoded data on every page load. When Sosh gives new data, add it to the appropriate hardcoded array in the file AND copy to the output folder. Never store data only in localStorage.
- **Google Ads daily data** lives in `googleAdsSeedData` array. When Sosh provides new daily Google Ads numbers (spend, impressions, clicks, submit, started, finished, treatment), add them to this array immediately. The dashboard merges this seed into localStorage on every load.
- **Backup task** (`daily-dashboard-backup`) reads hardcoded data directly from the HTML file — no browser needed. Runs nightly at 11pm.

## Toothpillow Tip of the Week
Recurring post every Thursday. Short video tip — transcript provided each week.

**Caption format:**
- Opens with: "Toothpillow Tip of the Week: [topic]."
- 2–3 short paragraphs, educational, no CTA
- Ends with a question to prompt engagement
- No AI-sounding language, no fragments, no buzzwords

**Example:**
"Toothpillow Tip of the Week: Build a better sleep environment.

Your bedroom affects your sleep before you even close your eyes. Light, temperature, and sound all determine whether your brain can drop into deep sleep and stay there.

A few small changes go a long way.

Which one do you think is affecting your sleep the most?"

## Folder Structure & Filing Rules
**Every new file must go in the correct folder. Never save to root.**

| Folder | What goes here |
|--------|----------------|
| `Affiliate Program/` | Ambassador program docs, ebook, launch mockups, text outreach, pipeline tracker, newsletters |
| `Affiliate Program/Ambassador Course/` | All Airway Foundations course drafts, Circle.so audit, voice tests |
| `Alex Clark Newsletter/` | Culture Apothecary newsletter content |
| `Marketing Assets/` | Carousels, social media content, landing pages, ewebinar copy, calendar, graphics |
| `Marketing Assets/Social Media/` | Carousels, Pinterest, Copy Library, Meta Ads creative, IG Lives |
| `Operations & Admin/` | Compensation models, commission plans, meeting notes, Tania tasks, internal memos |
| `Patient Education/` | Educational frameworks and parent-facing content |
| `Personal IG/` | Sosh's personal Instagram captions |
| `Podcast Outreach/` | Podcast targets, outreach emails, media one-pager |
| `Projects/` | Google Ads keywords, event letters, hygiene wireframe, homepage redesign, misc project files |
| `Reference Materials/` | Style guide PDF, brand voice review, forms/templates, lead-gen briefs |
| `Research - CHATGPT/` | ChatGPT-generated research docs on airway/myo topics |
| `Research Articles/` | Published research PDFs |
| `SEO/` | All SEO files — audits, keyword research, dev requests, strategy docs, mapping spreadsheets |
| `Tracking & Analytics/` | Dashboards (except main submission dashboard), trackers, projections, ROI, historical JSON |
| `Video/` | Video files (mp4s) |
| `Website/` | Website page copy, FAQ drafts/mockups, adult landing page, wireframes, provider maps |
| `Working Drafts/` | In-progress caption/slide edits |
| `google ads/` | Google Ads campaign docs, performance reports |

**Root-level files (do not move):**
- `submission-dashboard.html` — main dashboard, opened directly in browser
- `CLAUDE.md` — this file
- `TASKS.md` — task tracking
- `Toothpillow-Brand-Voice-Guide.md` — referenced by content workflows

**System folders (do not touch):**
- `memory/` — context files for Claude sessions
- `backups/` — file backups
- `content-creator/` — skill file
- `social-media-calendar/` — skill file + Pinterest automation

## Current Work
Google Ads (performing well, 14-27 conversions/day in Aug), Alex Clark / Culture Apothecary (Aug: newsletter Wk 3, ad read 8/10, IG Story Wk 2; Sep: newsletter Wk 3, ad read 9/10, IG Story Wk 2), Daily Wire (Isabel Brown airing 8/15, surprise Knowles filming TBD, need follow-up), Discover Ag (re-engaged, need ad read dates), SEO/blog (agency working, 2 articles live, more coming), Savvy Giveaway (IG giveaway Aug 28), Shannon Tripp re-engagement when she's back from Japan, ambassador incentive sustainability strategy.

**Ambassador program cadence (Aug 2026):** August is a deliberate light month after the big July push; bigger push returns ~September. August activation play: Sosh now has access to create ambassador links herself — outreach to all 2026 onboards to confirm each has a link, deliver it, and check in. Amy Bernhard posting this month. Shannon Tripp still in Japan — re-engage when back.

**Dev:** New dev leader in place as of Aug 2026 — dev request process changing; older "requests ship unverified" pattern may no longer apply. Route SEO re-fixes (/faqs, /avoiding-braces) through the new lead.

## currentDate
2026-08-13

## Git Push Setup
GitHub PAT (fine-grained, no expiration, scoped to soshannadeyette/toothpillow-dashboard, Contents: Read and write) is stored at `.git-credentials` in this folder. At the start of any session that needs to push:
```
git clone https://github.com/soshannadeyette/toothpillow-dashboard.git /sessions/pensive-funny-newton/tmp-repo 2>/dev/null || true
cd /sessions/pensive-funny-newton/tmp-repo
git config credential.helper 'store --file=/sessions/pensive-funny-newton/mnt/toothpillow-brain/.git-credentials'
git remote set-url origin https://github.com/soshannadeyette/toothpillow-dashboard.git
```
Then make changes, commit, and `git push origin main`. Vercel auto-deploys on push.

## Data Update Cheatsheet — Dashboard Database
The Toothpillow submission dashboard is a Next.js app deployed on Vercel from GitHub repo `soshannadeyette/toothpillow-dashboard`. Supabase is the database. Auto-deploys on push to main.

**CRITICAL: When Sosh uploads Salesforce exports, update EVERY tab in one pass.** Do not do partial updates. Every export batch = full update across all tabs: AV Diagnostics, Referrer, Ambassador Growth, Weekly Report (seed data), Annual (seed data), Organic Growth, CLAUDE.md. Include partial-day data for today. Do not wait to be asked twice. One commit with all changes, then push.

**When Sosh gives commission numbers:**
Update `AMB_COMMISSIONS` in `src/components/AnnualView.tsx`. Add/replace the month entry. Commit + push.

**When Sosh gives Google Ads daily data (spend, impressions, clicks, opened, started, completed, treatment):**
Enter via the Add/Update Day form on the Paid Ads tab, OR upsert directly to `google_ads_daily` table via POST to `/api/google-ads` with `{ date, spend, impressions, clicks, submit, started, finished, treatment }`. Upserts on `date` conflict.

**When Sosh gives a Salesforce export (Google Ads pipeline):**
Update `GOOGLE_SF_PIPELINE` (sentToTxP, txpApproved, sentCheckout, referredOut, denied, closedLost) and `GOOGLE_REVENUE` in `src/components/PaidAds.tsx`. If started/finished/treatment counts changed, also update matching rows in Supabase `google_ads_daily`.

**When Sosh gives daily submission counts (online, hybrid, prime):**
Enter via the Add/Update Entry form on the Daily Tracker tab, OR POST to `/api/submissions` with `{ date, online, hybrid, prime, visitors, income }`.

**Income calculation:** Income = $5 per online submission. Do NOT use the "Sum of Amount Paid" from Salesforce exports — Salesforce does not track Sosh's income. Always calculate income as `online * 5` when entering daily data.

**When Sosh gives ambassador program stats:**
Update the `Ambassador Program Stats` section in this CLAUDE.md file. Also update hardcoded ambassador data in `src/components/AmbassadorGrowth.tsx` if that tab exists.

**LAUNCH BONUS — EXACT RULES (DO NOT DEVIATE):**
1. **Tier amounts are cumulative.** Tier 1 = $250 at 25 subs. Tier 2 = $1,000 additional at 50 subs. Total possible = $1,250. In the data: `tier:1,earned:250` and `tier:2,earned:1250`.
2. **Window subs, NOT YTD.** The Salesforce Launch Bonus Tracker export has daily columns (1/1/2026 through current date) plus a Total column. The Total column is FULL-YEAR YTD. Do NOT use it. To get window subs, sum only the daily columns from the ambassador's window start date onward.
3. **Window start dates.** Pre-2026 onboards: window starts 04/01/2026. 2026 onboards: window starts at their onboard date (from the Full List Airway Ambassadors export, column index 1).
4. **How to compute.** Cross-reference the Full List export (for onboard dates) with the Launch Bonus Tracker export (for daily sub columns). Sum daily columns from window start date through current date. That sum is bonusSubs.
5. **Annualization and projections must be dynamic.** Never hardcode `12/5` or `30/3` or any static fraction. Always compute months elapsed and days elapsed from `new Date()` so the dashboard stays correct on any date.
6. **After updating, verify.** Check that the top 3 (Tier 2) and top 7-10 (Tier 1) match the numbers in the Ambassador Program Stats section of this file. If they don't match, stop and figure out why before pushing.

**When Sosh gives website visitor/traffic data:**
Update `annualSeedData` in `src/components/AnnualView.tsx` (visitors field for the relevant month).

**Hardcoded data arrays (source of truth — never store only in localStorage or Supabase without also hardcoding):**
- `AMB_COMMISSIONS` in AnnualView.tsx — ambassador commission payouts by month
- `GOOGLE_SF_PIPELINE` + `GOOGLE_REVENUE` in PaidAds.tsx — Salesforce funnel stages + checkout revenue
- `META_FUNNEL` in PaidAds.tsx — historical Meta Ads funnel (static, campaign ended)
- `annualSeedData` in AnnualView.tsx — completed month totals (online/hybrid/prime/total/goal/visitors)
- `TRAFFIC_2025` in AnnualView.tsx — 2025 monthly GA4 traffic for YOY comparison

## Salesforce Export Update Checklist — MANDATORY
**Every time Sosh uploads Salesforce exports, complete ALL items below in one pass. Do not do partial updates. Do not wait to be asked twice.**

### 1. ReferrerView.tsx (from Monthly Submissions by Referral Type export)
- Refresh ALL months in `REFERRAL_DATA` (Salesforce reclassifies records — historical values drift between exports)
- Update current month entry with new totals
- Add new month entry if a new month has started
- Update `CURRENT_MONTH_DAYS_TRACKED`
- Update source date comment

### 2. AmbassadorGrowth.tsx (from Full List + Launch Bonus Tracker exports)
- **Submission counts**: Update `ambSubs` and `infSubs` for ALL months (cross-reference Full List referrer types with Launch Bonus Tracker daily columns)
- **Yearly totals**: Recalculate `ambSubsYear`, `infSubsYear`, `combSubsYear` for 2026
- **New adds**: Update `recruit26` array — add new month entries if needed
- **Active stats**: Recalculate `activeInfByYear`, `activeAmbByYear`, `activeTotalByYear`, `tenPlusByYear`, `mega3ByYear`, `baseByYear` from Launch Bonus Tracker YTD totals
- **Movers data**: Refresh ALL YTD values in `moversData` from Launch Bonus Tracker Total column (cross-ref with Full List for names)
- **Launch bonus data**: Add any new ambassadors who earned their first window sub since last update. Update existing entries' `bonusSubs` values. Verify tier thresholds (T1 at 25, T2 at 50). Fix any `tier2Date` discrepancies.
- **Month range arrays**: Ensure `MONTHS_JAN24_MAY26` and `ALL_MONTHS` include the current month (check `const end = y === 2026 ? N : 12` — N must be current month number)
- Update source date comment

### 3. PaidAds.tsx (from Google Ads Salesforce export)
- Update `GOOGLE_SF_PIPELINE` totals (total, completed, waitingInfo, sentCheckout, sentToTxP, txpApproved, checkedOut, referredOut, closedLost, tempHold, formOpens)
- Update `GOOGLE_REVENUE` if checkout revenue changed
- Refresh ALL months in `SF_MONTHLY` (leads, completed, checkouts, revenue)
- Add new month entry to `SF_MONTHLY` if a new month has started
- Update source date comment

### 4. AVDiagnostics.tsx (from Waiting on Info Ratios export)
- Refresh `AV_DATA` for ALL months (waiting and submitted counts drift between exports)
- Refresh `FUNNEL_DATA` stage counts for ALL months
- Refresh `COHORT_AGING` — update all waiting counts and recalculate `daysElapsed` from current date
- Update `POST_UPDATE_DAYS_ELAPSED`
- Add new monthly/weekly cohort entries if new data exists
- Update source date comment

### 5. AnnualView.tsx
- Uses Supabase (not hardcoded) for monthly submission data — no update needed from Salesforce exports
- Only update if Sosh provides commission data (`AMB_COMMISSIONS`) or visitor data (`TRAFFIC_2026`, `TRAFFIC_USA_2026` in `src/lib/types.ts`)

### 6. CLAUDE.md
- Update `Ambassador Program Stats` section header date
- Update total ambassador count and type breakdown (Amb/Inf/Podcast)
- Update YTD adds count and monthly breakdown
- Add new ambassador names to the appropriate month's adds list
- Update July/current month final submission totals by referral type
- Update August/partial month submission totals by referral type and days tracked
- Update Launch Bonus tier earners if thresholds crossed
- Update `currentDate`

### 7. Build, Commit, Push
- `npm run build` in the repo
- Fix any TypeScript errors
- Commit all changes in one commit
- `git push origin main`
- Verify Vercel deploy succeeds
