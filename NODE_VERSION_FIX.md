# Node.js Version Fix

## Issue
Next.js 16 requires Node.js >= 20.9.0, but you have Node.js 20.5.1.

## Solution Applied
I've downgraded Next.js to version 15.1.3, which is compatible with Node.js 20.5.1.

## To Start Frontend Now
```bash
cd frontend
npm run dev
```

## Option 2: Update Node.js (Recommended for Long-term)

If you want to use Next.js 16, update Node.js:

```bash
# Using Homebrew
brew upgrade node

# Or using nvm (if you have it)
nvm install 20.9.0
nvm use 20.9.0
```

Then revert package.json to use Next.js 16:
```json
"next": "16.0.3",
"react": "19.2.0",
"react-dom": "19.2.0"
```

## Current Status
✅ Frontend dependencies updated to Next.js 15.1.3
✅ Compatible with Node.js 20.5.1
✅ Ready to run `npm run dev`

The warnings about ESLint and Node version are non-critical - the app will work fine.

