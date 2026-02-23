'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  nome: string;
  email?: string;
  role: string;
  perfilAluno?: {
    id: string;
    numero?: string;
    nomeDeGuerra?: string;
    cargo?: {
      id: string;
      nome: string;
    };
    companhia?: {
      id: string;
      nome: string;
    };
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isAluno = user?.role === 'ALUNO';

  return {
    user,
    loading,
    isAdmin,
    isAluno,
    isAuthenticated: !!user,
  };
}