-- Users
create table if not exists users (
  id bigint primary key auto_increment,
  email varchar(255) unique,
  phone varchar(32) unique,
  password_hash varchar(255) not null,
  nickname varchar(64),
  username varchar(64) unique,
  role varchar(32) not null default 'STUDENT',
  status varchar(32) not null default 'ACTIVE',
  campus varchar(64),
  avatar varchar(512),
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp
);

-- Categories
create table if not exists categories (
  id bigint primary key auto_increment,
  name varchar(64) not null,
  parent_id bigint,
  constraint fk_categories_parent foreign key (parent_id) references categories(id)
);

-- Products
create table if not exists products (
  id bigint primary key auto_increment,
  seller_id bigint not null,
  title varchar(128) not null,
  description text,
  price decimal(10,2) not null,
  `condition` varchar(32),
  category_id bigint,
  campus varchar(64),
  status varchar(32) not null default 'ACTIVE',
  views int not null default 0,
  favorites int not null default 0,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  index idx_products_seller (seller_id),
  index idx_products_category (category_id)
  -- FULLTEXT 索引在部分 MySQL 配置/版本会受限，先去掉，后续可按需加上
  -- fulltext index ft_title_desc (title, description)
);

-- Product Images
create table if not exists product_images (
  id bigint primary key auto_increment,
  product_id bigint not null,
  url varchar(512) not null,
  sort_order int not null default 0,
  index idx_product_images_product (product_id)
);

-- Favorites
create table if not exists favorites (
  user_id bigint not null,
  product_id bigint not null,
  created_at timestamp not null default current_timestamp,
  primary key (user_id, product_id)
);

