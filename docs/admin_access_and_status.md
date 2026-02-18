# Thaqib Platform Status & Admin Access

## Admin Access
To access the admin features of the platform, a user functionality must have the `admin` role.

### How to Access
1.  **Log in** to the platform.
2.  If your user account has the `admin` role, you will see an "Admin" link or dashboard options in the navigation.
3.  Access restricted routes like `/admin/users`, `/admin/projects` are protected by middleware.

### Creating an Admin User
Currently, users register as `client` or `analyst`. To create an admin:
1.  Register a new user normally.
2.  Access the database directly (or use a seed script) to update the `role` column of that user to `'admin'` in the `users` table.
    ```sql
    UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
    ```

---

## Feature Implementation Status

### Identity & Access
- [x] **Register / Login**: Implemented.
- [x] **Role Access**: Implemented (Clients, Analysts, Admins).

### Client Features
- [x] **Create Project**: Implemented (Title, description, budget, deadline).
- [x] **Upload Datasets**: Implemented.
- [x] **Reuse Datasets**: Implemented. "Import from Library" tab allows cloning existing datasets to new projects.
- [x] **Delete Datasets**: Implemented.
- [x] **Receive Applications**: Implemented.
- [x] **Edit Project**: Implemented. Clients can update title and description via the project details page.
- [x] **Accept/Reject Application**: Implemented.
- [x] **Chat with Analysts**: Implemented (Conversations/Messages).
- [x] **View Dashboards**: Implemented.
- [x] **Rate Analyst**: Implemented. Clients can complete a project and submit a 1-5 star rating and comment.
- [ ] **Chat with Admin**: **Missing**. Need a dedicated "Support" channel creation flow.

### Analyst Features
- [x] **Public Profile**: Implemented (Bio, skills).
- [x] **Upload Datasets**: Implemented.
- [x] **Browse Projects**: Implemented.
- [x] **Apply to Projects**: Implemented.
- [x] **View Assigned Projects**: Implemented.
- [x] **Edit One Project**: Implemented (UI focus).
- [x] **Create/Organize Dashboards**: Implemented.
- [x] **Visual Builder / SQL**: Implemented.
- [x] **Text Blocks in Dashboards**: Implemented. Added "Text" widget type in Visualization Builder.
- [ ] **Lose Access**: Logic needs verification (middleware check for project status).
- [x] **Stats (Completed, Money, Clients)**: Implemented. Analyst dashboard now shows earnings, completed projects count, and average rating.

## Next Steps
See `implementation_plan.md` for historical roadmap. Most critical features are now implemented.

## Test Scenarios

### 1. Dataset Library & Reuse
**Objective**: Verify a client can reuse an upload across projects.
1.  **Log in as Client**.
2.  **Create Project A**.
3.  **Upload Dataset**: `sales_data_2024.csv` to Project A.
4.  **Create Project B**.
5.  **Go to "Upload Dataset"** for Project B.
6.  **Select "Import from Library"** tab.
7.  **Find `sales_data_2024.csv`** in the list and click **Import**.
8.  **Verify**: The dataset now appears in Project B's dataset list.

### 2. Complete Project & Rate Analyst
**Objective**: Verify the project lifecyle closure and rating system.
1.  **Log in as Admin** (or use DB) to ensure a project is in `in_progress` state with an assigned Analyst.
2.  **Log in as Client** (project owner).
3.  **Navigate to Project Details**.
4.  **Click "Complete Project"** button (green checkmark).
5.  **Rating Dialog**: Select 5 stars, enter comment "Great work!", and submit.
6.  **Verify**:
    *   Project status updates to `Completed`.
    *   "Complete Project" button disappears.
    *   (Optional) Check `ratings` table in DB for the new entry.

### 3. Analyst Dashboard Stats
**Objective**: Verify the analyst sees their performance metrics.
1.  **Log in as Analyst** who has completed at least one project (from Scenario 2).
2.  **View Dashboard**.
3.  **Verify Cards**:
    *   **Earnings**: Should reflect the sum of budgets of completed projects.
    *   **Client Rating**: Should show the average rating (e.g., 5.0).
    *   **Total Clients**: Should show count of unique clients.

### 4. Text Block in Dashboard
**Objective**: Verify adding static text to a dashboard.
1.  **Log in as Analyst**.
2.  **Go to "New Visualization"**.
3.  **Select Project** and **Dashboard**.
4.  **Click "Text" Tab** (next to Visual/SQL).
5.  **Enter Content**: "## Executive Summary\nSales are up 20%."
6.  **Click "Preview"**. Verify text renders.
7.  **Click "Save"**.
8.  **Go to Dashboard View**: Verify the text block appears as a widget.
