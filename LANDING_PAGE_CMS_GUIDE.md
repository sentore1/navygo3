# Landing Page CMS - Complete Guide

## Overview
The Landing Page CMS allows admins to control all content on the landing page through a database-driven interface. No code changes needed!

## Features

### 1. Section Management
- Enable/disable entire sections (Hero, Testimonials, Leaderboard, CTA)
- Control display order
- Toggle visibility without deleting content

### 2. Header Customization
- Logo text and icon
- Navigation menu items
- CTA button text and link
- Background style (transparent, solid, blur)

### 3. Footer Customization
- Company name and tagline
- Large decorative text
- Footer links (Contact, Privacy, Terms, etc.)
- Social media links
- Copyright text
- Newsletter signup form

### 4. Testimonials Management
- Add/edit/delete customer testimonials
- Set name, designation, company
- Upload avatar images
- 5-star rating system
- Featured testimonials
- Display order control
- Enable/disable individual testimonials

### 5. Features Management
- Add/edit/delete product features
- Title and description
- Icon selection (Lucide icons)
- Image URLs
- Link URLs and text
- Feature types (standard, highlighted, integration)
- Display order

### 6. Call-to-Action Sections
- Multiple CTA sections throughout the site
- Customizable titles and descriptions
- Button text and links
- Email form toggle
- Star ratings display
- Background and text colors
- Enable/disable individual CTAs

### 7. Media Library
- Centralized image/video storage
- File metadata (alt text, tags, dimensions)
- File type categorization
- Upload tracking

## Database Tables

### `landing_sections`
Controls which sections appear on the landing page and their order.

```sql
- id: UUID (primary key)
- section_key: TEXT (unique, e.g., 'hero', 'testimonials')
- section_name: TEXT
- is_enabled: BOOLEAN
- display_order: INTEGER
```

### `section_content`
Stores all content for each landing page section.

```sql
- id: UUID (primary key)
- section_id: UUID (foreign key)
- content_key: TEXT (e.g., 'hero_title', 'hero_image')
- content_type: TEXT ('text', 'image', 'button', 'html', 'video')
- content_value: TEXT
- content_metadata: JSONB
- display_order: INTEGER
```

### `header_settings`
Controls header/navigation appearance.

```sql
- id: UUID (primary key)
- logo_url: TEXT
- logo_text: TEXT
- show_logo_icon: BOOLEAN
- navigation_items: JSONB (array of menu items)
- cta_button_text: TEXT
- cta_button_link: TEXT
- show_cta_button: BOOLEAN
- background_style: TEXT
```

### `footer_settings`
Controls footer appearance.

```sql
- id: UUID (primary key)
- company_name: TEXT
- tagline: TEXT
- show_large_text: BOOLEAN
- large_text: TEXT
- footer_links: JSONB (array of links)
- social_links: JSONB (object with social URLs)
- copyright_text: TEXT
- show_newsletter: BOOLEAN
```

### `testimonials`
Customer testimonials.

```sql
- id: UUID (primary key)
- name: TEXT
- designation: TEXT
- company: TEXT
- testimonial: TEXT
- avatar_url: TEXT
- rating: INTEGER (1-5)
- is_featured: BOOLEAN
- display_order: INTEGER
- is_enabled: BOOLEAN
```

### `features`
Product features.

```sql
- id: UUID (primary key)
- title: TEXT
- description: TEXT
- icon_name: TEXT (Lucide icon)
- image_url: TEXT
- link_url: TEXT
- link_text: TEXT
- display_order: INTEGER
- is_enabled: BOOLEAN
- feature_type: TEXT
```

### `cta_sections`
Call-to-action sections.

```sql
- id: UUID (primary key)
- section_key: TEXT (unique)
- title: TEXT
- description: TEXT
- button_text: TEXT
- button_link: TEXT
- show_email_form: BOOLEAN
- show_stars: BOOLEAN
- is_enabled: BOOLEAN
- display_order: INTEGER
```

### `media_library`
Centralized media storage.

```sql
- id: UUID (primary key)
- file_name: TEXT
- file_url: TEXT
- file_type: TEXT ('image', 'video', 'icon')
- alt_text: TEXT
- tags: TEXT[]
- uploaded_by: UUID
- file_size: INTEGER
- dimensions: JSONB
```

## Setup Instructions

### 1. Run Database Migration

```bash
# In Supabase SQL Editor, run:
\i supabase/migrations/20260404000005_create_landing_page_cms.sql

# Or use the quick setup script:
\i SETUP_LANDING_CMS.sql
```

### 2. Access Admin Panel

1. Navigate to `/admin` in your browser
2. Click the "Landing Page" button in the top navigation
3. You'll see tabs for: Sections, Header, Footer, Testimonials, and CTA

### 3. Customize Your Landing Page

#### Sections Tab
- Toggle visibility of entire sections
- Reorder sections (coming soon)

#### Header Tab
- Change logo text
- Toggle logo icon visibility
- Update CTA button text and link
- Modify navigation items (in database directly for now)

#### Footer Tab
- Update company name
- Toggle large decorative text
- Change copyright text
- Modify footer links (in database directly for now)

#### Testimonials Tab
- Click "Add Testimonial" to create new ones
- Edit existing testimonials
- Delete testimonials
- Toggle active/inactive status

#### CTA Tab
- Create multiple CTA sections
- Customize titles, descriptions, buttons
- Toggle email forms and star displays
- Enable/disable individual CTAs

## Admin Access

Only users with `role = 'admin'` in the `users` table can access the CMS.

To make a user an admin:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Security

- Row Level Security (RLS) is enabled on all tables
- Public can read enabled content
- Only admins can create/update/delete
- All changes are timestamped
- Activity logging (coming soon)

## API Usage

### Fetch Landing Page Data

```typescript
// Get all enabled sections
const { data: sections } = await supabase
  .from('landing_sections')
  .select('*')
  .eq('is_enabled', true)
  .order('display_order');

// Get header settings
const { data: header } = await supabase
  .from('header_settings')
  .select('*')
  .single();

// Get testimonials
const { data: testimonials } = await supabase
  .from('testimonials')
  .select('*')
  .eq('is_enabled', true)
  .order('display_order');

// Get CTA sections
const { data: ctas } = await supabase
  .from('cta_sections')
  .select('*')
  .eq('is_enabled', true)
  .order('display_order');
```

## Next Steps

### Recommended Enhancements

1. **Image Upload**: Integrate with Supabase Storage for direct image uploads
2. **Drag & Drop Reordering**: Add drag-and-drop for section ordering
3. **Preview Mode**: Live preview before publishing changes
4. **Version History**: Track changes and allow rollbacks
5. **A/B Testing**: Test different versions of content
6. **Analytics Integration**: Track which content performs best
7. **Scheduled Publishing**: Schedule content changes
8. **Multi-language Support**: Add translations for different languages

### Updating the Landing Page Component

To use the CMS data in your landing page, update `src/app/page.tsx`:

```typescript
// Fetch CMS data
const { data: sections } = await supabase
  .from('landing_sections')
  .select('*')
  .eq('is_enabled', true)
  .order('display_order');

const { data: testimonials } = await supabase
  .from('testimonials')
  .select('*')
  .eq('is_enabled', true)
  .order('display_order');

// Render sections dynamically
{sections?.map(section => {
  switch(section.section_key) {
    case 'hero':
      return <Hero key={section.id} />;
    case 'testimonials':
      return <Testimonials key={section.id} data={testimonials} />;
    case 'leaderboard':
      return <LeaderboardSection key={section.id} />;
    case 'cta':
      return <CTASection key={section.id} />;
    default:
      return null;
  }
})}
```

## Troubleshooting

### Can't access admin panel
- Verify your user has `role = 'admin'` in the database
- Check browser console for errors
- Ensure you're signed in

### Changes not appearing
- Check if the section/item is enabled
- Verify display_order is set correctly
- Clear browser cache
- Check RLS policies

### Database errors
- Ensure migrations ran successfully
- Check Supabase logs for detailed errors
- Verify foreign key relationships

## Support

For issues or questions:
1. Check the database schema in the migration file
2. Review RLS policies in Supabase dashboard
3. Check admin activity logs (coming soon)
4. Contact your development team

## Changelog

### Version 1.0.0 (2024-04-04)
- Initial release
- Section management
- Header/Footer customization
- Testimonials CRUD
- CTA sections CRUD
- Media library structure
- RLS policies
- Admin interface
