import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('skillSyncUser');
      // Safety Check: If saved data exists and is valid JSON, use it.
      return saved ? JSON.parse(saved) : { name: '', dept: '', skills: [], interests: [] };
    } catch (error) {
      // If data is corrupted, ignore it and start fresh (Don't crash!)
      console.error("Failed to load user data:", error);
      return { name: '', dept: '', skills: [], interests: [] };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('skillSyncUser', JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  }, [user]);

  const login = (name, dept) => setUser({ ...user, name, dept });
  
  const addSkill = (skill, proficiency) => {
    setUser(prev => ({ 
      ...prev, 
      skills: [...prev.skills, { name: skill, proficiency }] 
    }));
  };

  const addInterest = (interest) => {
    setUser(prev => ({ 
      ...prev, 
      interests: [...prev.interests, interest] 
    }));
  };

  return (
    <UserContext.Provider value={{ user, login, addSkill, addInterest }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);