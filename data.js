/* =========================================================
   Master activity taxonomy
   Area (top-level life area) → Category → Activity presets
   ========================================================= */
'use strict';

const AREAS = {
  body:    { name: 'Body & Health',     color: '#10b981' },
  work:    { name: 'Work & Growth',     color: '#3b82f6' },
  home:    { name: 'Home & Life Admin', color: '#f59e0b' },
  people:  { name: 'People & Community',color: '#ec4899' },
  mind:    { name: 'Mind & Leisure',    color: '#8b5cf6' },
  flow:    { name: 'Flow & Misc',       color: '#64748b' },
};

const split = (s) => s.split(',').map(x => x.trim()).filter(Boolean)
  .map(x => x.charAt(0).toUpperCase() + x.slice(1));

const CATEGORIES = [
  { id: 'sleep', name: 'Sleep & Rest', icon: '😴', color: '#6366f1', area: 'body',
    activities: split('sleep, nap, insomnia, lying in bed, waking up, snoozing, resting, break, recovery, sick day, do nothing, relaxation, meditation, quiet time') },
  { id: 'care', name: 'Personal Care & Hygiene', icon: '🪥', color: '#06b6d4', area: 'body',
    activities: split('bathroom, toilet, shower, bath, brush teeth, floss, mouthwash, shave, skincare, makeup, hair care, nails, grooming, get dressed, undress, menstrual care, intimacy, sexual activity, contraception, health monitoring') },
  { id: 'health', name: 'Health & Medical', icon: '💊', color: '#ef4444', area: 'body',
    activities: split('take medication, vitamins, supplements, check vitals, symptoms, doctor visit, dentist, therapy, physiotherapy, mental health, first aid, injury care, chronic illness management, vaccination, lab tests, insurance, medical admin') },
  { id: 'food', name: 'Food & Drink', icon: '🍽️', color: '#f97316', area: 'body',
    activities: split('meal planning, grocery list, grocery shopping, cooking, baking, meal prep, breakfast, lunch, dinner, snacks, coffee, tea, water, alcohol, ordering food, takeout, restaurant, packing lunch, diet tracking, fasting') },
  { id: 'exercise', name: 'Exercise & Movement', icon: '🏃', color: '#22c55e', area: 'body',
    activities: split('walking, running, cycling, swimming, gym, strength training, cardio, yoga, Pilates, stretching, sports, hiking, dancing, martial arts, climbing, skating, skiing, workout class, personal training, steps, physical therapy, active play') },
  { id: 'work', name: 'Work & Career', icon: '💼', color: '#3b82f6', area: 'work',
    activities: split('commute, clock in, email, meetings, calls, video calls, planning, deep work, tasks, project work, documentation, coding, design, writing, research, analysis, reporting, presentations, admin, data entry, CRM, customer support, sales, networking, interviews, hiring, onboarding, training, mentoring, performance review, payroll, invoicing, expenses, timesheets, overtime, business travel, job search, resume, portfolio, freelance, side hustle') },
  { id: 'study', name: 'Study & Learning', icon: '📚', color: '#0ea5e9', area: 'work',
    activities: split('class, lecture, homework, assignment, reading, textbook, notes, flashcards, practice problems, exam, revision, research, online course, tutorial, language learning, coding practice, skill practice, certification, tutoring, teaching, seminar, workshop, study group, library') },
  { id: 'household', name: 'Household & Chores', icon: '🧹', color: '#eab308', area: 'home',
    activities: split('cleaning, dusting, vacuuming, mopping, sweeping, bathroom cleaning, kitchen cleaning, dishes, laundry, folding, ironing, putting away, bed making, trash, recycling, compost, organizing, decluttering, tidying, deep cleaning, windows, floors, carpets, garage, yard, lawn mowing, gardening, watering plants, plant care, home repairs, DIY, painting, plumbing, electrical, HVAC, light bulbs, filters, pest control, home security, inventory, moving, packing, unpacking') },
  { id: 'errands', name: 'Errands & Shopping', icon: '🛒', color: '#d97706', area: 'home',
    activities: split('grocery shopping, pharmacy, bank, post office, dry cleaning, returns, pickups, drop-offs, gas station, car wash, car maintenance, oil change, registration, DMV, appointments, library, clothes shopping, household goods, gifts, online shopping, package tracking, delivery, donations, recycling drop-off') },
  { id: 'finance', name: 'Finance & Admin', icon: '💰', color: '#84cc16', area: 'home',
    activities: split('budgeting, bill pay, banking, transfers, investments, taxes, tax prep, filing, receipts, expense tracking, insurance, claims, loans, mortgage, rent, subscriptions, canceling subscriptions, credit score, financial planning, legal, contracts, passwords, paperwork, scanning, email admin, calendar planning, to-do list, scheduling, reminders, contact management, note taking') },
  { id: 'social', name: 'Social & Relationships', icon: '💬', color: '#ec4899', area: 'people',
    activities: split('texting, calling, messaging, social media, video chat, meeting friends, coffee, meals, parties, events, dating, partner time, intimacy, family time, conflict resolution, celebrations, birthdays, holidays, weddings, funerals, gatherings, networking, clubs, support groups') },
  { id: 'family', name: 'Family & Caregiving', icon: '👨‍👩‍👧', color: '#f43f5e', area: 'people',
    activities: split('childcare, feeding kids, bathing kids, school drop-off/pickup, homework help, play, bedtime, doctor appointments, activities, discipline, teaching, reading, school events, parent-teacher meetings, elder care, disability care, pet care, feeding pets, dog walking, litter box, vet visits, grooming, training, pet medication') },
  { id: 'leisure', name: 'Leisure & Entertainment', icon: '🎮', color: '#a855f7', area: 'mind',
    activities: split('watching TV, movies, streaming, YouTube, sports, gaming, video games, board games, puzzles, reading fiction, comics, listening to music, podcasts, audiobooks, radio, concerts, theater, museums, hobbies, collecting, crafts, knitting, sewing, painting, drawing, photography, videography, writing, blogging, journaling, playing instrument, singing, dancing, woodworking, 3D printing, fishing, hunting, camping, outdoors, beach, park, sightseeing, travel, vacation, day trips, browsing internet, scrolling, memes, gambling') },
  { id: 'digital', name: 'Digital & Technology', icon: '💻', color: '#14b8a6', area: 'mind',
    activities: split('screen time, phone use, social media, email, messaging, browsing, apps, gaming, streaming, coding, computer maintenance, backups, updates, cybersecurity, password management, data organization, photo management, digital decluttering, online meetings, AI tools, troubleshooting, charging devices, setup') },
  { id: 'spiritual', name: 'Spiritual, Mindfulness & Self-Development', icon: '🧘', color: '#8b5cf6', area: 'mind',
    activities: split('meditation, prayer, worship, religious services, reading scripture, gratitude, journaling, affirmations, breathing exercises, yoga, tai chi, mindfulness, self-reflection, therapy, coaching, goal setting, habit tracking, reading self-help, courses, seminars, personal growth, values work, vision board, life planning, decision making') },
  { id: 'community', name: 'Community & Civic', icon: '🤝', color: '#db2777', area: 'people',
    activities: split('volunteering, donating, fundraising, voting, civic meetings, protests, campaigning, neighborhood watch, community garden, PTA, religious community, clubs, associations, mentoring, coaching, mutual aid, helping neighbors, charity, activism') },
  { id: 'travel', name: 'Travel & Commute', icon: '🚆', color: '#0284c7', area: 'home',
    activities: split('commuting, driving, public transit, bus, train, subway, biking, walking, carpool, rideshare, taxi, flying, airport, packing, unpacking, hotel, booking travel, itineraries, visas, passports, travel admin, sightseeing, road trips, business travel') },
  { id: 'events', name: 'Events & Occasions', icon: '🎉', color: '#e11d48', area: 'people',
    activities: split('birthdays, holidays, anniversaries, weddings, funerals, graduations, parties, dinners, hosting, attending, gift shopping, wrapping, cards, decorating, cooking for events, travel for events') },
  { id: 'maintenance', name: 'Maintenance & Repairs', icon: '🔧', color: '#78716c', area: 'home',
    activities: split('car maintenance, home maintenance, appliance repair, device repair, clothing repair, shoe repair, bike maintenance, tool maintenance, yard maintenance, pool maintenance, pet maintenance, health maintenance, relationship maintenance, career maintenance, network maintenance') },
  { id: 'planning', name: 'Planning & Organization', icon: '🗓️', color: '#2563eb', area: 'work',
    activities: split('morning routine, evening routine, daily planning, weekly review, monthly review, goal setting, calendar, to-do list, prioritization, time blocking, project planning, meal planning, travel planning, financial planning, event planning, grocery list, cleaning schedule, habit tracking, reflection, journaling, decision making') },
  { id: 'routines', name: 'Transitions & Routines', icon: '🔁', color: '#94a3b8', area: 'flow',
    activities: split('waking up, snoozing, getting out of bed, morning routine, breakfast, commute, arrival, breaks, lunch, afternoon slump, end of work, commute home, dinner, evening routine, wind down, bedtime routine, sleep') },
  { id: 'misc', name: 'Misc / Emergencies', icon: '⚠️', color: '#dc2626', area: 'flow',
    activities: split('waiting, queuing, idle time, procrastination, scrolling, daydreaming, worrying, multitasking, emergencies, crises, illness, recovery, appointments, admin, unexpected tasks') },
  { id: 'other', name: 'Other', icon: '✳️', color: '#6b7280', area: 'flow',
    activities: ['Other'] },
];

const DEFAULT_TAGS = [
  'deep-work', 'shallow-work', 'with-kids', 'with-partner', 'with-friends', 'solo',
  'high-energy', 'low-energy', 'avoidable', 'essential', 'outdoors', 'indoors',
  'screen', 'offline', 'paid', 'free', 'habit', 'self-care', 'stressful', 'fun',
];

const FIELD_OPTIONS = {
  priority:   ['None', 'Low', 'Medium', 'High', 'Critical'],
  status:     ['Planned', 'In progress', 'Done', 'Skipped', 'Cancelled'],
  recurrence: ['None', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Monthly'],
  device:     ['None', 'Phone', 'Laptop', 'Desktop', 'Tablet', 'TV', 'Console', 'Watch', 'Multiple'],
};

const RATING_LABELS = {
  energy:       ['🪫', '😪', '🙂', '⚡', '🔥'],
  mood:         ['😞', '😕', '😐', '🙂', '😄'],
  focus:        ['🌫️', '😶‍🌫️', '🎯', '🔎', '🧠'],
  satisfaction: ['👎', '😒', '👌', '👍', '🌟'],
};

const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
