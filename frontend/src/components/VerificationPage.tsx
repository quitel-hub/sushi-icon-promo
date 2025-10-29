// Содержимое для frontend/src/components/VerificationPage.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface VerificationPageProps {
  customerId: string;
}

export function VerificationPage({ customerId }: VerificationPageProps) {
  const { t } = useTranslation();
  const [phoneCode, setPhoneCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    phoneSent: false,
    emailSent: false,
    phoneVerified: false,
    emailVerified: false,
    isFullyVerified: false,
    discountCode: null as string | null,
  });

  // Функция для запроса кода
  const handleSendCode = async (type: 'phone' | 'email') => {
    setError('');
    setMessage(`Отправка кода на ${type}...`);
    setIsLoading(true);
    try {
      const response = await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, type }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Ошибка отправки кода на ${type}`);
      
      setMessage(result.message);
      setVerificationStatus(prev => ({ ...prev, [`${type}Sent`]: true }));

    } catch (err: any) {
      setError(err.message);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };
  
   // Функция для подтверждения кода
  const handleConfirmCode = async (type: 'phone' | 'email') => {
      setError('');
      setMessage(`Проверка кода для ${type}...`);
      setIsLoading(true);
      const code = type === 'phone' ? phoneCode : emailCode;

      if (code.length !== 4) {
          setError('Код должен состоять из 4 цифр.');
          setIsLoading(false);
          return;
      }

      try {
          const response = await fetch('/api/verify/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customerId, type, code }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || `Ошибка подтверждения ${type}`);

          setMessage(result.message);
          setVerificationStatus(prev => ({
              ...prev,
              phoneVerified: result.isPhoneVerified,
              emailVerified: result.isEmailVerified,
              isFullyVerified: result.isFullyVerified,
              discountCode: result.discountCode || prev.discountCode,
          }));
          
          // Очищаем поле ввода
          if (type === 'phone') setPhoneCode('');
          else setEmailCode('');

      } catch (err: any) {
          setError(err.message);
          setMessage('');
      } finally {
          setIsLoading(false);
      }
  };

  // Запрашиваем коды при первой загрузке (опционально)
  useEffect(() => {
    handleSendCode('phone');
    // Можно добавить задержку перед запросом email-кода, если нужно
    setTimeout(() => handleSendCode('email'), 1000); 
  }, [customerId]); // Зависимость от customerId

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gray-800 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('verification.title')}</h2>

      {message && <p className="text-green-400 mb-4">{message}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Верификация Телефона */}
      <div className="mb-6 p-4 border border-gray-600 rounded">
        <h3 className="font-semibold mb-2">{t('verification.phoneTitle')} {verificationStatus.phoneVerified && '✅'}</h3>
        {!verificationStatus.phoneVerified ? (
          <>
            <p className="text-sm text-gray-400 mb-2">{t('verification.phonePrompt')}</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 4))} // Только цифры, макс 4
                placeholder="1234"
                maxLength={4}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={() => handleConfirmCode('phone')}
                disabled={isLoading || phoneCode.length !== 4}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {t('verification.confirmButton')}
              </button>
            </div>
            {!verificationStatus.phoneSent && (
                 <button 
                    onClick={() => handleSendCode('phone')} 
                    disabled={isLoading} 
                    className="text-xs text-blue-400 hover:underline mt-2 disabled:opacity-50"
                 >
                     {t('verification.resendCode')}
                 </button>
            )}
          </>
        ) : (
          <p className="text-green-500">{t('verification.verified')}</p>
        )}
      </div>

      {/* Верификация Email */}
      <div className="mb-6 p-4 border border-gray-600 rounded">
         <h3 className="font-semibold mb-2">{t('verification.emailTitle')} {verificationStatus.emailVerified && '✅'}</h3>
        {!verificationStatus.emailVerified ? (
          <>
            <p className="text-sm text-gray-400 mb-2">{t('verification.emailPrompt')}</p>
             <div className="flex items-center space-x-2">
              <input
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="5678"
                 maxLength={4}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                 disabled={isLoading}
              />
              <button
                onClick={() => handleConfirmCode('email')}
                disabled={isLoading || emailCode.length !== 4}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {t('verification.confirmButton')}
               </button>
            </div>
             {!verificationStatus.emailSent && (
                 <button 
                    onClick={() => handleSendCode('email')} 
                    disabled={isLoading} 
                    className="text-xs text-blue-400 hover:underline mt-2 disabled:opacity-50"
                 >
                     {t('verification.resendCode')}
                 </button>
             )}
          </>
         ) : (
           <p className="text-green-500">{t('verification.verified')}</p>
         )}
      </div>
      
      {/* Отображение промокода после полной верификации */}
      {verificationStatus.isFullyVerified && verificationStatus.discountCode && (
          <div className="mt-8 p-4 bg-green-900 border border-green-700 rounded text-center">
              <p className="text-lg font-semibold">{t('success.verificationComplete')}</p>
              <p className="mt-2">{t('yourDiscountCode')}: <strong className="text-xl">{verificationStatus.discountCode}</strong></p>
          </div>
      )}
    </div>
  );
}