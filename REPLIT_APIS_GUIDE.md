# Replit Developer APIs Guide

## 🚀 Replit Platform APIs

Replit offers **13+ APIs** for building powerful apps directly on their platform. Here's your complete guide!

---

## 📋 **Available Replit APIs**

### **1. 🔐 Auth API**
**Purpose**: Authenticate users securely in your Replit apps

**Key Methods:**
- `getAuthToken()` - Get current user's auth token
- `verifyAuthToken()` - Verify JWT tokens
- `authenticate()` - Trigger user authentication

**Use Cases:**
- User login/signup
- Session management
- Secure API calls

**Documentation**: https://docs.replit.com/extensions/api/auth

---

### **2. 📊 Data API (GraphQL)**
**Purpose**: Retrieve user info and Replit metadata

**Key Methods:**
- `currentUser` - Get current logged-in user
- `userById(id)` - Get user by ID
- `userByUsername(username)` - Get user by username
- `currentRepl` - Get current Repl metadata
- `replById(id)` - Get Repl by ID
- `replByUrl(url)` - Get Repl by URL

**Use Cases:**
- User profiles
- App metadata
- Social features

**Documentation**: https://docs.replit.com/extensions/api/data

---

### **3. 📁 Filesystem API**
**Purpose**: Create, read, modify, and watch files

**Key Methods:**
- `readFile(path)` - Read file contents
- `writeFile(path, content)` - Write to file
- `readdir(path)` - List directory contents
- `watchFile(path, callback)` - Watch for file changes
- `createDir(path)` - Create directory

**Use Cases:**
- Code editors
- File managers
- Auto-save features

**Documentation**: https://docs.replit.com/extensions/api/fs

---

### **4. ⚡ Exec API**
**Purpose**: Run shell commands and spawn processes

**Key Methods:**
- `exec(command)` - Execute shell command
- `spawn(command, args)` - Spawn process
- `kill(pid)` - Kill running process

**Use Cases:**
- Build systems
- Terminal emulators
- Package installation

**Documentation**: https://docs.replit.com/extensions/api/exec

---

### **5. ✏️ Editor API**
**Purpose**: Access and manage editor preferences

**Key Methods:**
- `getFontSize()` - Get editor font size
- `setFontSize(size)` - Set font size
- `getTheme()` - Get current theme
- `setTheme(theme)` - Change theme

**Use Cases:**
- Code editors
- User preferences
- Custom themes

**Documentation**: https://docs.replit.com/extensions/api/editor

---

### **6. 💾 ReplDB API**
**Purpose**: Key-value store for persisting data

**Key Methods:**
- `get(key)` - Retrieve value
- `set(key, value)` - Store value
- `delete(key)` - Delete key
- `list(prefix)` - List keys with prefix

**Use Cases:**
- User settings
- App state
- Cache storage

**Documentation**: https://docs.replit.com/extensions/api/replDb

---

### **7. 📢 Messages API**
**Purpose**: Display toast notifications

**Key Methods:**
- `showInfo(message)` - Show info toast
- `showWarning(message)` - Show warning toast
- `showError(message)` - Show error toast
- `showSuccess(message)` - Show success toast

**Use Cases:**
- User feedback
- Error notifications
- Success messages

**Documentation**: https://docs.replit.com/extensions/api/messages

---

### **8. 🎨 Themes API**
**Purpose**: Access theme data and color tokens

**Key Methods:**
- `getTheme()` - Get current theme
- `getColorToken(name)` - Get color value
- `onThemeChange(callback)` - Listen for theme changes

**Use Cases:**
- Custom UI themes
- Dark/light mode
- Brand colors

**Documentation**: https://docs.replit.com/extensions/api/themes

---

### **9. 🎮 Commands API**
**Purpose**: Register custom commands for command bar

**Key Methods:**
- `registerCommand(name, handler)` - Add command
- `unregisterCommand(name)` - Remove command

**Use Cases:**
- Custom shortcuts
- Quick actions
- Productivity tools

**Documentation**: https://docs.replit.com/extensions/api/commands

---

### **10. 🐛 Debug API**
**Purpose**: Log data, warnings, and errors

**Key Methods:**
- `log(message)` - Log info
- `warn(message)` - Log warning
- `error(message)` - Log error

**Use Cases:**
- Development debugging
- Error tracking
- Performance monitoring

**Documentation**: https://docs.replit.com/extensions/api/debug

---

### **11. 🔌 Init API**
**Purpose**: Initialize Replit extension

**Key Methods:**
- `init(config)` - Initialize extension
- `handshake()` - Establish connection
- `addEventListener(event, handler)` - Add listener

**Use Cases:**
- Extension setup
- App initialization
- Event handling

**Documentation**: https://docs.replit.com/extensions/api/init

---

### **12. 👤 Me API**
**Purpose**: Access current extension context

**Key Methods:**
- `getFilePath()` - Get current file path
- `getContext()` - Get extension context

**Use Cases:**
- File handlers
- Context-aware features
- Custom tools

**Documentation**: https://docs.replit.com/extensions/api/me

---

### **13. 📝 Session API**
**Purpose**: Manage coding session

**Key Methods:**
- `getActiveFile()` - Get current file
- `onFileChange(callback)` - Listen for file changes
- `getOpenFiles()` - Get all open files

**Use Cases:**
- Auto-save
- File tracking
- Session recovery

**Documentation**: https://docs.replit.com/extensions/api/session

---

## 🔧 **How to Use Replit APIs**

### **Step 1: Install Replit Client**

```bash
npm install @replit/extensions
```

### **Step 2: Import APIs**

```typescript
import { init, auth, data, fs } from '@replit/extensions';
```

### **Step 3: Initialize**

```typescript
await init();
```

### **Step 4: Use APIs**

```typescript
// Get current user
const user = await data.currentUser();

// Read a file
const content = await fs.readFile('index.js');

// Execute command
const result = await exec.exec('npm install');

// Get auth token
const token = await auth.getAuthToken();
```

---

## 📦 **Example: Full Integration**

```typescript
import { 
  init, 
  auth, 
  data, 
  fs, 
  messages 
} from '@replit/extensions';

async function myReplitApp() {
  // Initialize
  await init();
  
  // Get current user
  const user = await data.currentUser();
  messages.showSuccess(`Welcome, ${user.username}!`);
  
  // Read project files
  const files = await fs.readdir('.');
  console.log('Project files:', files);
  
  // Get auth token
  const token = await auth.getAuthToken();
  
  // Use token for API calls
  const response = await fetch('/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

---

## 🌐 **GraphQL API Examples**

### **Query Current User**

```graphql
query {
  currentUser {
    id
    username
    firstName
    lastName
    bio
    profileImage {
      url
    }
  }
}
```

### **Query Repl by ID**

```graphql
query {
  replById(id: "repl-id-here") {
    id
    title
    description
    language
    url
  }
}
```

### **Query User by Username**

```graphql
query {
  userByUsername(username: "johndoe") {
    id
    username
    repls {
      items {
        id
        title
        url
      }
    }
  }
}
```

---

## 🎯 **Common Use Cases**

### **1. User Authentication**

```typescript
import { auth, data } from '@replit/extensions';

async function login() {
  const token = await auth.getAuthToken();
  const user = await data.currentUser();
  
  return {
    token,
    user
  };
}
```

### **2. File Management**

```typescript
import { fs } from '@replit/extensions';

async function saveFile(path: string, content: string) {
  await fs.writeFile(path, content);
  await messages.showSuccess('File saved!');
}
```

### **3. Run Commands**

```typescript
import { exec } from '@replit/extensions';

async function installPackage(pkg: string) {
  const result = await exec.exec(`npm install ${pkg}`);
  console.log(result);
}
```

### **4. Show Notifications**

```typescript
import { messages } from '@replit/extensions';

messages.showInfo('Processing...');
messages.showSuccess('Done!');
messages.showError('Failed!');
messages.showWarning('Warning!');
```

---

## 📚 **Additional Resources**

### **Official Documentation**
- Main Docs: https://docs.replit.com
- Extensions API: https://docs.replit.com/extensions/api
- GraphQL API: https://docs.replit.com/extensions/api/data

### **Quickstart Guides**
- FastAPI Service: https://docs.replit.com/quickstart/fastapi
- Google Sheets Integration: https://docs.replit.com/quickstart/google-sheets
- Discord Bot: https://docs.replit.com/quickstart/discord-bot

### **Authentication Guides**
- Replit Auth: https://docs.replit.com/hosting/authenticating-users-replit-auth
- Google OAuth: https://docs.replit.com/tutorials/python/google-authentication

---

## ✅ **Best Practices**

1. **Always initialize first**: Call `init()` before using any API
2. **Handle errors**: Wrap API calls in try-catch blocks
3. **Use TypeScript**: Get type safety and autocomplete
4. **Check permissions**: Some APIs require user consent
5. **Rate limiting**: Be mindful of API rate limits
6. **Cache data**: Don't fetch the same data repeatedly

---

## 🚀 **Next Steps**

1. **Install the SDK**: `npm install @replit/extensions`
2. **Read the docs**: Visit https://docs.replit.com/extensions/api
3. **Try examples**: Test each API in a new Repl
4. **Build something**: Create your first Replit extension!

---

*Last updated: October 27, 2025*
