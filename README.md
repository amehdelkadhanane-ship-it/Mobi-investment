CONTIX PHONES - GITHUB PAGES VERSION

Upload these files to the ROOT of your repository:
index.html
cart.html
admin.html
style.css
admin-style.css
app.js

GitHub Pages:
Settings -> Pages -> Deploy from a branch -> main -> /(root) -> Save.

Admin URL:
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/admin.html

Demo admin password: King2025
Change ADMIN_PASSWORD in app.js before publishing.

IMPORTANT:
This version uses browser localStorage. Products/pictures/orders added from Admin are NOT shared with other customers or devices. For a real online store, connect the site to a database/storage backend (Supabase/Firebase/etc.) and use server-side authentication.
