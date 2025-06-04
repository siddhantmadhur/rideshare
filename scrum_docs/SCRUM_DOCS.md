# Sprint Plan (Spreadsheet)
[Sprint Plan SpreadSheet
](https://docs.google.com/spreadsheets/d/1tmSRyWA6JefFeFS_9EEcLunIjvr7DFBf1u24YFj8k5M/edit?gid=1311804720#gid=1311804720)

# Sprint Report (Spreadsheet)
[Sprint Report SpreadSheet](https://docs.google.com/spreadsheets/d/1tmSRyWA6JefFeFS_9EEcLunIjvr7DFBf1u24YFj8k5M/edit?gid=1149744209#gid=1149744209)

# Initial Burn Up Chart
<img width="401" alt="Screenshot 2025-06-03 at 6 49 22 PM" src="https://github.com/user-attachments/assets/4067c246-46d1-46cb-ae81-b5287564da2c" />


# Initial Scrum Board
<img width="810" alt="image" src="https://github.com/user-attachments/assets/d6ed01f7-f108-42e2-9e5c-ed0ec260fb8c" />

# Team Working Agreements

- Be on time for all scheduled meetings and check-ins.  
- Communicate blockers or delays early.  
- Offer help when teammates are stuck.  
- Use Discord for qui
- ck questions; prefer in-person or video calls for complex issues.  
- No spamming — keep messages relevant and concise.  
- Commit changes to your own branch and regularly push progress.
- Keep issues and tasks updated.  

---

# Definition of Done

## MVP Mindset
- Focus on a functional MVP to avoid wasting effort on code that may be scrapped later.

### Backend
- All route functionality implemented and tested with sample data.  
- Routes return appropriate status codes and responses.  
- Structs contain no unused fields.  
- All inputs are validated; invalid or malformed data is rejected.  
- Only authenticated users can make API calls (auth middleware active).  
- Code is pushed and reviewed before merge.  

### Frontend
- Feature is accessible and functions on mobile.  
- No crashes or obvious bugs during normal usage.  
- Components connect correctly with backend APIs.  
- Styling is minimal but not broken (MVP-level acceptable).  
- Linked from the correct page/navigation flow.  

---

# Style Guides

### JavaScript/React (Frontend)
- Use Prettier and ESLint.
- Consistent 2-space indentation.
- Use `camelCase` for variables/functions, `PascalCase` for components.
- One component per file.
- Handle all errors explicitly and return informative error messages.


### Go (Backend)
- Use `go fmt` for consistent formatting.
- Use `camelCase` for variables and functions, `PascalCase` for exported names.
- Avoid global state; encapsulate logic within packages.
- Organize code into clear packages under `internal/` (e.g., `auth`, `rides`, `server`, `storage`).
