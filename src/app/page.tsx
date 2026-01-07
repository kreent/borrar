'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn');
    if (logged === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchPokemon() {
      try {
        setLoading(true);
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=60');
        const data = await response.json();

        const details = await Promise.all(
          data.results.map(async (p: { url: string }) => {
            const res = await fetch(p.url);
            const pokeData = await res.json();
            return {
              id: pokeData.id,
              name: pokeData.name,
              image: pokeData.sprites.other['official-artwork'].front_default || pokeData.sprites.front_default,
              types: pokeData.types.map((t: any) => t.type.name),
            };
          })
        );

        setPokemon(details);
        setFilteredPokemon(details);
      } catch (error) {
        console.error('Error fetching pokemon:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemon();
  }, [isLoggedIn]);

  useEffect(() => {
    const filtered = pokemon.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPokemon(filtered);
  }, [search, pokemon]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const getTypeColor = (type: string) => `var(--${type})`;

  if (!isLoggedIn) {
    return (
      <div className="login-overlay">
        <div className="login-card">
          <div className="login-header">
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="*****"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>

      <main className="container">
        <header>
          <h1>Explorer Pokédex</h1>
          <p className="subtitle">Descubre el increíble mundo de los Pokémon</p>
        </header>

        <div className="search-container">
          <input
            type="text"
            placeholder="Busca tu Pokémon..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando Pokémon...</p>
          </div>
        ) : (
          <div className="pokemon-grid">
            {filteredPokemon.map((p, index) => (
              <div
                key={p.id}
                className="pokemon-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="pokemon-id">#{p.id.toString().padStart(3, '0')}</span>
                <div className="card-image-container">
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={150}
                    height={150}
                    className="pokemon-image"
                    unoptimized
                  />
                </div>
                <h2 className="pokemon-name">{p.name}</h2>
                <div className="types-container">
                  {p.types.map((type) => (
                    <span
                      key={type}
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredPokemon.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No se encontraron Pokémon con ese nombre.</p>
          </div>
        )}
      </main>
    </>
  );
}
