export interface CommunityTopic {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
}

export interface CommunityDiscussion {
  id: string;
  author_id: string;
  author_name: string;
  topic_id: string;
  title: string;
  content: string;
  reply_count: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityReply {
  id: string;
  discussion_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_id: string;
  target_type: "discussion" | "reply";
  target_id: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
  created_at: string;
}

export interface CreateDiscussionInput {
  topic_id: string;
  title: string;
  content: string;
}

export interface UpdateDiscussionInput {
  title: string;
  content: string;
}

export interface CreateReplyInput {
  discussion_id: string;
  content: string;
}

export interface UpdateReplyInput {
  content: string;
}

export interface CreateReportInput {
  target_type: "discussion" | "reply";
  target_id: string;
  reason: string;
}
