-- Admin policies for menu_categories
CREATE POLICY "Admins can view all menu categories"
ON public.menu_categories
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert menu categories"
ON public.menu_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any menu category"
ON public.menu_categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any menu category"
ON public.menu_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin policies for menu_items
CREATE POLICY "Admins can view all menu items"
ON public.menu_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert menu items"
ON public.menu_items
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any menu item"
ON public.menu_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any menu item"
ON public.menu_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));