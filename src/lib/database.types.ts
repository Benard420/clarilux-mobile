// Hand-maintained mirror of the Supabase schema for this project.
// Regenerate shape checks with: supabase gen types typescript

export type BookingStatus = "upcoming" | "completed" | "cancelled" | "no_show" | "rescheduled";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type SessionState = "scheduled" | "lobby" | "live" | "uploading" | "scored" | "abandoned";
export type ExamDomain = "reasoning" | "knowledge" | "communication" | "safety";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  specialty: string | null;
  target_board: string | null;
  exam_date: string | null;
  weekly_goal_hours: number | null;
  streak_days: number | null;
  readiness_pct: number | null;
  onboarded: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Topic = { id: string; slug: string; name: string; sort_order: number | null };

export type Examiner = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  institution: string | null;
  headline: string | null;
  bio: string | null;
  verified: boolean | null;
  rating: number | null;
  review_count: number | null;
  from_price_cents: number;
  currency: string;
  availability_label: string | null;
  years_experience: number | null;
  created_at: string | null;
};

export type SessionType = {
  id: string;
  examiner_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  currency: string;
  sort_order: number | null;
};

export type AvailabilitySlot = {
  id: string;
  examiner_id: string;
  starts_at: string;
  ends_at: string;
  is_booked: boolean | null;
};

export type Booking = {
  id: string;
  candidate_id: string;
  examiner_id: string;
  session_type_id: string | null;
  slot_id: string | null;
  status: BookingStatus;
  starts_at: string;
  ends_at: string;
  price_cents: number;
  currency: string;
  payment_status: PaymentStatus;
  focus_topics: string[] | null;
  candidate_note: string | null;
  reschedule_of: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ExamSession = {
  id: string;
  booking_id: string;
  state: SessionState;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  connection_quality: string | null;
  transcript: unknown;
  created_at: string | null;
};

export type ExamQuestion = {
  id: string;
  session_id: string;
  order_index: number;
  prompt: string;
  domain: ExamDomain;
  expected_seconds: number | null;
  asked_at: string | null;
  answered_at: string | null;
  response_text: string | null;
  response_seconds: number | null;
  flagged: boolean | null;
};

export type SessionReport = {
  id: string;
  session_id: string;
  overall_score: number;
  verdict: string | null;
  reasoning_score: number | null;
  knowledge_score: number | null;
  communication_score: number | null;
  safety_score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
  examiner_notes: string | null;
  recommended_next: string | null;
  released_at: string | null;
};

export type Review = {
  id: string;
  booking_id: string;
  candidate_id: string;
  examiner_id: string;
  rating: number;
  body: string | null;
  created_at: string | null;
};

export type PaymentMethod = {
  id: string;
  profile_id: string;
  brand: string;
  last4: string;
  exp_month: number | null;
  exp_year: number | null;
  is_default: boolean | null;
  created_at: string | null;
};

export type Notification = {
  id: string;
  profile_id: string;
  kind: string;
  title: string;
  body: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string | null;
};

export type SavedExaminer = { profile_id: string; examiner_id: string; created_at: string | null };

type Rel<Name extends string, Col extends string, One extends boolean, Ref extends string> = {
  foreignKeyName: Name;
  columns: [Col];
  isOneToOne: One;
  referencedRelation: Ref;
  referencedColumns: ["id"];
};

type Table<Row, Ins = Partial<Row>, Rels extends readonly unknown[] = [], Upd = Partial<Row>> = {
  Row: Row;
  Insert: Ins;
  Update: Upd;
  Relationships: Rels;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      topics: Table<Topic>;
      examiners: Table<Examiner>;
      examiner_topics: Table<
        { examiner_id: string; topic_id: string },
        { examiner_id: string; topic_id: string },
        [
          Rel<"examiner_topics_examiner_id_fkey", "examiner_id", false, "examiners">,
          Rel<"examiner_topics_topic_id_fkey", "topic_id", false, "topics">,
        ]
      >;
      session_types: Table<
        SessionType,
        Partial<SessionType>,
        [Rel<"session_types_examiner_id_fkey", "examiner_id", false, "examiners">]
      >;
      availability_slots: Table<
        AvailabilitySlot,
        Partial<AvailabilitySlot>,
        [Rel<"availability_slots_examiner_id_fkey", "examiner_id", false, "examiners">]
      >;
      bookings: Table<
        Booking,
        Omit<Booking, "id" | "created_at" | "updated_at"> & { id?: string },
        [
          Rel<"bookings_candidate_id_fkey", "candidate_id", false, "profiles">,
          Rel<"bookings_examiner_id_fkey", "examiner_id", false, "examiners">,
          Rel<"bookings_session_type_id_fkey", "session_type_id", false, "session_types">,
          Rel<"bookings_slot_id_fkey", "slot_id", false, "availability_slots">,
        ]
      >;
      exam_sessions: Table<
        ExamSession,
        { booking_id: string } & Partial<ExamSession>,
        [Rel<"exam_sessions_booking_id_fkey", "booking_id", true, "bookings">]
      >;
      exam_questions: Table<
        ExamQuestion,
        { session_id: string; order_index: number; prompt: string } & Partial<ExamQuestion>,
        [Rel<"exam_questions_session_id_fkey", "session_id", false, "exam_sessions">]
      >;
      session_reports: Table<
        SessionReport,
        { session_id: string } & Partial<SessionReport>,
        [Rel<"session_reports_session_id_fkey", "session_id", true, "exam_sessions">]
      >;
      reviews: Table<
        Review,
        { booking_id: string; candidate_id: string; examiner_id: string; rating: number } & Partial<Review>,
        [
          Rel<"reviews_booking_id_fkey", "booking_id", true, "bookings">,
          Rel<"reviews_candidate_id_fkey", "candidate_id", false, "profiles">,
          Rel<"reviews_examiner_id_fkey", "examiner_id", false, "examiners">,
        ]
      >;
      payment_methods: Table<
        PaymentMethod,
        { profile_id: string; brand: string; last4: string } & Partial<PaymentMethod>
      >;
      notifications: Table<
        Notification,
        { profile_id: string; kind: string; title: string } & Partial<Notification>
      >;
      saved_examiners: Table<
        SavedExaminer,
        { profile_id: string; examiner_id: string },
        [
          Rel<"saved_examiners_examiner_id_fkey", "examiner_id", false, "examiners">,
          Rel<"saved_examiners_profile_id_fkey", "profile_id", false, "profiles">,
        ]
      >;
      question_bank: Table<{
        id: string;
        topic_slug: string;
        domain: ExamDomain;
        prompt: string;
        expected_seconds: number | null;
      }>;
    };
    Views: Record<never, never>;
    Functions: {
      create_booking: {
        Args: {
          p_examiner_id: string;
          p_session_type_id: string;
          p_slot_id: string;
          p_focus_topics?: string[] | null;
          p_note?: string | null;
        };
        Returns: string;
      };
      cancel_booking: { Args: { p_booking_id: string }; Returns: undefined };
      start_exam_session: { Args: { p_booking_id: string }; Returns: string };
      finish_exam_session: { Args: { p_session_id: string }; Returns: string };
    };
    Enums: {
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      session_state: SessionState;
      exam_domain: ExamDomain;
    };
    CompositeTypes: Record<never, never>;
  };
};

export type ExaminerWithExtras = Examiner & {
  session_types?: SessionType[];
  examiner_topics?: { topics: Topic | null }[];
};

export type BookingWithExaminer = Booking & {
  examiners: Examiner | null;
  session_types: SessionType | null;
};
