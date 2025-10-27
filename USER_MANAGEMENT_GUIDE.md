# 👥 User Management Guide

Complete guide to managing users in the Study Planner admin portal.

## 🎯 Overview

The User Management page allows admins to create and manage student and admin accounts. All users can log in to the system with their email and password.

## 🚀 Accessing User Management

1. Log in to the admin portal
2. Click "Users" in the sidebar navigation
3. Or navigate to `/users`

## 📋 Features

### 1. View All Users

**User Table Columns:**
- **Name**: User's display name
- **Email**: User's email address
- **Role**: ADMIN or STUDENT
- **Active Schedule**: Whether user has an active study schedule
- **Created**: Account creation date
- **Actions**: Edit and delete buttons

**Statistics:**
- Total Users count
- Students count
- Admins count

### 2. Search Users

Use the search bar to filter users by:
- Name
- Email
- Role

**Example:**
- Search "john" → Finds "John Doe", "john@example.com"
- Search "admin" → Finds all admin users
- Search "student" → Finds all student users

### 3. Add New User

**Steps:**
1. Click "Add User" button
2. Fill in the form:
   - **Full Name**: User's display name
   - **Email**: Valid email address
   - **Password**: At least 6 characters
   - **Role**: ADMIN or STUDENT
3. Click "Create User"

**What Happens:**
- User account created in Firebase Authentication
- User profile created in Firestore
- User can immediately log in with their credentials
- Toast notification confirms success

**Validation:**
- All fields are required
- Email must be valid format
- Password must be at least 6 characters
- Email must not already exist

**Error Messages:**
- "Email already in use" - Email exists in system
- "Invalid email address" - Email format is wrong
- "Password is too weak" - Password too short
- "Please fill in all fields" - Missing required fields

### 4. Edit User Role

**Steps:**
1. Click edit icon (✏️) next to user
2. Select new role from dropdown:
   - **STUDENT**: Regular user, can view and complete study plans
   - **ADMIN**: Can access admin portal, manage plans and users
3. Click "Save Changes"

**Important:**
- Changing role takes effect immediately
- ADMIN users can access the admin portal
- STUDENT users can only access the mobile app
- Be careful when changing admin roles

### 5. Delete User

**Steps:**
1. Click delete icon (🗑️) next to user
2. Confirm deletion in popup

**Note:**
- Currently requires backend implementation
- Deleting from Firebase Auth needs admin SDK
- User data in Firestore can be marked as deleted
- **TODO**: Implement backend endpoint for user deletion

### 6. Refresh Users

Click "Refresh" button to reload users from Firebase.

**When to Use:**
- After making changes in Firebase Console
- If data seems out of sync
- To see latest updates

## 🎨 User Interface

### Role Badges

**ADMIN:**
- Red badge
- Indicates administrative privileges
- Can access admin portal

**STUDENT:**
- Blue badge
- Indicates regular user
- Can use mobile app

### Active Schedule Indicator

**Active:**
- Green "Active" chip
- User has an active study schedule
- Currently studying a plan

**None:**
- Gray "None" chip
- No active schedule
- User hasn't started studying yet

## 🔐 Security & Permissions

### Who Can Access

- Only users with **ADMIN** role
- Protected by authentication
- Requires valid login session

### Password Security

**Requirements:**
- Minimum 6 characters
- Enforced by Firebase Auth
- Users can change after first login

**Best Practices:**
- Use strong passwords
- Don't share credentials
- Change default passwords
- Use unique passwords per user

### Role Management

**ADMIN Role:**
- Full access to admin portal
- Can manage study plans
- Can manage users
- Can view analytics

**STUDENT Role:**
- Access to mobile app only
- Can view assigned study plans
- Can track their progress
- Cannot access admin portal

## 📊 Use Cases

### Creating Student Accounts

**Scenario:** New student joins your program

**Steps:**
1. Click "Add User"
2. Enter student's name and email
3. Generate a temporary password
4. Select "STUDENT" role
5. Create user
6. Share credentials with student
7. Student logs in and changes password

### Promoting User to Admin

**Scenario:** Teacher needs admin access

**Steps:**
1. Find user in table
2. Click edit icon
3. Change role to "ADMIN"
4. Save changes
5. User can now access admin portal

### Bulk User Import

**Current:** Manual creation one by one
**Future:** Import from CSV file (TODO)

## 🐛 Troubleshooting

### "Email already in use"

**Problem:** Email exists in Firebase Auth
**Solution:**
- Use different email
- Or delete existing user first
- Check if user already exists in table

### "Failed to create user"

**Problem:** Network or Firebase error
**Solution:**
- Check internet connection
- Verify Firebase configuration
- Check browser console for errors
- Try again after a moment

### User Not Appearing

**Problem:** User created but not in table
**Solution:**
- Click "Refresh" button
- Check Firestore in Firebase Console
- Verify user document was created
- Check for JavaScript errors

### Can't Delete User

**Problem:** Delete button shows error
**Solution:**
- Feature requires backend implementation
- Contact developer for assistance
- Manually delete in Firebase Console
- Mark user as inactive instead

## 💡 Best Practices

### User Creation

1. **Use Real Names**: Help identify users easily
2. **Use School/Work Emails**: More professional
3. **Strong Passwords**: At least 8-10 characters
4. **Verify Email**: Confirm email is correct before creating
5. **Document Credentials**: Keep secure record

### Role Assignment

1. **Principle of Least Privilege**: Start with STUDENT role
2. **Limited Admins**: Only give admin to trusted users
3. **Regular Review**: Audit admin list periodically
4. **Remove Access**: Change role when user leaves

### Data Management

1. **Regular Backups**: Export user list periodically
2. **Monitor Activity**: Check who's using the system
3. **Clean Up**: Remove inactive users
4. **Privacy**: Protect user information

## 📈 Statistics & Monitoring

### User Metrics

**Total Users:**
- All users in system
- Admins + Students

**Students:**
- Users with STUDENT role
- Primary user base
- Track engagement

**Admins:**
- Users with ADMIN role
- Should be small number
- Monitor for security

### Active Schedules

**Track:**
- How many users have active schedules
- Engagement rate
- Onboarding completion

## 🔄 Workflow Examples

### Onboarding New Students

1. **Prepare:**
   - Collect student emails
   - Generate secure passwords
   - Prepare welcome email

2. **Create Accounts:**
   - Add users one by one
   - Assign STUDENT role
   - Note credentials

3. **Notify Students:**
   - Send welcome email
   - Include login instructions
   - Provide support contact

4. **Follow Up:**
   - Check if students logged in
   - Verify they can access app
   - Help with any issues

### Managing Teaching Staff

1. **Create Account:**
   - Add with ADMIN role
   - Use work email
   - Strong password

2. **Grant Access:**
   - Verify role is ADMIN
   - Test portal access
   - Provide training

3. **Monitor:**
   - Track admin activities
   - Regular security reviews
   - Update roles as needed

## 🚀 Future Enhancements

### Planned Features

1. **CSV Import**: Bulk user creation from file
2. **Email Invitations**: Send automated welcome emails
3. **Password Reset**: Admin-initiated password reset
4. **User Deletion**: Complete user removal
5. **Activity Logs**: Track user actions
6. **Bulk Operations**: Edit multiple users at once
7. **Advanced Filters**: Filter by creation date, activity
8. **Export Users**: Download user list as CSV

### Backend Requirements

Some features need backend API:
- User deletion (requires Firebase Admin SDK)
- Email invitations (requires email service)
- Password reset (requires secure token generation)

## 📞 Support

### Common Questions

**Q: Can students access the admin portal?**
A: No, only users with ADMIN role can access the portal.

**Q: How do students log in?**
A: Students use the mobile app with their email and password.

**Q: Can I change a user's email?**
A: Not currently. You'd need to create a new account.

**Q: What happens if I forget a user's password?**
A: Use Firebase Console to reset it, or create a new account.

**Q: How many admins should I have?**
A: As few as possible - typically 2-3 for redundancy.

### Getting Help

If you encounter issues:
1. Check this guide
2. Check browser console for errors
3. Verify Firebase configuration
4. Contact technical support

---

## ✅ Quick Reference

### Adding a User
```
1. Click "Add User"
2. Fill: Name, Email, Password, Role
3. Click "Create User"
4. Share credentials with user
```

### Changing Role
```
1. Click edit icon (✏️)
2. Select new role
3. Click "Save Changes"
```

### Searching
```
Type in search box:
- Name, email, or role
- Results filter automatically
```

### Refreshing
```
Click "Refresh" button
- Reloads from Firebase
- Shows latest data
```

---

**User management made simple!** 👥✨

