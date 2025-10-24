# Policy Pages Implementation Prompt

Copy and paste this prompt into your template project:

---

Create three new policy pages for the restaurant website: Privacy Policy, Cookies Policy, and Terms of Service. These pages should:

1. **Create three new pages:**
   - `/privacidad` - Privacy Policy page
   - `/cookies` - Cookies Policy page
   - `/terminos` - Terms of Service page

2. **Database fields to use from `client_policies` table:**
   - Privacy Policy: `privacy_policy_enabled` (boolean) and `privacy_policy_content` (text)
   - Cookies Policy: `cookies_policy_enabled` (boolean) and `cookies_policy_content` (text)
   - Terms of Service: `terms_of_service_enabled` (boolean) and `terms_of_service_content` (text)

3. **Page requirements:**
   - Each page should fetch its content from the `client_policies` table based on the current client's subdomain
   - Display the HTML content from the `*_content` field (it contains pre-formatted HTML with headings, lists, etc.)
   - Use a clean, simple layout with:
     - Restaurant name or logo at the top
     - Main content area with proper typography hierarchy
     - Responsive design that works on mobile and desktop
     - Good spacing and readability
   - If the policy is not enabled or content is empty, show a 404 or "Page not found" message

4. **Footer integration:**
   - Update the Footer component to:
     - Fetch the `client_policies` data (privacy_policy_enabled, cookies_policy_enabled, terms_of_service_enabled)
     - Only show footer links for policies that are enabled (where `*_enabled` is true)
     - Links should be:
       - "Política de Privacidad" → `/privacidad`
       - "Política de Cookies" → `/cookies`
       - "Términos y Condiciones" → `/terminos`
     - Place these links in a "Legal" or "Políticas" section of the footer

5. **Styling guidelines:**
   - Use semantic HTML: h1, h2, h3 for headings, ul/ol for lists, p for paragraphs
   - The content is already formatted as HTML, so render it using dangerouslySetInnerHTML or similar
   - Apply clean typography: good line-height, readable font sizes, proper spacing between sections
   - Use a max-width container (like max-w-4xl) for readability
   - Style lists with proper indentation and spacing
   - Ensure links within the content are styled appropriately

6. **Routes setup:**
   - Add these three routes to your router configuration
   - Each route should render its respective policy page component

The content in the database is pre-generated with all the restaurant-specific information (name, RUC, contact details, etc.) already populated, so you just need to display it as-is.