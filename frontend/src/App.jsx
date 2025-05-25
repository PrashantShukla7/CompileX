```typescript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CodeEditor from './components/CodeEditor/CodeEditor.jsx';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home.jsx';

/**
 * App Component - Defines the main application structure and routing.
 *
 * @returns {JSX.Element} The rendered App component.
 */
const App: React.FC = () => {
  return (
    <div>
      <Routes>
        {/* Route for the home page */}
        <Route path="/" element={<Home />} />

        {/* Route for the code editor with a specific ID */}
        <Route path="/editor/:id" element={<CodeEditor />} />

        {/* Route for creating a new code editor instance with a specific ID and reset state */}
        <Route path="/editor/new/:id" element={<CodeEditor reset={true} />} />

        {/* Route for the login page */}
        <Route path="/login" element={<Login />} />

        {/* Route for the registration page */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;
```