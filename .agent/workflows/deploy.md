---
description: Deploy changes to production (git add, commit, push). Run this after every completed task.
---

# Deploy Changes

After every completed task, deploy the changes to production:

// turbo-all

1. Stage all changes (excluding build artifacts and caches):
```
git add -A
```

2. Commit with a descriptive message summarizing what was changed:
```
git commit -m "<descriptive message>"
```

3. Push to the remote repository (this triggers Vercel auto-deploy):
```
git push
```

4. Confirm the push was successful and remind the user that Vercel will auto-deploy.
