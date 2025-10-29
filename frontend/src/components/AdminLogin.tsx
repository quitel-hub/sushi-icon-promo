import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 1. ИСПРАВЛЕННЫЙ ИНТЕРФЕЙС
// Мы передаем НЕ 'onLogin' (boolean), а 'onLoginSuccess' (token)
// Это то, чего ожидает ваш EnhancedAdminPanel.
interface AdminLoginProps {
  onLoginSuccess: (token: string) => void; 
}

// 2. ИСПРАВЛЕН КОМПОНЕНТ
const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  
  // Это ваше состояние, оно правильное
  const [formData, setFormData] = useState({
    email: 'sushi.master.admin.2024@secure-icon.com', // Оставляем для удобства
    accessCode: 'SUSHI-MASTER-2024-X9K7', // Оставляем для удобства
    password: '' // Пароль должен вводиться
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- 3. ДОБАВЛЕНЫ НОВЫЕ СОСТОЯНИЯ ДЛЯ 2FA ---
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpToken, setTotpToken] = useState('');
  // ------------------------------------------

  // Ваш обработчик, он в порядке
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // --- 4. ПОЛНОСТЬЮ ЗАМЕНЕННЫЙ handleSubmit ---
  // Больше не проверяет пароль здесь, а отправляет на сервер
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Отправляем данные на бэкенд
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Отправляем все 3 поля
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('admin.auth.invalidCredentials'));
      }

      // Вот логика 2FA, которую мы добавили на бэкенд
      if (data.needs2FA) {
        // Пароль верный, НО нужна 2FA
        setNeeds2FA(true);
        setError(t('admin.auth.2faRequired')); // "Требуется 2FA"
      } else if (data.token) {
        // Пароль верный, 2FA не нужна, ВХОД
        onLoginSuccess(data.token); // Передаем ТОКЕН в EnhancedAdminPanel
      } else {
        throw new Error(t('admin.auth.unknownError'));
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('admin.auth.loginError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. ДОБАВЛЕНА НОВАЯ ФУНКЦИЯ handle2FASubmit ---
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Отправляем 6-значный код на эндпоинт 2FA
      const response = await fetch('/api/admin/2fa/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email, // Используем email как 'username'
          token: totpToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('admin.auth.invalid2fa')); // "Неверный код 2FA"
      }

      if (data.token) {
        // 2FA верна! Успешный вход.
        onLoginSuccess(data.token); // Передаем ТОКЕН
      } else {
        throw new Error(t('admin.auth.unknownError'));
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('admin.auth.loginError'));
      }
      setIsLoading(false);
    }
  };
  
  // Ваш 'clearAuth' для отладки, он в порядке
  const clearAuth = () => {
    localStorage.removeItem('adminToken'); // Меняем на 'adminToken'
    console.log('Auth cleared');
  };

  // --- 6. ИСПРАВЛЕННЫЙ JSX ---
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5' // Ваши стили
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 10px 0' }}>
            {/* Меняем заголовок в зависимости от шага */}
            {needs2FA ? t('admin.auth.2faTitle') : t('admin.auth.loginTitle')}
          </h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            {needs2FA ? t('admin.auth.2faSubtitle') : t('admin.auth.loginSubtitle')}
          </p>
        </div>

        {/* --- ПОКАЗЫВАЕМ, ЕСЛИ 2FA НЕ НУЖНА --- */}
        {!needs2FA && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Поле Email (Ваши стили) */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#333', fontSize: '14px', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Введите email"
                required
                autoComplete="email"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
            
            {/* Поле Код Доступа (Ваши стили) */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#333', fontSize: '14px', marginBottom: '8px' }}>
                Код доступа
              </label>
              <input
                type="text"
                name="accessCode"
                value={formData.accessCode}
                onChange={handleInputChange}
                placeholder="Введите код доступа"
                required
                autoComplete="off"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Поле Пароль (Ваши стили) */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#333', fontSize: '14px', marginBottom: '8px' }}>
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Введите пароль"
                required
                autoComplete="current-password"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Кнопка "Войти" */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? t('admin.auth.loading') : t('admin.auth.loginButton')}
            </button>
          </form>
        )}

        {/* --- ПОКАЗЫВАЕМ, ЕСЛИ 2FA НУЖНА --- */}
        {needs2FA && (
          <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Поле 2FA Кода */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#333', fontSize: '14px', marginBottom: '8px' }}>
                {t('admin.auth.2faCodeLabel')}
              </label>
              <input
                type="text"
                name="totpToken"
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value)}
                placeholder="123456"
                required
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.5em' }}
              />
            </div>
            
            {/* Кнопка "Подтвердить" */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? t('admin.auth.verifying') : t('admin.auth.verifyButton')}
            </button>
          </form>
        )}

        {/* --- Общий блок ошибок (Ваши стили) --- */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            fontSize: '14px',
            marginTop: '20px' // Добавил отступ
          }}>
            {error}
          </div>
        )}
        
        {/* Блок отладки (Ваши стили) */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
          <button 
            type="button" 
            onClick={clearAuth}
            style={{ padding: '5px 10px', fontSize: '12px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            {t('admin.auth.clearDebug')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;