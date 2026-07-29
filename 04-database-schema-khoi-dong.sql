-- Database schema khoi dong cho he thong affiliate hoan tien Web + Zalo

create table users (
  id uuid primary key,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  full_name varchar(255) not null,
  role varchar(50) not null,
  status varchar(30) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table customers (
  id uuid primary key,
  customer_code varchar(50) not null unique,
  full_name varchar(255) not null,
  phone varchar(30),
  zalo_user_id varchar(100),
  zalo_display_name varchar(255),
  status varchar(30) not null default 'active',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_phone on customers(phone);
create index idx_customers_zalo_user_id on customers(zalo_user_id);

create table platforms (
  id uuid primary key,
  code varchar(30) not null unique,
  name varchar(100) not null,
  status varchar(30) not null default 'active',
  created_at timestamptz not null default now()
);

create table affiliate_channels (
  id uuid primary key,
  code varchar(30) not null unique,
  name varchar(100) not null,
  platform_id uuid not null references platforms(id),
  status varchar(30) not null default 'active',
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table tracking_links (
  id uuid primary key,
  customer_id uuid not null references customers(id),
  platform_id uuid not null references platforms(id),
  affiliate_channel_id uuid references affiliate_channels(id),
  channel_source varchar(30) not null,
  tracking_code varchar(120) not null unique,
  original_url text not null,
  normalized_url text,
  affiliate_url text not null,
  sub_id1 varchar(100),
  sub_id2 varchar(120),
  sub_id3 varchar(100),
  sub_id4 varchar(100),
  sub_id5 varchar(100),
  short_url text,
  status varchar(30) not null default 'active',
  created_by_user_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tracking_links_customer_id on tracking_links(customer_id);
create index idx_tracking_links_platform_id on tracking_links(platform_id);
create index idx_tracking_links_channel_source on tracking_links(channel_source);
create index idx_tracking_links_created_at on tracking_links(created_at);

create table vouchers (
  id uuid primary key,
  platform_id uuid not null references platforms(id),
  title varchar(255) not null,
  voucher_code varchar(100),
  voucher_url text,
  benefit_text text,
  conditions_text text,
  starts_at timestamptz,
  ends_at timestamptz,
  status varchar(30) not null default 'draft',
  priority int not null default 0,
  metadata jsonb,
  created_by_user_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_vouchers_platform_id on vouchers(platform_id);
create index idx_vouchers_status on vouchers(status);
create index idx_vouchers_ends_at on vouchers(ends_at);

create table link_voucher_matches (
  id uuid primary key,
  tracking_link_id uuid not null references tracking_links(id) on delete cascade,
  voucher_id uuid not null references vouchers(id),
  created_at timestamptz not null default now(),
  unique (tracking_link_id, voucher_id)
);

create table import_batches (
  id uuid primary key,
  source_name varchar(100) not null,
  file_name varchar(255) not null,
  file_storage_key text,
  imported_by_user_id uuid references users(id),
  total_rows int not null default 0,
  success_rows int not null default 0,
  duplicate_rows int not null default 0,
  unmapped_rows int not null default 0,
  error_rows int not null default 0,
  status varchar(30) not null default 'uploaded',
  column_mapping jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table import_batch_rows (
  id uuid primary key,
  batch_id uuid not null references import_batches(id) on delete cascade,
  row_number int not null,
  order_external_id varchar(150),
  checkout_id varchar(150),
  tracking_code varchar(120),
  channel varchar(100),
  ordered_at timestamptz,
  completed_at timestamptz,
  clicked_at timestamptz,
  shop_name varchar(255),
  shop_id varchar(150),
  item_id varchar(150),
  item_name text,
  commission_amount numeric(18,2),
  gross_commission_amount numeric(18,2),
  net_commission_amount numeric(18,2),
  order_amount numeric(18,2),
  order_status varchar(50),
  product_affiliate_status varchar(100),
  sub_id1 varchar(100),
  sub_id2 varchar(120),
  sub_id3 varchar(100),
  sub_id4 varchar(100),
  sub_id5 varchar(100),
  payment_status varchar(50),
  raw_data jsonb not null,
  processing_status varchar(30) not null default 'pending',
  error_message text,
  created_at timestamptz not null default now()
);

create index idx_import_batch_rows_batch_id on import_batch_rows(batch_id);
create index idx_import_batch_rows_tracking_code on import_batch_rows(tracking_code);

create table orders (
  id uuid primary key,
  platform_id uuid not null references platforms(id),
  customer_id uuid references customers(id),
  tracking_link_id uuid references tracking_links(id),
  import_batch_id uuid references import_batches(id),
  order_external_id varchar(150) not null,
  checkout_id varchar(150),
  tracking_code varchar(120),
  channel varchar(100),
  ordered_at timestamptz,
  completed_at timestamptz,
  clicked_at timestamptz,
  shop_name varchar(255),
  shop_id varchar(150),
  item_id varchar(150),
  item_name text,
  order_amount numeric(18,2),
  gross_commission_amount numeric(18,2),
  net_commission_amount numeric(18,2),
  commission_amount numeric(18,2) not null default 0,
  customer_reward_amount numeric(18,2) not null default 0,
  system_profit_amount numeric(18,2) not null default 0,
  order_status varchar(30) not null default 'pending',
  product_affiliate_status varchar(100),
  sub_id1 varchar(100),
  sub_id2 varchar(120),
  sub_id3 varchar(100),
  sub_id4 varchar(100),
  sub_id5 varchar(100),
  payout_status varchar(30) not null default 'unpaid',
  source_type varchar(30) not null default 'import',
  raw_data jsonb,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform_id, order_external_id)
);

create index idx_orders_customer_id on orders(customer_id);
create index idx_orders_tracking_code on orders(tracking_code);
create index idx_orders_order_status on orders(order_status);
create index idx_orders_payout_status on orders(payout_status);

create table commission_rules (
  id uuid primary key,
  name varchar(100) not null,
  customer_rate numeric(5,2) not null,
  system_rate numeric(5,2) not null,
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by_user_id uuid references users(id),
  created_at timestamptz not null default now()
);

create table payment_batches (
  id uuid primary key,
  payment_code varchar(50) not null unique,
  period_label varchar(100),
  customer_id uuid not null references customers(id),
  total_amount numeric(18,2) not null,
  transfer_reference varchar(150),
  transfer_note text,
  bill_storage_key text,
  status varchar(30) not null default 'pending',
  paid_by_user_id uuid references users(id),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payment_batches_customer_id on payment_batches(customer_id);
create index idx_payment_batches_status on payment_batches(status);

create table payment_batch_items (
  id uuid primary key,
  payment_batch_id uuid not null references payment_batches(id) on delete cascade,
  order_id uuid not null references orders(id),
  amount numeric(18,2) not null,
  created_at timestamptz not null default now(),
  unique (payment_batch_id, order_id)
);

create table zalo_accounts (
  id uuid primary key,
  oa_name varchar(255) not null,
  oa_id varchar(100),
  app_id varchar(100),
  webhook_url text,
  status varchar(30) not null default 'inactive',
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table zalo_message_logs (
  id uuid primary key,
  zalo_account_id uuid references zalo_accounts(id),
  customer_id uuid references customers(id),
  direction varchar(10) not null,
  external_message_id varchar(150),
  sender_id varchar(100),
  receiver_id varchar(100),
  message_type varchar(50),
  message_text text,
  payload jsonb,
  processing_status varchar(30) not null default 'received',
  created_at timestamptz not null default now()
);

create index idx_zalo_message_logs_customer_id on zalo_message_logs(customer_id);
create index idx_zalo_message_logs_direction on zalo_message_logs(direction);
create index idx_zalo_message_logs_created_at on zalo_message_logs(created_at);

create table audit_logs (
  id uuid primary key,
  actor_user_id uuid references users(id),
  entity_type varchar(50) not null,
  entity_id uuid not null,
  action varchar(50) not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_created_at on audit_logs(created_at);
