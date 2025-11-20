insert into categories (id, name, parent_id) values
  (1, '电子产品', null),
  (2, '图书教材', null),
  (3, '生活用品', null),
  (4, '运动器材', null),
  (5, '服饰鞋包', null),
  (6, '美妆护肤', null),
  (7, '文具办公', null),
  (8, '其他', null)
on duplicate key update name=values(name);

