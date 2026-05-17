# Photo Upload Feature Setup

## Installation Steps

### 1. Run Database Migration
To add the photo field to posts table:

```bash
cd back-end
php artisan migrate
```

### 2. Verify Upload Directories Exist
The upload directories should be automatically created when uploading, but you can manually create them:

```bash
mkdir -p public/uploads/avatars
mkdir -p public/uploads/posts
```

### 3. Set Directory Permissions (Linux/Mac only)
```bash
chmod -R 755 public/uploads
```

## Features Added

### Profile Picture Upload
- Click on your avatar in the sidebar to upload a profile picture
- Supported formats: JPEG, PNG, JPG, GIF
- Max file size: 5MB
- Shows a hover overlay indicating "Change"

### Post Photo Upload
- In the post composer, click the 📷 Photo button
- Select an image to attach to your post
- Preview appears before posting
- Click the × button to remove the photo

### How It Works
1. **Frontend**: User selects an image file
2. **API Call**: Image is uploaded to `/auth/upload/avatar` or `/auth/upload/photo`
3. **Backend**: File is saved to `public/uploads/avatars/` or `public/uploads/posts/`
4. **Database**: Path is saved in users/posts table
5. **Display**: Images are served via `/uploads/{path}` URLs

## Image URLs
- Avatar: `/uploads/avatars/{filename}`
- Post Photos: `/uploads/posts/{filename}`

These are standard public directory URLs that work directly.

## Troubleshooting

### Images Not Loading
1. Check browser console for 404 errors
2. Verify files exist in `public/uploads/avatars/` or `public/uploads/posts/`
3. Check directory permissions (should be 755 or 777)

### Upload Fails
1. Check file size (max 5MB)
2. Ensure file is a valid image format (JPEG, PNG, JPG, GIF)
3. Verify `public/uploads/` directory exists and is writable
4. Check `storage/logs/laravel.log` for detailed errors

### Permission Issues
If you get permission errors on Windows, run your terminal/XAMPP as administrator.

