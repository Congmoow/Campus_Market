-- Orders table
create table if not exists orders (
  id bigint primary key auto_increment,
  buyer_id bigint not null,
  seller_id bigint not null,
  product_id bigint not null,
  quantity int not null default 1,
  price_total decimal(10,2) not null,
  payment_method varchar(32) not null default 'OFFLINE',
  shipping_method varchar(32) not null default 'DELIVERY',
  shipping_address varchar(512),
  logistics_company varchar(128),
  tracking_number varchar(128),
  status varchar(32) not null default 'CREATED',
  title_snapshot varchar(256),
  cover_snapshot varchar(512),
  price_snapshot decimal(10,2),
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  index idx_orders_buyer (buyer_id),
  index idx_orders_seller (seller_id),
  index idx_orders_product (product_id),
  index idx_orders_status (status)
);



