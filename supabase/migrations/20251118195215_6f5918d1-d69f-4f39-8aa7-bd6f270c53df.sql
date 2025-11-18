-- Criar enum para roles
create type public.app_role as enum ('admin', 'user');

-- Criar tabela de roles (SEPARADA da tabela de usuários por segurança)
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null default 'user',
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Função SECURITY DEFINER para verificar roles (evita recursão em RLS)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Função para verificar se usuário é admin
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'admin')
$$;

-- Trigger para criar role 'user' automaticamente ao criar novo usuário
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute procedure public.handle_new_user_role();

-- Políticas RLS
create policy "Users can view their own roles"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Only admins can insert roles"
  on public.user_roles
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "Only admins can update roles"
  on public.user_roles
  for update
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Only admins can delete roles"
  on public.user_roles
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));