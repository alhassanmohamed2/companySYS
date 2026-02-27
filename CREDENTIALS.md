# CompanySYS — Login Credentials

## Demo Accounts

| Role             | Username | Password      | Dashboard URL              |
|------------------|----------|---------------|----------------------------|
| System Admin     | `admin`  | `password123` | http://localhost:5173/     |
| CEO              | `ceo`    | `password123` | http://localhost:5173/     |
| Project Manager  | `pm1`    | `password123` | http://localhost:5173/     |
| Developer        | `dev1`   | `password123` | http://localhost:5173/     |

> All accounts redirect to their role-specific dashboard automatically after login.

## How to Login

1. Go to **http://localhost:5173**
2. Enter the **Username** and **Password** from the table above
3. Click **Sign In**
4. You will be redirected to the dashboard for that role

## Changing Passwords

1. Log in with any account
2. Click **Settings** in the sidebar
3. Enter your current password, new password, and confirm
4. Click **Change Password**

## Creating New Users (Admin Only)

1. Log in as `admin`
2. Click **Users** in the sidebar
3. Click **+ Add User**
4. Fill in username, email, role, and password
5. Click **Create**
