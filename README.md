# 📝 Todo App Frontend – React + Vite + TailwindCSS + Shadcn UI

This is the **frontend** for a full-stack Todo application, built with:

- **Framework**: React + Vite
- **Styling**: TailwindCSS
- **UI Components**: Shadcn UI
- **GraphQL Client**: Apollo Client
- **API Communication**: Connects to a FastAPI + Strawberry GraphQL backend

---

## 🚀 Getting Started (Windows/Mac/Linux)

Follow these steps to run the frontend locally.

---

### 1️⃣ Install Dependencies

```bash
# Navigate into the frontend folder
cd path/to/frontend

# Install packages
npm install --force

# Configure API Endpoint
Make sure your frontend is correctly pointing to your backend GraphQL server.

If needed, update the API URL inside your frontend source code (usually in an Apollo Client setup file) to:
http://localhost:8000/graphql
Or the deployed backend URL once live.

# Start the Development Server
npm run dev

➡️ App will be available at: http://localhost:5173
