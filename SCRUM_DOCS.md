# Team Working Agreements

- Be on time for all scheduled meetings and check-ins.  
- Communicate blockers or delays early.  
- Offer help when teammates are stuck.  
- Use Discord for quick questions; prefer in-person or video calls for complex issues.  
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
