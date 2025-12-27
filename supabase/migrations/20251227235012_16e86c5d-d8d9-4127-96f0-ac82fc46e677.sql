-- Insert admin role for the user nanbondev@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('c4b27cab-6f41-4680-809e-99982b042f1a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;