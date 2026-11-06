# Beacon migration inventory — 6 November 2026

## Source and destination (verified)
- Source application: `index.html` on `oliverbennettroblox-oss/educonnect` (existing working code, ~815 KB).
- Source database: Supabase project `tecuoeebtdehgdcdidfe` (EduConnect).
- Destination frontend: `beacon/` within the same repository. The dashboard is currently explicitly a **demo** with placeholders, not a migrated application.
- Destination database: Supabase project `mfsondwfqbtekwelnoki` (Beacon Profile). Public tables currently: `beacon_profiles`, `beacon_imported_profiles`.
- **Safety invariant:** Never change/delete the EduConnect database or original app during migration. Do not point Beacon at the production EduConnect database as a shortcut. Never migrate credentials/passwords or grant admin privileges through client-side profile metadata.

## Required feature parity
- Organisation directories and registration: schools, MATs/trusts, providers, memberships, invitations, filing history, admin approval.
- Professional identity: Roblox-linked identity, public profiles, employment timeline, verified roles, references, qualifications, visibility and name search.
- Recruitment: organisation vacancies, job applications, interview calendar, onboarding invites, history/status handling.
- Organisation chart: departments, pre-created positions, vacant/filled/multi-occupancy cards, reporting chains, collision-aware orthogonal connectors, editing, public share view.
- Staff workspace: role-based permissions, timetables/year groups/claims, leave, notices/comments/reactions/polls, tasks and onboarding.
- Career and learning: pathways, courses, enrolment/approval, lessons/progress, qualifications and timeline.
- Resource library and Getting Started guides, inspections/report workflow, admin queues, notifications and calendar.
- Preserve deliberate removals: no EduChat, no recognition stickers, no separate Help Centre; no unnecessary Discord bot.
- Beacon visual system: exact Beacon logo, existing landing/dashboard direction, no compulsory sign-in for public browsing, no redundant top navigation bar.
- Authentication: Roblox username as required identity, no invented working OAuth; account activation and permission checks must be verified.
- UX: robust custom errors, safe draft persistence excluding passwords, working deep links, mobile layouts.

## Source public tables (verified)
admin_members, applications, bursary_programmes, ec_calendar_events, ec_career_awards, ec_career_experience, ec_career_pathways, ec_career_profiles, ec_chat_events, ec_chat_members, ec_chat_messages, ec_chat_presence, ec_chat_reactions, ec_chat_reads, ec_chat_rooms, ec_demo_requests, ec_event_registrations, ec_learning_enrolments, ec_learning_lessons, ec_learning_progress, ec_onboarding_templates, ec_org_audit, ec_org_departments, ec_org_job_applications, ec_org_positions, ec_org_staff, ec_org_staff_manual, ec_org_vacancies, ec_professional_references, ec_profile_hidden_items, ec_public_events, ec_qualification_awards, ec_qualification_courses, ec_school_notice_comments, ec_school_notice_poll_options, ec_school_notice_poll_votes, ec_school_notice_reactions, ec_school_notices, ec_school_staff_leave, ec_school_timetable_bookings, ec_school_timetable_settings, ec_school_timetable_slots, ec_social_likes, ec_social_mutes, ec_social_posts, ec_social_replies, ec_social_reports, ec_staff_onboarding, ec_suggestions, ec_verified_roles, ec_voluntary_inspections, inspections, inspector_assignments, organisation_filings, organisation_team_invitations, provider_members, providers, resources, school_members, schools, staff_applications, staff_roles, staff_tasks, staff_vacancies, team_profiles, trust_members, trust_school_invitations, trusts.

## Migration gates (not yet passed)
1. Export/compare source schema, triggers, policies, functions, storage buckets and relationships; classify deprecated tables.
2. Recreate destination schema with restrictive RLS, explicit permissions and tested migrations.
3. Map identities and preserve foreign-key relationships; migrate approved data with consent and privacy review.
4. Port source features into Beacon routes/components without destroying existing Beacon profile and account flows.
5. Verify each module end-to-end with test accounts (public, staff, manager, inspector, admin), including denied-access cases.
6. Test deployment and deep links, verify the exact live build, then cut over only after parity and rollback plan.

**Status:** Inventory and source/destination discovery completed. Full migration NOT completed. No production data copied or deleted.
