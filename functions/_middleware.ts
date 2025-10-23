export const onRequest: PagesFunction = async (ctx) => {
  // Minimal passthrough middleware to avoid any module-scope issues
  return ctx.next();
};
