-- 导航站「常用网站」数据表：所有人可读，只有 meikp666@gmail.com 登录后可增删改
create table if not exists public.nav_links (
  id         bigint generated always as identity primary key,
  grp        text not null,                -- 分组名
  name       text not null,                -- 网站名
  url        text not null check (url ~* '^https?://'),
  icon       text not null default '🔗',   -- emoji 图标
  sort       int  not null default 0,      -- 排序（小的在前）
  created_at timestamptz not null default now()
);

alter table public.nav_links enable row level security;

drop policy if exists "public read"  on public.nav_links;
drop policy if exists "owner insert" on public.nav_links;
drop policy if exists "owner update" on public.nav_links;
drop policy if exists "owner delete" on public.nav_links;

create policy "public read"  on public.nav_links for select using (true);
create policy "owner insert" on public.nav_links for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'meikp666@gmail.com');
create policy "owner update" on public.nav_links for update to authenticated
  using ((auth.jwt() ->> 'email') = 'meikp666@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'meikp666@gmail.com');
create policy "owner delete" on public.nav_links for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'meikp666@gmail.com');

grant select on public.nav_links to anon, authenticated;
grant insert, update, delete on public.nav_links to authenticated;

-- 初始数据（与当前导航页一致；表里已有数据时不重复插入）
insert into public.nav_links (grp, name, url, icon, sort)
select * from (values
  ('常用工具','百度','https://www.baidu.com','🔍',10),
  ('常用工具','Bing','https://www.bing.com','🅱️',20),
  ('常用工具','Google','https://www.google.com','🌐',30),
  ('常用工具','QQ邮箱','https://mail.qq.com','📧',40),
  ('常用工具','知乎','https://www.zhihu.com','📚',50),
  ('常用工具','哔哩哔哩','https://www.bilibili.com','📺',60),
  ('开发与学习','GitHub','https://github.com','🐙',110),
  ('开发与学习','Stack Overflow','https://stackoverflow.com','💡',120),
  ('开发与学习','MDN 文档','https://developer.mozilla.org','📖',130),
  ('开发与学习','菜鸟教程','https://www.runoob.com','🐣',140),
  ('开发与学习','ChatGPT','https://chat.openai.com','🤖',150),
  ('开发与学习','DeepSeek','https://www.deepseek.com','🐋',160),
  ('购物与生活','淘宝','https://www.taobao.com','🛒',210),
  ('购物与生活','京东','https://www.jd.com','📦',220),
  ('购物与生活','大众点评','https://www.dianping.com','🍜',230),
  ('购物与生活','12306','https://www.12306.cn','🚄',240),
  ('购物与生活','高德地图','https://www.amap.com','🗺️',250),
  ('购物与生活','抖音','https://www.douyin.com','🎵',260)
) as v(grp, name, url, icon, sort)
where not exists (select 1 from public.nav_links);
