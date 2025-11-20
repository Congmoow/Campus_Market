-- Chat persistence tables
create table if not exists chat_threads (
  id bigint primary key auto_increment,
  user_a_id bigint not null,
  user_b_id bigint not null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  constraint uq_chat_thread_pair unique (user_a_id, user_b_id)
);

create table if not exists chat_conversations (
  id bigint primary key auto_increment,
  thread_id bigint not null,
  user_id bigint not null,
  peer_id bigint not null,
  last_message text,
  last_message_from_peer text,
  unread_count int not null default 0,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  constraint uq_chat_conversation_owner unique (thread_id, user_id),
  index idx_chat_conversation_user (user_id),
  index idx_chat_conversation_thread (thread_id),
  constraint fk_chat_conversation_thread foreign key (thread_id) references chat_threads(id) on delete cascade
);

create table if not exists chat_messages (
  id bigint primary key auto_increment,
  thread_id bigint not null,
  sender_id bigint not null,
  receiver_id bigint not null,
  content text not null,
  created_at timestamp not null default current_timestamp,
  index idx_chat_message_thread (thread_id),
  index idx_chat_message_created (created_at),
  constraint fk_chat_message_thread foreign key (thread_id) references chat_threads(id) on delete cascade
);

