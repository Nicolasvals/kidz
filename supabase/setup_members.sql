create table if not exists public.kidz_members (
  id text primary key,
  name text not null,
  subtitle text not null default '',
  photo text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.kidz_gallery (
  id text primary key,
  src text not null,
  caption text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kidz_members enable row level security;
alter table public.kidz_gallery enable row level security;

insert into public.kidz_members (id,name,subtitle,photo,sort_order) values
('member-lb','LB','LÍDER','assets/members/lb.png',1),
('member-zoe','Zoe Briggs','LA JEFA','assets/members/zoe-briggs.png',2),
('member-keith','Keith Webb','SUBLÍDER','assets/members/keith-webb.png',3),
('member-cain','Cain Crane','MIEMBRO','assets/members/cain-crane.png',4),
('member-twenty','Twenty','MIEMBRO','assets/members/twenty.png',5),
('member-ayden','Ayden Brown','MIEMBRO','assets/members/ayden-brown.png',6),
('member-kb','KB','MIEMBRO','assets/members/orgulloso.png',7)
on conflict (id) do nothing;

alter table public.kidz_gallery
  add column if not exists media_type text not null default 'image';


alter table public.kidz_members
  add column if not exists real_name text not null default '',
  add column if not exists state_id text not null default '',
  add column if not exists phone text not null default '';

update public.kidz_members set name='KB', real_name='KB', state_id='71563', phone='848-049-4582'
where id in ('member-orgulloso','member-kb');

update public.kidz_members set real_name='La''Tray Banks', state_id='40268', phone='585-860-1997'
where id='member-lb';

update public.kidz_members set real_name='Keith Webb', state_id='43420', phone='373-784-6810'
where id='member-keith';

update public.kidz_members set real_name='Zoe Briggs', state_id='99760', phone='167-316-9170'
where id='member-zoe';

update public.kidz_members set real_name='Ayden Brown', state_id='47896', phone='252-730-1038'
where id='member-ayden';

update public.kidz_members set real_name='Cain Crane', state_id='64654', phone='314-464-9339'
where id='member-cain';


alter table public.kidz_gallery
  add column if not exists group_id text not null default '';

create table if not exists public.kidz_media_groups (
  id text primary key,
  name text not null,
  description text not null default '',
  group_type text not null default 'image',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kidz_media_groups enable row level security;

update public.kidz_members
set real_name='Caín Cross', state_id='86163', phone='728-625-5455'
where id='member-twenty';

insert into public.kidz_members
(id,name,subtitle,real_name,state_id,phone,photo,sort_order)
values
('member-malik','Malik Scott','MIEMBRO','Malik Scott','80016','297-127-7767','assets/members/malik-scott.png',6)
on conflict (id) do update set
  name=excluded.name,
  subtitle=excluded.subtitle,
  real_name=excluded.real_name,
  state_id=excluded.state_id,
  phone=excluded.phone,
  photo=excluded.photo,
  sort_order=excluded.sort_order;

update public.kidz_members set sort_order=7 where id='member-ayden';
update public.kidz_members set sort_order=8 where id in ('member-kb','member-orgulloso');
