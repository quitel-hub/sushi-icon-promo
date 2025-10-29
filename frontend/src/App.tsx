// import React, { useState, useCallback, useEffect, useMemo, useRef, type FormEvent } from "react";
// import { useTranslation } from "react-i18next";

// import "./App.css";
// import "./i18n/config";
// import { ParticleTextEffect } from "./components/ParticleTextEffect";
// import { LanguageSwitcher } from "./components/LanguageSwitcher";
// import SimpleCountrySelector from "./components/SimpleCountrySelector";
// import SimplePhoneInput from "./components/SimplePhoneInput";
// import DatePicker from "./components/DatePicker";
// import { InteractiveHoverButton } from "./components/ui/interactive-hover-button";
// import ThankYouPage from "./components/ThankYouPage";
// // import UnifiedAdminPanel from "./components/UnifiedAdminPanel";
// type Submission = {
//   id: string | number;
//   name: string;
//   phone: string;
//   email: string;
//   country: string;
//   city: string;
//   street?: string;
//   postalCode?: string;
//   birthDate: string;
//   preferences: string;
//   feedback: string;
//   promoCode: string;
//   registrationDate: string;
//   status: string;
// };
// import NetherlandsAddressInput from "./components/NetherlandsAddressInput";
// import AccessDenied from "./components/AccessDenied";

// type RegistrationFormState = {
//   firstName: string;
//   lastName: string;
//   country: string;
//   phoneNumber: string;
//   email: string;
//   birthDate: string;
//   city: string;
//   street: string;
//   postalCode: string;
//   houseNumber: string;
//   preferredFood: string;
//   feedback: string;
//   discountCode: string;
// };

// type StatusState = {
//   type: "success" | "error";
//   message: string;
//   details?: string;
// };

// const defaultFormState: RegistrationFormState = {
//   firstName: "",
//   lastName: "",
//   country: "",
//   phoneNumber: "",
//   email: "",
//   birthDate: "",
//   city: "",
//   street: "",
//   postalCode: "",
//   houseNumber: "",
//   preferredFood: "",
//   feedback: "",
//   discountCode: "",
// };

// export default function App() {
//   const { t } = useTranslation();
//   const [formState, setFormState] = useState<RegistrationFormState>(defaultFormState);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [status, setStatus] = useState<StatusState | null>(null);
//   const [showThankYou, setShowThankYou] = useState(false);
//   const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
//   const [showAdminLogin, setShowAdminLogin] = useState(false);
//   const [showAdminPanel, setShowAdminPanel] = useState(false);
//   const [adminFormData, setAdminFormData] = useState({
//     email: '',
//     accessCode: '',
//     password: ''
//   });
//   const [adminError, setAdminError] = useState('');
//   const [isAdminLoading, setIsAdminLoading] = useState(false);
//   const [showAccessDenied, setShowAccessDenied] = useState(false);
  
//   // Состояние для панели управления
//   const [activeSection, setActiveSection] = useState<string>('');
//   // const [showQuickAccess, setShowQuickAccess] = useState(false);
//   // const [showAdditionalTools, setShowAdditionalTools] = useState(false);
  
//   // Состояние для синхронизации с анкетой
//   const [formSubmissions, setFormSubmissions] = useState<Submission[]>([]);
//   const selectedCategory = 'Все категории';
//   const [exportData, setExportData] = useState<Submission[]>([]);
//   const dataTableRef = useRef<HTMLDivElement | null>(null);
  
//   // Состояние для автосохранения черновиков
//   const [draftId, setDraftId] = useState<string | null>(null);
  
//   // Состояние для валидации адреса
//   const [addressValidation, setAddressValidation] = useState({
//     isValid: false,
//     errors: [] as string[]
//   });

//   // Ошибки полей формы
//   const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegistrationFormState, string>>>({});

//   const lettersOnlyRegex = useMemo(() => /^[\p{L}]+(?:[-\s'][\p{L}]+)*$/u, []);
//   const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, []);

//   const generateLocalDiscountCode = () => {
//     const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
//     let code = "";
//     for (let i = 0; i < 8; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
//     return code;
//   };

//   const validateForm = useCallback(() => {
//     const errors: Partial<Record<keyof RegistrationFormState, string>> = {};

//     if (!formState.firstName || !lettersOnlyRegex.test(formState.firstName.trim())) {
//       errors.firstName = !formState.firstName ? t('registration.validation.firstName.required') : t('registration.validation.firstName.lettersOnly');
//     }
//     if (!formState.lastName || !lettersOnlyRegex.test(formState.lastName.trim())) {
//       errors.lastName = !formState.lastName ? t('registration.validation.lastName.required') : t('registration.validation.lastName.lettersOnly');
//     }
//     if (!formState.country) {
//       errors.country = t('registration.validation.country.required');
//     }
//     // Phone: basic length check based on digits
//     const phoneDigits = (formState.phoneNumber || '').replace(/\D/g, '');
//     if (!phoneDigits || phoneDigits.length < 7 || phoneDigits.length > 15) {
//       errors.phoneNumber = t('registration.validation.phone.length');
//     }
//     if (!formState.email || !emailRegex.test(formState.email)) {
//       errors.email = t('registration.validation.email.invalid');
//     }

//     // Address validation comes from child component
//     if (!addressValidation.isValid) {
//       // Помечаем поля адреса как ошибочные, чтобы подсветить блок адреса
//       if (!formState.postalCode) errors.postalCode = t('registration.validation.postalCode.format');
//       if (!formState.street) errors.street = t('registration.validation.street.required');
//       if (!formState.city) errors.city = t('registration.validation.city.required');
//       if (!formState.houseNumber) errors.houseNumber = t('registration.validation.houseNumber.required');
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   }, [formState, addressValidation.isValid, t, lettersOnlyRegex, emailRegex]);

//   const handleInputChange = useCallback((field: keyof RegistrationFormState, value: string) => {
//     setFormState(prev => ({ ...prev, [field]: value }));
//   }, []);

//   const handleSubmit = useCallback(async (e: FormEvent) => {
//     e.preventDefault();
//     const ok = validateForm();
//     if (!ok) return;
//     setIsSubmitting(true);
//     setStatus(null);

//     try {
//       const response = await fetch("/api/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formState),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Удаляем черновик после успешной отправки
//         if (draftId) {
//           try {
//             await fetch(`/api/form-draft/${draftId}`, { method: 'DELETE' });
//             setDraftId(null);
//           } catch (error) {
//             console.error('Ошибка удаления черновика:', error);
//           }
//         }

//         setStatus({
//           type: "success",
//           message: t("registration.success.message"),
//           details: data.discountCode ? t("registration.success.discountCode", { code: data.discountCode }) : undefined,
//         });
//         // Показываем ThankYou с промокодом от сервера
//         setShowThankYou(true);
//         setFormState(prev => ({
//           ...defaultFormState,
//           discountCode: data.discountCode || prev.discountCode,
//           firstName: prev.firstName,
//           lastName: prev.lastName,
//           phoneNumber: prev.phoneNumber,
//           email: prev.email,
//         }));
//       } else {
//         // Оффлайн/резервный успех без сетевой ошибки
//         const localCode = generateLocalDiscountCode();
        
//         // Удаляем черновик
//         if (draftId) {
//           try {
//             await fetch(`/api/form-draft/${draftId}`, { method: 'DELETE' });
//             setDraftId(null);
//           } catch (error) {
//             console.error('Ошибка удаления черновика:', error);
//           }
//         }

//         setStatus({
//           type: "success",
//           message: t("registration.success.message"),
//           details: t("registration.success.discountCode", { code: localCode })
//         });
//         setShowThankYou(true);
//         setFormState(prev => ({
//           ...defaultFormState,
//           discountCode: localCode,
//           firstName: prev.firstName,
//           lastName: prev.lastName,
//           phoneNumber: prev.phoneNumber,
//           email: prev.email,
//         }));
//       }
//     } catch {
//       // Оффлайн/резервный успех без показа сетевой ошибки
//       const localCode = generateLocalDiscountCode();
      
//       // Удаляем черновик
//       if (draftId) {
//         try {
//           await fetch(`/api/form-draft/${draftId}`, { method: 'DELETE' });
//           setDraftId(null);
//         } catch (error) {
//           console.error('Ошибка удаления черновика:', error);
//         }
//       }

//       setStatus({
//         type: "success",
//         message: t("registration.success.message"),
//         details: t("registration.success.discountCode", { code: localCode })
//       });
//       setShowThankYou(true);
//       setFormState(prev => ({
//         ...defaultFormState,
//         discountCode: localCode,
//         firstName: prev.firstName,
//         lastName: prev.lastName,
//         phoneNumber: prev.phoneNumber,
//         email: prev.email,
//       }));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [formState, t, validateForm, draftId]);

//   // Учетные данные администратора
//   const ADMIN_CREDENTIALS = {
//     email: 'sushi.master.admin.2024@secure-icon.com',
//     accessCode: 'SUSHI-MASTER-2024-X9K7',
//     password: 'SushiMaster2024!@#$%^&*()_+{}|:<>?[]\\;\',./'
//   };

//   const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setAdminFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (adminError) setAdminError('');
//   };

//   const handleAdminLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsAdminLoading(true);
//     setAdminError('');

//     try {
//       const isValidEmail = adminFormData.email === ADMIN_CREDENTIALS.email;
//       const isValidAccessCode = adminFormData.accessCode === ADMIN_CREDENTIALS.accessCode;
//       const isValidPassword = adminFormData.password === ADMIN_CREDENTIALS.password;

//       if (isValidEmail && isValidAccessCode && isValidPassword) {
//         localStorage.setItem('adminAuthenticated', 'true');
//         localStorage.setItem('adminLoginTime', new Date().toISOString());
//         setIsAdminAuthenticated(true);
//         setShowAdminPanel(true);
//       } else {
//         setShowAccessDenied(true);
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setAdminError('Ошибка входа');
//     } finally {
//       setIsAdminLoading(false);
//     }
//   };

//   const handleAdminLogout = () => {
//     localStorage.removeItem('adminAuthenticated');
//     localStorage.removeItem('adminLoginTime');
//     setIsAdminAuthenticated(false);
//     setShowAdminLogin(false);
//     setShowAdminPanel(false);
//     setAdminFormData({ email: '', accessCode: '', password: '' });
//     setAdminError('');
//   };

//   const handleBackToForm = () => {
//     setShowAdminPanel(false);
//     setShowAdminLogin(false);
//   };

//   // Проверка аутентификации при загрузке
//   useEffect(() => {
//     const checkAuth = () => {
//       const authStatus = localStorage.getItem('adminAuthenticated');
//       const loginTime = localStorage.getItem('adminLoginTime');

//       if (authStatus === 'true' && loginTime) {
//         const loginDate = new Date(loginTime);
//         const now = new Date();
//         const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);

//         // Сессия действительна 24 часа
//         if (hoursDiff < 24) {
//           setIsAdminAuthenticated(true);
//         } else {
//           // Сессия истекла
//           localStorage.removeItem('adminAuthenticated');
//           localStorage.removeItem('adminLoginTime');
//           setIsAdminAuthenticated(false);
//         }
//       } else {
//         setIsAdminAuthenticated(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   // Загружаем данные анкеты при открытии панели администратора
//   useEffect(() => {
//     if (showAdminPanel && isAdminAuthenticated) {
//       (async () => {
//         try {
//           const response = await fetch('/api/submissions');
//           if (response.ok) {
//             const data = await response.json();
//             setFormSubmissions(data);
//             setExportData(data);
//             console.log('Данные анкеты загружены:', data);
//           } else {
//             setFormSubmissions([]);
//             setExportData([]);
//           }
//         } catch (error) {
//           console.error('Ошибка загрузки данных:', error);
//           setFormSubmissions([]);
//           setExportData([]);
//         }
//       })();
//     }
//   }, [showAdminPanel, isAdminAuthenticated]);

//   // Автосинхронизация таблицы при открытой панели администратора
//   useEffect(() => {
//     if (!(showAdminPanel && isAdminAuthenticated)) return;
//     const id = setInterval(async () => {
//       try {
//         const response = await fetch('/api/submissions');
//         if (response.ok) {
//           const data = await response.json();
//           setFormSubmissions(data);
//           setExportData(data);
//         }
//       } catch {
//         // ignore
//       }
//     }, 1000);
//     return () => clearInterval(id);
//   }, [showAdminPanel, isAdminAuthenticated]);

//   // Автосохранение черновика формы каждую секунду
//   useEffect(() => {
//     // Не сохраняем черновик, если форма не заполняется или уже показана страница благодарности
//     if (showThankYou || showAdminLogin || showAdminPanel || showAccessDenied) {
//       return;
//     }

//     // Проверяем, есть ли хоть какие-то данные для сохранения
//     const hasData = formState.firstName || formState.lastName || formState.email || 
//                     formState.phoneNumber || formState.country || formState.city;

//     if (!hasData) {
//       return;
//     }

//     const saveDraft = async () => {
//       try {
//         const response = await fetch('/api/form-draft', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             ...formState,
//             draftId: draftId,
//           }),
//         });

//         if (response.ok) {
//           const data = await response.json();
//           if (!draftId && data.draftId) {
//             setDraftId(data.draftId);
//           }
//         }
//       } catch (error) {
//         console.error('Ошибка автосохранения черновика:', error);
//       }
//     };

//     // Сохраняем сразу при первом заполнении
//     saveDraft();

//     // Затем каждую секунду
//     const intervalId = setInterval(saveDraft, 1000);

//     return () => clearInterval(intervalId);
//   }, [formState, draftId, showThankYou, showAdminLogin, showAdminPanel, showAccessDenied]);

//   // Функции для панели управления

//   const handleViewAllLogs = () => {
//     console.log('Просмотр всех логов');
//     alert('Открыты все логи системы!');
//   };

//   // Панель настроек удалена по требованию

//   // Функции для быстрого доступа
//   const handleMainPage = () => {
//     setShowAdminPanel(false);
//     setShowAdminLogin(false);
//   };

//   const handleUsersPage = () => {
//     setActiveSection('users');
//     setTimeout(() => {
//       dataTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }, 0);
//   };

//   // Функции для дополнительных инструментов
//   const handleTechnicalSupport = () => {
//     console.log('Открыта техническая поддержка...');
//     alert('Открыта техническая поддержка!');
//     setActiveSection('support');
//   };

//   const handleDesignSettings = () => {
//     console.log('Открыты настройки дизайна...');
//     alert('Открыты настройки дизайна!');
//     setActiveSection('design');
//   };

//   const handleSecuritySettings = () => {
//     console.log('Открыты настройки безопасности...');
//     alert('Открыты настройки безопасности!');
//     setActiveSection('security');
//   };

//   const handleMobileSettings = () => {
//     console.log('Открыты настройки мобильной версии...');
//     alert('Открыты настройки мобильной версии!');
//     setActiveSection('mobile');
//   };

//   // Функции для работы с данными анкеты — загрузка выполняется внутри эффектов

//   // Фильтрация и поиск отключены в текущей версии UI

//   // Динамическая статистика по заявкам
//   const now = new Date();
//   const draftsCount = formSubmissions.filter(item => item.isDraft || item.status === 'Заполняется').length;
//   const completedSubmissions = formSubmissions.filter(item => !item.isDraft && item.status !== 'Заполняется');
//   const totalCount = completedSubmissions.length;
//   const todayCount = completedSubmissions.filter(item => {
//     const d = new Date(item.registrationDate);
//     return !isNaN(d.getTime()) && d.toDateString() === now.toDateString();
//   }).length;
//   const countSinceDays = (days: number) => completedSubmissions.filter(item => {
//     const d = new Date(item.registrationDate);
//     if (isNaN(d.getTime())) return false;
//     return (now.getTime() - d.getTime()) <= days * 24 * 60 * 60 * 1000;
//   }).length;
//   const weekCount = countSinceDays(7);
//   const monthCount = countSinceDays(30);
//   const yearCount = countSinceDays(365);

//   if (showThankYou) {
//     return <ThankYouPage customerData={formState} onClose={() => setShowThankYou(false)} />;
//   }

//   if (showAccessDenied) {
//     return <AccessDenied onBack={() => {
//       setShowAccessDenied(false);
//       setShowAdminLogin(false);
//     }} />;
//   }

//   return (
//     <div className="app">
//       <div className="app__content">
//         <header className="app__header">
//           <div className="header__content"></div>
//         </header>
        
//         {/* Кнопка администратора */}
//         <div className="admin-controls">
//           <button 
//             className="admin-toggle-btn"
//             onClick={() => {
//               if (isAdminAuthenticated) {
//                 setShowAdminPanel(!showAdminPanel);
//                 setShowAdminLogin(false);
//               } else {
//                 setShowAdminLogin(!showAdminLogin);
//                 setShowAdminPanel(false);
//               }
//             }}
//             title={isAdminAuthenticated ? "Переключить панель администратора" : "Войти в панель администратора"}
//           >
//             ⚙️
//           </button>
//         </div>
        
//         <LanguageSwitcher />

//         <main className="app__main">
//         <div className="container">
//           {!showAdminLogin && !showAdminPanel && (
//             <div className="header__title">
//               <ParticleTextEffect 
//                 words={["SUSHI ICON"]} 
//                 maxWidth="700px"
//                 minHeight="2px"
//                 className="particle-text-effect"
//               />
//             </div>
//           )}
          
//           {showAdminLogin && !isAdminAuthenticated ? (
//             <section className="card card--admin-login" style={{
//               backgroundColor: '#1a1a1a',
//               border: '2px solid #ffffff',
//               borderRadius: '12px',
//               padding: '30px',
//               boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
//             }}>
//               <h2 className="card__title" style={{ 
//                 color: '#ffffff', 
//                 fontSize: '24px',
//                 fontWeight: '700',
//                 textShadow: '0 2px 4px rgba(0,0,0,0.5)',
//                 marginBottom: '20px'
//               }}>
//                 Вход администратора
//               </h2>
//               <p style={{ 
//                 textAlign: 'center', 
//                 color: '#ffffff', 
//                 marginBottom: '30px',
//                 fontSize: '16px',
//                 textShadow: '0 1px 2px rgba(0,0,0,0.3)'
//               }}>
//                 Введите данные для входа в панель администратора
//               </p>
              
//               <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                 <div>
//                   <label style={{ 
//                     display: 'block', 
//                     fontWeight: '600', 
//                     color: '#ffffff', 
//                     fontSize: '16px',
//                     marginBottom: '8px',
//                     textShadow: '0 1px 2px rgba(0,0,0,0.3)'
//                   }}>
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="Введите email"
//                     value={adminFormData.email}
//                     onChange={handleAdminInputChange}
//                     required
//                     style={{
//                       width: '100%',
//                       padding: '12px',
//                       border: '2px solid #ffffff',
//                       borderRadius: '6px',
//                       fontSize: '16px',
//                       boxSizing: 'border-box',
//                       backgroundColor: '#ffffff',
//                       color: '#000000'
//                     }}
//                   />
//                 </div>
                
//                 <div>
//                   <label style={{ 
//                     display: 'block', 
//                     fontWeight: '600', 
//                     color: '#ffffff', 
//                     fontSize: '16px',
//                     marginBottom: '8px',
//                     textShadow: '0 1px 2px rgba(0,0,0,0.3)'
//                   }}>
//                     Код доступа
//                   </label>
//                   <input
//                     type="text"
//                     name="accessCode"
//                     placeholder="Введите код доступа"
//                     value={adminFormData.accessCode}
//                     onChange={handleAdminInputChange}
//                     required
//                     style={{
//                       width: '100%',
//                       padding: '12px',
//                       border: '2px solid #ffffff',
//                       borderRadius: '6px',
//                       fontSize: '16px',
//                       boxSizing: 'border-box',
//                       backgroundColor: '#ffffff',
//                       color: '#000000'
//                     }}
//                   />
//                 </div>
                
//                 <div>
//                   <label style={{ 
//                     display: 'block', 
//                     fontWeight: '600', 
//                     color: '#ffffff', 
//                     fontSize: '16px',
//                     marginBottom: '8px',
//                     textShadow: '0 1px 2px rgba(0,0,0,0.3)'
//                   }}>
//                     Пароль
//                   </label>
//                   <input
//                     type="password"
//                     name="password"
//                     placeholder="Введите пароль"
//                     value={adminFormData.password}
//                     onChange={handleAdminInputChange}
//                     required
//                     style={{
//                       width: '100%',
//                       padding: '12px',
//                       border: '2px solid #ffffff',
//                       borderRadius: '6px',
//                       fontSize: '16px',
//                       boxSizing: 'border-box',
//                       backgroundColor: '#ffffff',
//                       color: '#000000'
//                     }}
//                   />
//                 </div>
                
//                 {adminError && (
//                   <div style={{
//                     padding: '12px',
//                     backgroundColor: '#dc3545',
//                     border: '2px solid #ffffff',
//                     borderRadius: '6px',
//                     color: '#ffffff',
//                     fontSize: '16px',
//                     textShadow: '0 1px 2px rgba(0,0,0,0.3)',
//                     fontWeight: '600'
//                   }}>
//                     {adminError}
//                   </div>
//                 )}
                
//                 <div style={{
//                   display: 'flex',
//                   gap: '15px',
//                   justifyContent: 'center',
//                   flexWrap: 'wrap'
//                 }}>
//                   <InteractiveHoverButton 
//                     text={isAdminLoading ? 'Вход...' : 'Войти в панель администратора'}
//                     className="button button--primary"
//                     type="submit"
//                     disabled={isAdminLoading}
//                   />
//                   <InteractiveHoverButton 
//                     text="← Назад к форме"
//                     className="button button--secondary"
//                     onClick={() => setShowAdminLogin(false)}
//                   />
//                 </div>
//               </form>
              
//               <div style={{ 
//                 marginTop: '10px', 
//                 textAlign: 'center',
//                 fontSize: '14px',
//                 color: '#ffffff',
//                 textShadow: '0 1px 2px rgba(0,0,0,0.3)',
//                 fontWeight: '500'
//               }}>
//                 Только для авторизованных администраторов
//               </div>
//             </section>
//           ) : (isAdminAuthenticated && (showAdminPanel || showAdminLogin)) ? (
//             <div style={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               width: '100vw',
//               height: '100vh',
//               background: `
//                 radial-gradient(140% 120% at 18% 10%, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0) 74%),
//                 radial-gradient(140% 140% at 82% 12%, rgba(62, 205, 255, 0.3), rgba(62, 205, 255, 0) 68%),
//                 radial-gradient(120% 160% at 48% 92%, rgba(0, 170, 230, 0.2), rgba(0, 170, 230, 0) 74%),
//                 linear-gradient(180deg, rgba(3, 26, 58, 0.98) 0%, rgba(2, 38, 74, 0.95) 20%, rgba(1, 46, 88, 0.92) 40%, rgba(1, 46, 88, 0.95) 70%, rgba(2, 38, 74, 0.98) 85%, rgba(3, 26, 58, 1) 95%, rgba(3, 26, 58, 1) 100%)
//               `,
//               backgroundAttachment: 'fixed',
//               zIndex: 1000,
//               overflow: 'auto',
//               fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
//               padding: '20px',
//               animation: 'none'
//             }}>
//               <style>{`
//                 @keyframes pulse {
//                   0%, 100% {
//                     opacity: 1;
//                     transform: scale(1);
//                   }
//                   50% {
//                     opacity: 0.85;
//                     transform: scale(0.995);
//                   }
//                 }
//               `}</style>
//               <div style={{
//                 maxWidth: '1200px',
//                 margin: '0 auto',
//                 backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                 backdropFilter: 'blur(20px)',
//                 borderRadius: '20px',
//                 padding: '30px',
//                 boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.2)',
//                 border: '1px solid rgba(255, 255, 255, 0.2)'
//               }}>
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   marginBottom: '30px',
//                   paddingBottom: '20px',
//                   borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
//                   background: 'rgba(255, 255, 255, 0.1)',
//                   backdropFilter: 'blur(10px)',
//                   borderRadius: '15px',
//                   padding: '20px',
//                   border: '1px solid rgba(255, 255, 255, 0.2)'
//                 }}>
//                   <h1 style={{ 
//                     margin: 0, 
//                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                     WebkitBackgroundClip: 'text',
//                     WebkitTextFillColor: 'transparent',
//                     fontSize: '32px',
//                     fontWeight: '700',
//                     textShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                   }}>
//                     📊 Панель управления
//                   </h1>
//                   <div style={{ display: 'flex', gap: '15px' }}>
//                     <button 
//                       onClick={handleBackToForm}
//                       style={{
//                         padding: '12px 24px',
//                         background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '25px',
//                         fontSize: '14px',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'all 0.3s ease',
//                         boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
//                         textShadow: '0 1px 2px rgba(0,0,0,0.2)'
//                       }}
//                       onMouseOver={(e) => {
//                         e.currentTarget.style.transform = 'translateY(-2px)';
//                         e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.6)';
//                       }}
//                       onMouseOut={(e) => {
//                         e.currentTarget.style.transform = 'translateY(0)';
//                         e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
//                       }}
//                     >
//                       ← Назад к анкете
//                     </button>
//                     <button 
//                       onClick={handleAdminLogout}
//                       style={{
//                         padding: '12px 24px',
//                         background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '25px',
//                         fontSize: '14px',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'all 0.3s ease',
//                         boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
//                         textShadow: '0 1px 2px rgba(0,0,0,0.2)'
//                       }}
//                       onMouseOver={(e) => {
//                         e.currentTarget.style.transform = 'translateY(-2px)';
//                         e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.6)';
//                       }}
//                       onMouseOut={(e) => {
//                         e.currentTarget.style.transform = 'translateY(0)';
//                         e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
//                       }}
//                     >
//                       🚪 Выйти
//                     </button>
//                   </div>
//                 </div>
                
//                 <div style={{
//                   display: 'grid',
//                   gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//                   gap: '20px',
//                   marginBottom: '30px'
//                 }}>
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(15px)',
//                     padding: '20px',
//                     borderRadius: '15px',
//                     border: '1px solid rgba(255, 255, 255, 0.3)',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                     transition: 'all 0.3s ease'
//                   }}>
//                     <h3 style={{ 
//                       color: '#333', 
//                       margin: '0 0 15px 0',
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       WebkitBackgroundClip: 'text',
//                       WebkitTextFillColor: 'transparent',
//                       fontSize: '18px',
//                       fontWeight: '700',
//                       textShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                     }}>📈 Статистика</h3>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '6px', border: '2px dashed #ffc107' }}>
//                       <span style={{ color: '#856404', fontSize: '14px', fontWeight: '600' }}>🔄 Заполняется сейчас:</span>
//                       <strong style={{ color: '#856404', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.1)', animation: draftsCount > 0 ? 'pulse 2s ease-in-out infinite' : 'none' }}>{draftsCount}</strong>
//                     </div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                       <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>Общее количество:</span>
//                       <strong style={{ color: '#007bff', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{totalCount}</strong>
//                     </div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                       <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>За сегодня:</span>
//                       <strong style={{ color: '#28a745', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{todayCount}</strong>
//                     </div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                       <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>За неделю:</span>
//                       <strong style={{ color: '#17a2b8', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{weekCount}</strong>
//                     </div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
//                       <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>За месяц:</span>
//                       <strong style={{ color: '#6f42c1', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{monthCount}</strong>
//                     </div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                       <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>За год:</span>
//                       <strong style={{ color: '#fd7e14', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{yearCount}</strong>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div ref={dataTableRef} style={{
//                   backgroundColor: '#f8f9fa',
//                   padding: '20px',
//                   borderRadius: '8px',
//                   border: '1px solid #dee2e6',
//                   marginBottom: '20px'
//                 }}>
//                   <style>{`
//                     .table-scroll-container {
//                       overflow-x: auto;
//                       overflow-y: visible;
//                       -webkit-overflow-scrolling: touch;
//                       position: relative;
//                     }
                    
//                     .table-scroll-container::-webkit-scrollbar {
//                       height: 12px;
//                     }
                    
//                     .table-scroll-container::-webkit-scrollbar-track {
//                       background: #f1f1f1;
//                       border-radius: 6px;
//                     }
                    
//                     .table-scroll-container::-webkit-scrollbar-thumb {
//                       background: #888;
//                       border-radius: 6px;
//                     }
                    
//                     .table-scroll-container::-webkit-scrollbar-thumb:hover {
//                       background: #555;
//                     }
//                   `}</style>
//                   <div style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     marginBottom: '15px',
//                     flexWrap: 'wrap',
//                     gap: '10px'
//                   }}>
//                     <div>
//                       <h3 style={{ color: '#495057', margin: 0 }}>📊 Таблица данных (синхронизация в реальном времени)</h3>
//                       <p style={{ color: '#6c757d', fontSize: '13px', margin: '5px 0 0 0', fontStyle: 'italic' }}>
//                         ← → Прокрутите таблицу вправо-влево для просмотра всех столбцов
//                       </p>
//                     </div>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <button style={{
//                         padding: '5px 10px',
//                         backgroundColor: '#007bff',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         fontSize: '12px',
//                         cursor: 'pointer'
//                       }}>
//                         📥 Импорт
//                       </button>
//                       <button style={{
//                         padding: '5px 10px',
//                         backgroundColor: '#28a745',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         fontSize: '12px',
//                         cursor: 'pointer'
//                       }}>
//                         📤 Экспорт
//                       </button>
//                     </div>
//                   </div>
                  
//                   {/* Легенда */}
//                   <div style={{
//                     backgroundColor: 'white',
//                     border: '2px solid #dee2e6',
//                     borderRadius: '8px',
//                     padding: '15px',
//                     marginBottom: '15px',
//                     display: 'flex',
//                     gap: '20px',
//                     flexWrap: 'wrap',
//                     alignItems: 'center'
//                   }}>
//                     <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '14px' }}>Легенда:</div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                       <div style={{ 
//                         width: '20px', 
//                         height: '20px', 
//                         backgroundColor: '#fff3cd', 
//                         border: '2px dashed #ffc107',
//                         borderRadius: '4px'
//                       }}></div>
//                       <span style={{ fontSize: '13px', color: '#856404', fontWeight: '600' }}>
//                         🔄 Заполняется сейчас (обновляется каждую секунду)
//                       </span>
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                       <div style={{ 
//                         width: '20px', 
//                         height: '20px', 
//                         backgroundColor: '#d4edda', 
//                         border: '2px solid #28a745',
//                         borderRadius: '4px'
//                       }}></div>
//                       <span style={{ fontSize: '13px', color: '#155724', fontWeight: '600' }}>
//                         ✅ Завершенная регистрация
//                       </span>
//                     </div>
//                   </div>

//                   <div className="table-scroll-container" style={{
//                     backgroundColor: 'white',
//                     border: '2px solid #dee2e6',
//                     borderRadius: '8px',
//                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//                   }}>
//                     <table style={{
//                       width: '100%',
//                       borderCollapse: 'collapse',
//                       fontSize: '13px',
//                       minWidth: '1800px'
//                     }}>
//                       <thead>
//                         <tr style={{ backgroundColor: '#2c3e50' }}>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>ID</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Имя</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Фамилия</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Телефон</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Email</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Дата рождения</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Страна</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Город</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Улица</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Дом</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Индекс</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Предпочтения</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>🎟️ Промокод</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Статус</th>
//                           <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #34495e', fontWeight: '700', color: '#ecf0f1', fontSize: '13px', whiteSpace: 'nowrap' }}>Дата регистрации</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {exportData.length === 0 ? (
//                           <tr>
//                             <td style={{ padding: '12px', borderBottom: '1px solid #bdc3c7', color: '#2c3e50', fontWeight: '600', textAlign: 'center', backgroundColor: '#ecf0f1' }} colSpan={15}>
//                               📭 Данные отсутствуют
//                             </td>
//                           </tr>
//                         ) : (
//                           exportData.map((item, index) => {
//                             const isDraft = item.isDraft || item.status === 'Заполняется';
//                             const rowBgColor = isDraft 
//                               ? (index % 2 === 0 ? '#fff8e1' : '#fff3cd') 
//                               : (index % 2 === 0 ? '#f8f9fa' : '#ffffff');
                            
//                             // Разбиваем имя на части
//                             const nameParts = (item.name || '').split(' ');
//                             const firstName = nameParts[0] || '';
//                             const lastName = nameParts.slice(1).join(' ') || '';
                            
//                             return (
//                               <tr 
//                                 key={item.id || index} 
//                                 style={{ 
//                                   backgroundColor: rowBgColor,
//                                   borderLeft: isDraft ? '4px solid #ffc107' : 'none',
//                                   animation: isDraft ? 'pulse 2s ease-in-out infinite' : 'none'
//                                 }}
//                               >
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '12px', whiteSpace: 'nowrap' }}>
//                                   {isDraft ? '🔄 ' : ''}{item.id}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '600', fontSize: '13px' }}>
//                                   {isDraft && '✏️ '}{firstName}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '600', fontSize: '13px' }}>
//                                   {lastName}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px', whiteSpace: 'nowrap' }}>
//                                   {item.phone || '-'}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px' }}>
//                                   {item.email || '-'}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px', whiteSpace: 'nowrap' }}>
//                                   {item.birthDate || '-'}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px' }}>
//                                   {item.country || '-'}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px' }}>
//                                   {item.city || '-'}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px' }}>
//                                   {item.street || '-'}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px', textAlign: 'center' }}>
//                                   {item.houseNumber || '-'}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px', whiteSpace: 'nowrap' }}>
//                                   {item.postalCode || '-'}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '13px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                                   {item.preferences || item.feedback || '-'}
//                                 </td>
//                                 <td style={{ 
//                                   padding: '8px', 
//                                   borderBottom: '1px solid #dee2e6', 
//                                   fontWeight: '700', 
//                                   fontSize: '14px',
//                                   whiteSpace: 'nowrap',
//                                   backgroundColor: isDraft ? '#fff3cd' : '#d4edda',
//                                   color: isDraft ? '#856404' : '#155724'
//                                 }}>
//                                   {item.promoCode || (isDraft ? '⏳ В процессе...' : '-')}
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontWeight: '500', fontSize: '12px' }}>
//                                   <span style={{ 
//                                     padding: '4px 8px', 
//                                     borderRadius: '4px', 
//                                     backgroundColor: isDraft ? '#fff3cd' : (item.status === 'Активный' ? '#d4edda' : '#f8d7da'),
//                                     color: isDraft ? '#856404' : (item.status === 'Активный' ? '#155724' : '#721c24'),
//                                     fontSize: '11px',
//                                     fontWeight: '600',
//                                     border: isDraft ? '2px dashed #ffc107' : 'none',
//                                     whiteSpace: 'nowrap'
//                                   }}>
//                                     {isDraft && '⏳ '}{item.status}
//                                   </span>
//                                 </td>
//                                 <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', color: isDraft ? '#856404' : '#2c3e50', fontWeight: '500', fontSize: '12px', whiteSpace: 'nowrap' }}>
//                                   {new Date(item.registrationDate).toLocaleString('ru-RU', {
//                                     year: 'numeric',
//                                     month: '2-digit',
//                                     day: '2-digit',
//                                     hour: '2-digit',
//                                     minute: '2-digit'
//                                   })}
//                                 </td>
//                               </tr>
//                             );
//                           })
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
                
//                 <div style={{
//                   display: 'grid',
//                   gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//                   gap: '20px'
//                 }}>
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(15px)',
//                     padding: '20px',
//                     borderRadius: '15px',
//                     border: '1px solid rgba(255, 255, 255, 0.3)',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                     transition: 'all 0.3s ease'
//                   }}>
//                     <h4 style={{ color: '#495057', margin: '0 0 15px 0' }}>📈 График активности</h4>
//                     <div style={{
//                       height: '150px',
//                       backgroundColor: 'white',
//                       border: '1px solid #dee2e6',
//                       borderRadius: '5px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       color: '#333', fontWeight: '500'
//                     }}>
//                       📊 График будет здесь
//                     </div>
//                   </div>
                  
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(15px)',
//                     padding: '20px',
//                     borderRadius: '15px',
//                     border: '1px solid rgba(255, 255, 255, 0.3)',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                     transition: 'all 0.3s ease'
//                   }}>
//                     <h4 style={{ color: '#2c3e50', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700' }}>⚡ Быстрый доступ</h4>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                       <button style={{
//                         padding: '12px 16px',
//                         backgroundColor: '#e3f2fd',
//                         border: '2px solid #2196f3',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontSize: '14px',
//                         textAlign: 'left',
//                         transition: 'all 0.3s ease',
//                         color: '#1565c0',
//                         fontWeight: '600'
//                       }}
//                       onMouseOver={(e) => {
//                         const target = e.target as HTMLButtonElement;
//                         target.style.backgroundColor = '#bbdefb';
//                         target.style.transform = 'translateY(-1px)';
//                       }}
//                       onMouseOut={(e) => {
//                         const target = e.target as HTMLButtonElement;
//                         target.style.backgroundColor = '#e3f2fd';
//                         target.style.transform = 'translateY(0)';
//                       }}
//                       onClick={handleMainPage}>
//                         🏠 Главная страница
//                       </button>
//                       <button style={{
//                         padding: '12px 16px',
//                         backgroundColor: '#e8f5e8',
//                         border: '2px solid #4caf50',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         fontSize: '14px',
//                         textAlign: 'left',
//                         transition: 'all 0.3s ease',
//                         color: '#2e7d32',
//                         fontWeight: '600'
//                       }}
//                       onMouseOver={(e) => {
//                         const target = e.target as HTMLButtonElement;
//                         target.style.backgroundColor = '#a5d6a7';
//                         target.style.transform = 'translateY(-1px)';
//                       }}
//                       onMouseOut={(e) => {
//                         const target = e.target as HTMLButtonElement;
//                         target.style.backgroundColor = '#e8f5e8';
//                         target.style.transform = 'translateY(0)';
//                       }}
//                       onClick={handleUsersPage}>
//                         👥 Пользователи
//                       </button>
                      
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Индикатор активной секции */}
//                 {activeSection && (
//                   <div style={{
//                     backgroundColor: '#d4edda',
//                     border: '2px solid #28a745',
//                     borderRadius: '8px',
//                     padding: '15px',
//                     marginBottom: '20px',
//                     textAlign: 'center'
//                   }}>
//                     <h4 style={{ color: '#155724', margin: '0 0 10px 0', fontSize: '16px', fontWeight: '700' }}>
//                       ✅ Активная секция: {activeSection}
//                     </h4>
//                     <p style={{ color: '#155724', margin: '0 0 10px 0', fontSize: '14px' }}>
//                       Секция успешно активирована! Проверьте консоль для подробностей.
//                     </p>
//                     <div style={{ 
//                       display: 'flex', 
//                       justifyContent: 'center', 
//                       gap: '20px', 
//                       marginTop: '10px',
//                       flexWrap: 'wrap'
//                     }}>
//                       <div style={{ 
//                         backgroundColor: '#c3e6cb', 
//                         padding: '8px 12px', 
//                         borderRadius: '6px',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         color: '#155724'
//                       }}>
//                         📊 Всего записей: {formSubmissions.length}
//                       </div>
//                       <div style={{ 
//                         backgroundColor: '#c3e6cb', 
//                         padding: '8px 12px', 
//                         borderRadius: '6px',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         color: '#155724'
//                       }}>
//                         🔍 Показано: {exportData.length}
//                       </div>
//                       <div style={{ 
//                         backgroundColor: '#c3e6cb', 
//                         padding: '8px 12px', 
//                         borderRadius: '6px',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         color: '#155724'
//                       }}>
//                         🎯 Категория: {selectedCategory}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Панель настроек удалена */}

//                 {/* Дополнительные виджеты и секции */}
//                 <div style={{
//                   display: 'grid',
//                   gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//                   gap: '20px',
//                   marginTop: '30px'
//                 }}>
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(15px)',
//                     padding: '20px',
//                     borderRadius: '15px',
//                     border: '1px solid rgba(255, 255, 255, 0.3)',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                     transition: 'all 0.3s ease'
//                   }}>
//                     <h3 style={{ 
//                       color: '#333', 
//                       margin: '0 0 15px 0',
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       WebkitBackgroundClip: 'text',
//                       WebkitTextFillColor: 'transparent',
//                       fontSize: '18px',
//                       fontWeight: '700',
//                       textShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                     }}>👥 Управление пользователями</h3>
//                     <div style={{ marginBottom: '15px' }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Активные пользователи:</span>
//                         <strong style={{ color: '#28a745' }}>0</strong>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Новые за неделю:</span>
//                         <strong style={{ color: '#007bff' }}>0</strong>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Заблокированные:</span>
//                         <strong style={{ color: '#dc3545' }}>0</strong>
//                       </div>
//                     </div>
//                     <div style={{ display: 'flex', gap: '8px' }}>
//                       <button style={{
//                         flex: 1,
//                         padding: '8px',
//                         backgroundColor: '#007bff',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         fontSize: '12px',
//                         cursor: 'pointer'
//                       }}>
//                         👥 Все пользователи
//                       </button>
//                       <button style={{
//                         flex: 1,
//                         padding: '8px',
//                         backgroundColor: '#28a745',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         fontSize: '12px',
//                         cursor: 'pointer'
//                       }}>
//                         ➕ Добавить
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(15px)',
//                     padding: '20px',
//                     borderRadius: '15px',
//                     border: '1px solid rgba(255, 255, 255, 0.3)',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                     transition: 'all 0.3s ease'
//                   }}>
//                     <h3 style={{ 
//                       color: '#333', 
//                       margin: '0 0 15px 0',
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       WebkitBackgroundClip: 'text',
//                       WebkitTextFillColor: 'transparent',
//                       fontSize: '18px',
//                       fontWeight: '700',
//                       textShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                     }}>📊 Аналитика и отчеты</h3>
//                     <div style={{ marginBottom: '15px' }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Просмотры сегодня:</span>
//                         <strong style={{ color: '#17a2b8' }}>0</strong>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Конверсия:</span>
//                         <strong style={{ color: '#ffc107' }}>0%</strong>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Среднее время:</span>
//                         <strong style={{ color: '#6f42c1' }}>0 мин</strong>
//                       </div>
//                     </div>
//                     <div style={{ display: 'flex', gap: '8px' }}>
//                       <button style={{
//                         flex: 1,
//                         padding: '8px',
//                         backgroundColor: '#17a2b8',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         fontSize: '12px',
//                         cursor: 'pointer'
//                       }}>
//                         📈 Отчеты
//                       </button>
//                       <button style={{
//                         flex: 1,
//                         padding: '8px',
//                         backgroundColor: '#6f42c1',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         fontSize: '12px',
//                         cursor: 'pointer'
//                       }}>
//                         📊 Графики
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(15px)',
//                     padding: '20px',
//                     borderRadius: '15px',
//                     border: '1px solid rgba(255, 255, 255, 0.3)',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                     transition: 'all 0.3s ease'
//                   }}>
//                     <h3 style={{ 
//                       color: '#333', 
//                       margin: '0 0 15px 0',
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       WebkitBackgroundClip: 'text',
//                       WebkitTextFillColor: 'transparent',
//                       fontSize: '18px',
//                       fontWeight: '700',
//                       textShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                     }}>🔧 Мониторинг системы</h3>
//                     <div style={{ marginBottom: '15px' }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Статус сервера:</span>
//                         <span style={{ color: '#28a745', fontSize: '14px' }}>✅ Онлайн</span>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Использование CPU:</span>
//                         <span style={{ color: '#ffc107', fontSize: '14px' }}>0%</span>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <span style={{ color: '#333', fontWeight: '500', fontSize: '14px' }}>Свободная память:</span>
//                         <span style={{ color: '#007bff', fontSize: '14px' }}>0 MB</span>
//                       </div>
//                     </div>
//                     <div style={{ display: 'flex', gap: '8px' }}>
//                       <button style={{
//                         flex: 1,
//                         padding: '8px',
//                         backgroundColor: '#28a745',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         fontSize: '12px',
//                         cursor: 'pointer'
//                       }}>
//                         🔄 Обновить
//                       </button>
//                       <button style={{
//                         flex: 1,
//                         padding: '8px',
//                         backgroundColor: '#dc3545',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         fontSize: '12px',
//                         cursor: 'pointer'
//                       }}>
//                         🚨 Алерты
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(15px)',
//                     padding: '20px',
//                     borderRadius: '15px',
//                     border: '1px solid rgba(255, 255, 255, 0.3)',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//                     transition: 'all 0.3s ease'
//                   }}>
//                     <h3 style={{ 
//                       color: '#333', 
//                       margin: '0 0 15px 0',
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       WebkitBackgroundClip: 'text',
//                       WebkitTextFillColor: 'transparent',
//                       fontSize: '18px',
//                       fontWeight: '700',
//                       textShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                     }}>📝 Логи и события</h3>
//                     <div style={{ marginBottom: '15px', maxHeight: '250px', overflowY: 'auto' }}>
//                       <div style={{ 
//                         padding: '10px 12px', 
//                         backgroundColor: '#f8f9fa', 
//                         borderRadius: '6px', 
//                         marginBottom: '8px',
//                         fontSize: '14px',
//                         border: '2px solid #28a745',
//                         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                         color: '#155724'
//                       }}>
//                         <span style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>✅</span> <strong>Система запущена</strong>
//                       </div>
//                       <div style={{ 
//                         padding: '10px 12px', 
//                         backgroundColor: '#e7f3ff', 
//                         borderRadius: '6px', 
//                         marginBottom: '8px',
//                         fontSize: '14px',
//                         border: '2px solid #007bff',
//                         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                         color: '#004085'
//                       }}>
//                         <span style={{ color: '#007bff', fontSize: '16px', fontWeight: 'bold' }}>ℹ️</span> <strong>База данных подключена</strong>
//                       </div>
//                       <div style={{ 
//                         padding: '10px 12px', 
//                         backgroundColor: '#fff3cd', 
//                         borderRadius: '6px',
//                         fontSize: '14px',
//                         border: '2px solid #ffc107',
//                         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                         color: '#856404'
//                       }}>
//                         <span style={{ color: '#ffc107', fontSize: '16px', fontWeight: 'bold' }}>⚠️</span> <strong>Нет новых событий</strong>
//                       </div>
//                     </div>
//                     <button style={{
//                       width: '100%',
//                       padding: '12px',
//                       backgroundColor: '#6c757d',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '6px',
//                       fontSize: '14px',
//                       cursor: 'pointer',
//                       fontWeight: '500',
//                       transition: 'all 0.3s ease',
//                       boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                     }}
//                     onMouseOver={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#5a6268';
//                       target.style.transform = 'translateY(-1px)';
//                     }}
//                     onMouseOut={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#6c757d';
//                       target.style.transform = 'translateY(0)';
//                     }}
//                     onClick={handleViewAllLogs}>
//                       📋 Просмотреть все логи
//                     </button>
//                   </div>
//                 </div>
                
//                 {/* Секция с дополнительными инструментами */}
//                 <div style={{
//                   backgroundColor: '#f8f9fa',
//                   padding: '20px',
//                   borderRadius: '8px',
//                   border: '1px solid #dee2e6',
//                   marginTop: '30px'
//                 }}>
//                   <h3 style={{ color: '#2c3e50', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700' }}>🛠️ Дополнительные инструменты</h3>
//                   <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//                     gap: '15px'
//                   }}>
//                     <button style={{
//                       padding: '15px',
//                       backgroundColor: '#e3f2fd',
//                       border: '2px solid #2196f3',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                       textAlign: 'left',
//                       transition: 'all 0.2s ease'
//                     }}
//                     onMouseOver={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#bbdefb';
//                       target.style.transform = 'translateY(-2px)';
//                     }}
//                     onMouseOut={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#e3f2fd';
//                       target.style.transform = 'translateY(0)';
//                     }}
//                     onClick={handleTechnicalSupport}>
//                       <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔧</div>
//                       <div style={{ fontWeight: '700', marginBottom: '4px', color: '#1565c0', fontSize: '14px' }}>Техническая поддержка</div>
//                       <div style={{ fontSize: '12px', color: '#0d47a1', fontWeight: '600' }}>Помощь и диагностика</div>
//                     </button>
                    
//                     <button style={{
//                       padding: '15px',
//                       backgroundColor: '#f3e5f5',
//                       border: '2px solid #9c27b0',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                       textAlign: 'left',
//                       transition: 'all 0.2s ease'
//                     }}
//                     onMouseOver={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#ce93d8';
//                       target.style.transform = 'translateY(-2px)';
//                     }}
//                     onMouseOut={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#f3e5f5';
//                       target.style.transform = 'translateY(0)';
//                     }}
//                     onClick={handleDesignSettings}>
//                       <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
//                       <div style={{ fontWeight: '700', marginBottom: '4px', color: '#7b1fa2', fontSize: '14px' }}>Настройки дизайна</div>
//                       <div style={{ fontSize: '12px', color: '#4a148c', fontWeight: '600' }}>Темы и оформление</div>
//                     </button>
                    
//                     <button style={{
//                       padding: '15px',
//                       backgroundColor: '#e8f5e8',
//                       border: '2px solid #4caf50',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                       textAlign: 'left',
//                       transition: 'all 0.2s ease'
//                     }}
//                     onMouseOver={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#a5d6a7';
//                       target.style.transform = 'translateY(-2px)';
//                     }}
//                     onMouseOut={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#e8f5e8';
//                       target.style.transform = 'translateY(0)';
//                     }}
//                     onClick={handleSecuritySettings}>
//                       <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
//                       <div style={{ fontWeight: '700', marginBottom: '4px', color: '#2e7d32', fontSize: '14px' }}>Безопасность</div>
//                       <div style={{ fontSize: '12px', color: '#1b5e20', fontWeight: '600' }}>Настройки безопасности</div>
//                     </button>
                    
//                     <button style={{
//                       padding: '15px',
//                       backgroundColor: '#fff3e0',
//                       border: '2px solid #ff9800',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                       textAlign: 'left',
//                       transition: 'all 0.2s ease'
//                     }}
//                     onMouseOver={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#ffcc02';
//                       target.style.transform = 'translateY(-2px)';
//                     }}
//                     onMouseOut={(e) => {
//                       const target = e.target as HTMLButtonElement;
//                       target.style.backgroundColor = '#fff3e0';
//                       target.style.transform = 'translateY(0)';
//                     }}
//                     onClick={handleMobileSettings}>
//                       <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
//                       <div style={{ fontWeight: '700', marginBottom: '4px', color: '#ef6c00', fontSize: '14px' }}>Мобильная версия</div>
//                       <div style={{ fontSize: '12px', color: '#e65100', fontWeight: '600' }}>Настройки для мобильных</div>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <section className="card card--registration">
//               <h2 className="card__title">{t("registration.cardTitle")}</h2>
              
//               {status && (
//                 <div className={`status status--${status.type}`}>
//                   <p className="status__message">{status.message}</p>
//                   {status.details && <p className="status__details">{status.details}</p>}
//                 </div>
//               )}

//               <form className="form" onSubmit={handleSubmit}>
//                 <div className="form__row">
//                   <label className="form__label" htmlFor="firstName">
//                     {t("registration.fields.firstName")} *
//                   </label>
//                   <input
//                     id="firstName"
//                     className="form__input"
//                     type="text"
//                     placeholder={t("registration.placeholders.firstName")}
//                     value={formState.firstName}
//                     onChange={(event) => handleInputChange("firstName", event.target.value)}
//                     required
//                   />
//                   {fieldErrors.firstName && (
//                     <div className="form__hint form__hint--error">{fieldErrors.firstName}</div>
//                   )}
//                 </div>

//                 <div className="form__row">
//                   <label className="form__label" htmlFor="lastName">
//                     {t("registration.fields.lastName")} *
//                   </label>
//                   <input
//                     id="lastName"
//                     className="form__input"
//                     type="text"
//                     placeholder={t("registration.placeholders.lastName")}
//                     value={formState.lastName}
//                     onChange={(event) => handleInputChange("lastName", event.target.value)}
//                     required
//                   />
//                   {fieldErrors.lastName && (
//                     <div className="form__hint form__hint--error">{fieldErrors.lastName}</div>
//                   )}
//                 </div>

//                 <div className="form__row">
//                   <label className="form__label" htmlFor="country">
//                     {t("registration.fields.country")} *
//                   </label>
//                   <SimpleCountrySelector
//                     value={formState.country}
//                     onChange={(value) => handleInputChange("country", value)}
//                     placeholder={t("registration.placeholders.country")}
//                   />
//                   {fieldErrors.country && (
//                     <div className="form__hint form__hint--error">{fieldErrors.country}</div>
//                   )}
//                 </div>

//                 <div className="form__row">
//                   <label className="form__label" htmlFor="phoneNumber">
//                     {t("registration.fields.phone")} *
//                   </label>
//                   <SimplePhoneInput
//                     value={formState.phoneNumber}
//                     onChange={(value) => handleInputChange("phoneNumber", value)}
//                     placeholder={t("registration.placeholders.phone")}
//                     countryCode={formState.country}
//                   />
//                 </div>

//                 <div className="form__row">
//                   <label className="form__label" htmlFor="email">
//                     {t("registration.fields.email")} *
//                   </label>
//                   <input
//                     id="email"
//                     className="form__input"
//                     type="email"
//                     placeholder={t("registration.placeholders.email")}
//                     value={formState.email}
//                     onChange={(event) => handleInputChange("email", event.target.value)}
//                     required
//                   />
//                   {fieldErrors.email && (
//                     <div className="form__hint form__hint--error">{fieldErrors.email}</div>
//                   )}
//                 </div>

//                 <div className="form__row">
//                   <label className="form__label" htmlFor="birthDate">
//                     {t("registration.fields.birthDate")} *
//                   </label>
//                   <DatePicker
//                     value={formState.birthDate}
//                     onChange={(value) => handleInputChange("birthDate", value)}
//                     placeholder={t("registration.datePicker.placeholder")}
//                     required
//                   />
//                 </div>

//                 <NetherlandsAddressInput
//                   postalCode={formState.postalCode}
//                   street={formState.street}
//                   city={formState.city}
//                   houseNumber={formState.houseNumber}
//                   onPostalCodeChange={(value) => handleInputChange("postalCode", value)}
//                   onStreetChange={(value) => handleInputChange("street", value)}
//                   onCityChange={(value) => handleInputChange("city", value)}
//                   onHouseNumberChange={(value) => handleInputChange("houseNumber", value)}
//                   onValidationChange={(isValid, errors) => setAddressValidation({ isValid, errors })}
//                   required={true}
//                 />

//                 <div className="form__row">
//                   <label className="form__label" htmlFor="preferredFood">
//                     {t("registration.fields.preferredFood")} *
//                   </label>
//                   <textarea
//                     id="preferredFood"
//                     className="form__input form__textarea"
//                     placeholder={t("registration.placeholders.preferredFood")}
//                     value={formState.preferredFood || formState.feedback}
//                     onChange={(event) => {
//                       const v = event.target.value;
//                       handleInputChange("preferredFood", v);
//                       handleInputChange("feedback", v);
//                     }}
//                     rows={4}
//                     required
//                   />
//                 </div>

//                 <div className="form__actions">
//                   <InteractiveHoverButton 
//                     text={isSubmitting ? t("registration.actions.submitting") : t("registration.actions.submit")}
//                     className="button button--primary"
//                     type="submit"
//                     disabled={isSubmitting}
//                   />
//                 </div>
//               </form>
//             </section>
//           )}
//         </div>
//       </main>
//       </div>
//     </div>
//   );
// }
// // import React, { useState, useCallback, useEffect, useMemo, useRef, type FormEvent } from "react";
// // import { useTranslation } from "react-i18next";

// // import "./App.css";
// // import "./i18n/config";
// // import { ParticleTextEffect } from "./components/ParticleTextEffect";
// // import { LanguageSwitcher } from "./components/LanguageSwitcher";
// // import SimpleCountrySelector from "./components/SimpleCountrySelector";
// // import SimplePhoneInput from "./components/SimplePhoneInput";
// // import DatePicker from "./components/DatePicker";
// // import { InteractiveHoverButton } from "./components/ui/interactive-hover-button";
// // import ThankYouPage from "./components/ThankYouPage"; // Возможно, понадобится позже для показа промокода
// // import NetherlandsAddressInput from "./components/NetherlandsAddressInput";
// // import AccessDenied from "./components/AccessDenied";
// // import { VerificationPage } from './components/VerificationPage'; // Импортируем страницу верификации

// // // Тип для хранения данных формы
// // type RegistrationFormState = {
// //   firstName: string;
// //   lastName: string;
// //   country: string;
// //   phoneNumber: string;
// //   email: string;
// //   birthDate: string;
// //   city: string;
// //   street: string;
// //   postalCode: string;
// //   houseNumber: string;
// //   preferredFood: string;
// //   feedback: string;
// //   discountCode: string; // Оставляем для ThankYouPage, если нужно
// // };

// // // Тип для сообщений об успехе/ошибке
// // type StatusState = {
// //   type: "success" | "error";
// //   message: string;
// //   details?: string; // Например, для промокода
// // };

// // // Тип для данных об успехе регистрации (когда пользователь уже верифицирован)
// // type SuccessData = {
// //     message: string;
// //     discountCode?: string;
// // };

// // // Начальное состояние формы
// // const defaultFormState: RegistrationFormState = {
// //   firstName: "",
// //   lastName: "",
// //   country: "",
// //   phoneNumber: "",
// //   email: "",
// //   birthDate: "",
// //   city: "",
// //   street: "",
// //   postalCode: "",
// //   houseNumber: "",
// //   preferredFood: "",
// //   feedback: "",
// //   discountCode: "",
// // };

// // export default function App() {
// //   const { t } = useTranslation();
// //   const [formState, setFormState] = useState<RegistrationFormState>(defaultFormState);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [error, setError] = useState<string | null>(null); // Теперь только строка для ошибки
// //   const [successData, setSuccessData] = useState<SuccessData | null>(null); // Для показа промокода уже зарегистрированным
// //   const [showThankYou, setShowThankYou] = useState(false); // Оставляем для старой логики, если нужна
// //   const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
// //   const [showAdminLogin, setShowAdminLogin] = useState(false);
// //   const [showAdminPanel, setShowAdminPanel] = useState(false);
// //   const [adminFormData, setAdminFormData] = useState({
// //     email: '',
// //     accessCode: '',
// //     password: ''
// //   });
// //   const [adminError, setAdminError] = useState('');
// //   const [isAdminLoading, setIsAdminLoading] = useState(false);
// //   const [showAccessDenied, setShowAccessDenied] = useState(false);
  
// //   // (!!!) НОВЫЕ СОСТОЯНИЯ (!!!)
// //   const [consentEmail, setConsentEmail] = useState(false);
// //   const [consentSms, setConsentSms] = useState(false);
// //   const [verificationCustomerId, setVerificationCustomerId] = useState<string | null>(null); // ID для страницы верификации
// //   // ==========================

// //   const [activeSection, setActiveSection] = useState<string>('');
// //   const [formSubmissions, setFormSubmissions] = useState<[]>([]); // Типизируйте 'any' по необходимости
// //   const [exportData, setExportData] = useState<[]>([]); // Типизируйте 'any' по необходимости
// //   const dataTableRef = useRef<HTMLDivElement | null>(null);
// //   const [draftId, setDraftId] = useState<string | null>(null);
// //   const [addressValidation, setAddressValidation] = useState({
// //     isValid: false,
// //     errors: [] as string[]
// //   });
// //   const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegistrationFormState, string>>>({});

// //   const lettersOnlyRegex = useMemo(() => /^[\p{L}]+(?:[-\s'][\p{L}]+)*$/u, []);
// //   const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, []);

// //   // Функция сброса формы (может понадобиться)
// //   const resetForm = () => {
// //     setFormState(defaultFormState);
// //     setConsentEmail(false);
// //     setConsentSms(false);
// //     setFieldErrors({});
// //     setAddressValidation({ isValid: false, errors: [] });
// //   };


// //   const validateForm = useCallback(() => {
// //     const errors: Partial<Record<keyof RegistrationFormState, string>> = {};

// //     if (!formState.firstName || !lettersOnlyRegex.test(formState.firstName.trim())) {
// //       errors.firstName = !formState.firstName ? t('registration.validation.firstName.required') : t('registration.validation.firstName.lettersOnly');
// //     }
// //     if (!formState.lastName || !lettersOnlyRegex.test(formState.lastName.trim())) {
// //       errors.lastName = !formState.lastName ? t('registration.validation.lastName.required') : t('registration.validation.lastName.lettersOnly');
// //     }
// //     if (!formState.country) {
// //       errors.country = t('registration.validation.country.required');
// //     }
// //     const phoneDigits = (formState.phoneNumber || '').replace(/\D/g, '');
// //     if (!phoneDigits || phoneDigits.length < 7 || phoneDigits.length > 15) {
// //       errors.phoneNumber = t('registration.validation.phone.length');
// //     }
// //     if (!formState.email || !emailRegex.test(formState.email)) {
// //       errors.email = t('registration.validation.email.invalid');
// //     }
// //      if (!formState.birthDate) { // Добавлена проверка даты рождения
// //       errors.birthDate = t('registration.validation.birthDate.required');
// //     }

// //     if (!addressValidation.isValid) {
// //       if (!formState.postalCode) errors.postalCode = t('registration.validation.postalCode.format');
// //       if (!formState.street) errors.street = t('registration.validation.street.required');
// //       if (!formState.city) errors.city = t('registration.validation.city.required');
// //       if (!formState.houseNumber) errors.houseNumber = t('registration.validation.houseNumber.required');
// //     }
    
// //      if (!formState.preferredFood) { // Добавлена проверка предпочтений
// //         errors.preferredFood = t('registration.validation.preferredFood.required');
// //      }

// //     setFieldErrors(errors);
// //     return Object.keys(errors).length === 0;
// //   }, [formState, addressValidation.isValid, t, lettersOnlyRegex, emailRegex]);

// //   const handleInputChange = useCallback((field: keyof RegistrationFormState | 'consentEmail' | 'consentSms', value: string | boolean) => {
// //       if (field === 'consentEmail') {
// //           setConsentEmail(value as boolean);
// //       } else if (field === 'consentSms') {
// //           setConsentSms(value as boolean);
// //       } else {
// //           setFormState(prev => ({ ...prev, [field]: value as string }));
// //       }
// //       // Очищаем ошибку поля при изменении
// //       if (fieldErrors[field as keyof RegistrationFormState]) {
// //            setFieldErrors(prev => ({ ...prev, [field]: undefined }));
// //       }
// //   }, [fieldErrors]);

// //   // (!!!) ОБНОВЛЕННЫЙ handleSubmit (!!!)
// //   const handleSubmit = useCallback(async (e: FormEvent) => {
// //     e.preventDefault();
// //     const ok = validateForm();
// //     if (!ok) {
// //         // Прокрутка к первому полю с ошибкой (опционально)
// //         const firstErrorField = Object.keys(fieldErrors).find(key => fieldErrors[key as keyof RegistrationFormState]);
// //         if (firstErrorField) {
// //             const element = document.getElementById(firstErrorField);
// //             element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
// //         }
// //         return;
// //     }
// //     setIsSubmitting(true);
// //     setError(null);
// //     setSuccessData(null); // Сбрасываем старый успех

// //     const formData = {
// //       ...formState,
// //       consentEmail: consentEmail,
// //       consentSms: consentSms,
// //     };

// //     try {
// //       const response = await fetch("/api/register", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(formData),
// //       });

// //       const result = await response.json();

// //       if (!response.ok) {
// //         // Уточняем сообщение об ошибке от сервера, если оно есть
// //         throw new Error(result.message || t('error.server'));
// //       }

// //       // --- НОВАЯ ЛОГИКА ОБРАБОТКИ ОТВЕТА ---
// //       if (result.status === "created" || result.status === "verification_required" || result.status === "pending_verification") {
// //         // Успешная регистрация или пользователь уже есть, но не верифицирован
// //         // Сохраняем ID и переходим на страницу верификации
// //         if (draftId) { // Удаляем черновик перед переходом
// //             fetch(`/api/form-draft/${draftId}`, { method: 'DELETE' }).catch(console.error);
// //             setDraftId(null);
// //         }
// //         setVerificationCustomerId(result.customerId);
// //       } else if (result.status === "verified" || result.status === "exists") {
// //          // Пользователь уже существует И верифицирован
// //          setSuccessData({
// //              message: t('success.alreadyRegistered'),
// //              discountCode: result.discountCode
// //          });
// //          // Сбрасываем форму (опционально)
// //          resetForm();
// //          if (draftId) { // Удаляем черновик
// //              fetch(`/api/form-draft/${draftId}`, { method: 'DELETE' }).catch(console.error);
// //              setDraftId(null);
// //          }
// //       } else {
// //          // Неизвестный статус ответа
// //          throw new Error(t('error.unknownResponse'));
// //       }
// //       // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

// //     } catch (err) {
// //       console.error("Ошибка регистрации:", err);
// //       setError(err.message || t('error.generic'));
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   }, [formState, consentEmail, consentSms, t, validateForm, draftId, fieldErrors]); // Добавлены fieldErrors в зависимости

// //   // ... (Остальной код App.tsx: handleAdminInputChange, handleAdminLogin, useEffects и т.д.) ...
// //   // === Весь код для админ-панели, автосохранения и т.д. ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ ===
// //   // ... (handleAdminInputChange, handleAdminLogin, handleAdminLogout, handleBackToForm, useEffect для auth, useEffect для fetch submissions, useEffect для автосинхронизации, useEffect для автосохранения, handleViewAllLogs, handleMainPage, handleUsersPage, handleTechnicalSupport, handleDesignSettings, handleSecuritySettings, handleMobileSettings, расчет статистики) ...


// //   // --- (!!!) ОБНОВЛЕННЫЙ РЕНДЕРИНГ (!!!) ---
// //   if (showThankYou) { // Оставим пока для совместимости, если используется где-то еще
// //     return <ThankYouPage customerData={formState} onClose={() => setShowThankYou(false)} />;
// //   }

// //   if (showAccessDenied) {
// //     return <AccessDenied onBack={() => {
// //       setShowAccessDenied(false);
// //       setShowAdminLogin(false);
// //     }} />;
// //   }
  
// //   // (!!!) НОВОЕ: Показываем страницу верификации, если есть ID (!!!)
// //   if (verificationCustomerId) {
// //     return <VerificationPage customerId={verificationCustomerId} />;
// //   }

// //   // Основной рендер: Админка ИЛИ Форма регистрации
// //   return (
// //     <div className="app">
// //       <div className="app__content">
// //         <header className="app__header">
// //           <div className="header__content"></div>
// //         </header>
        
// //         {/* Кнопка администратора */}
// //         <div className="admin-controls">
// //           <button
// //             className="admin-toggle-btn"
// //             onClick={() => {
// //               if (isAdminAuthenticated) {
// //                 setShowAdminPanel(!showAdminPanel);
// //                 setShowAdminLogin(false);
// //               } else {
// //                 setShowAdminLogin(!showAdminLogin);
// //                 setShowAdminPanel(false);
// //               }
// //             }}
// //             title={isAdminAuthenticated ? "Переключить панель администратора" : "Войти в панель администратора"}
// //           >
// //             ⚙️
// //           </button>
// //         </div>
        
// //         <LanguageSwitcher />

// //         <main className="app__main">
// //         <div className="container">
// //           {showAdminLogin && !isAdminAuthenticated ? (
// //             // --- Секция входа админа (без изменений) ---
// //             <section className="card card--admin-login" style={{
// //               backgroundColor: '#1a1a1a', border: '2px solid #ffffff', borderRadius: '12px', padding: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
// //             }}>
// //               {/* ... (весь код формы входа админа) ... */}
// //                <h2 className="card__title" style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '20px' }}>
// //                  Вход администратора
// //                </h2>
// //                <p style={{ textAlign: 'center', color: '#ffffff', marginBottom: '30px', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
// //                  Введите данные для входа в панель администратора
// //                </p>
              
// //                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
// //                  <div>
// //                    <label style={{ display: 'block', fontWeight: '600', color: '#ffffff', fontSize: '16px', marginBottom: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
// //                      Email
// //                    </label>
// //                    <input
// //                      type="email" name="email" placeholder="Введите email"
// //                      value={adminFormData.email} onChange={handleAdminInputChange} required
// //                      style={{ width: '100%', padding: '12px', border: '2px solid #ffffff', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}
// //                    />
// //                  </div>
                 
// //                  <div>
// //                    <label style={{ display: 'block', fontWeight: '600', color: '#ffffff', fontSize: '16px', marginBottom: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
// //                      Код доступа
// //                    </label>
// //                    <input
// //                      type="text" name="accessCode" placeholder="Введите код доступа"
// //                      value={adminFormData.accessCode} onChange={handleAdminInputChange} required
// //                      style={{ width: '100%', padding: '12px', border: '2px solid #ffffff', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}
// //                    />
// //                  </div>
                 
// //                  <div>
// //                    <label style={{ display: 'block', fontWeight: '600', color: '#ffffff', fontSize: '16px', marginBottom: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
// //                      Пароль
// //                    </label>
// //                    <input
// //                      type="password" name="password" placeholder="Введите пароль"
// //                      value={adminFormData.password} onChange={handleAdminInputChange} required
// //                      style={{ width: '100%', padding: '12px', border: '2px solid #ffffff', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}
// //                    />
// //                  </div>
                 
// //                  {adminError && (
// //                    <div style={{ padding: '12px', backgroundColor: '#dc3545', border: '2px solid #ffffff', borderRadius: '6px', color: '#ffffff', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.3)', fontWeight: '600' }}>
// //                      {adminError}
// //                    </div>
// //                  )}
                 
// //                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
// //                    <InteractiveHoverButton
// //                      text={isAdminLoading ? 'Вход...' : 'Войти в панель администратора'}
// //                      className="button button--primary" type="submit" disabled={isAdminLoading}
// //                    />
// //                    <InteractiveHoverButton
// //                      text="← Назад к форме" className="button button--secondary"
// //                      onClick={() => setShowAdminLogin(false)}
// //                    />
// //                  </div>
// //                </form>
               
// //                <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.3)', fontWeight: '500' }}>
// //                  Только для авторизованных администраторов
// //                </div>
// //             </section>
// //           ) : (isAdminAuthenticated && (showAdminPanel || showAdminLogin)) ? (
// //              // --- Секция админ-панели (без изменений) ---
// //             <div style={{
// //               position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: `radial-gradient(140% 120% at 18% 10%, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0) 74%), radial-gradient(140% 140% at 82% 12%, rgba(62, 205, 255, 0.3), rgba(62, 205, 255, 0) 68%), radial-gradient(120% 160% at 48% 92%, rgba(0, 170, 230, 0.2), rgba(0, 170, 230, 0) 74%), linear-gradient(180deg, rgba(3, 26, 58, 0.98) 0%, rgba(2, 38, 74, 0.95) 20%, rgba(1, 46, 88, 0.92) 40%, rgba(1, 46, 88, 0.95) 70%, rgba(2, 38, 74, 0.98) 85%, rgba(3, 26, 58, 1) 95%, rgba(3, 26, 58, 1) 100%)`, backgroundAttachment: 'fixed', zIndex: 1000, overflow: 'auto', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif', padding: '20px', animation: 'none'
// //             }}>
// //                 {/* ... (весь код админ-панели из вашего файла) ... */}
// //                 {/* Этот код очень длинный, я не буду его дублировать, он остается как есть */}
// //             </div>
// //           ) : (
// //             // --- Секция формы регистрации (с добавленными чекбоксами) ---
// //             <section className="card card--registration">
// //               <h2 className="card__title">{t("registration.cardTitle")}</h2>
              
// //               {/* Отображение общей ошибки */}
// //               {error && (
// //                 <div className="status status--error">
// //                   <p className="status__message">{error}</p>
// //                 </div>
// //               )}
              
// //               {/* Отображение сообщения об успехе (для уже верифицированных) */}
// //               {successData && (
// //                 <div className="status status--success">
// //                   <p className="status__message">{successData.message}</p>
// //                   {successData.discountCode && (
// //                     <p className="status__details">{t('yourDiscountCode')}: {successData.discountCode}</p>
// //                   )}
// //                 </div>
// //               )}

// //               <form className="form" onSubmit={handleSubmit}>
// //                 {/* --- ВСЕ ВАШИ ПОЛЯ ФОРМЫ (firstName... preferredFood) --- */}
// //                 {/* Имя */}
// //                 <div className="form__row">
// //                   <label className="form__label" htmlFor="firstName">{t("registration.fields.firstName")} *</label>
// //                   <input id="firstName" className="form__input" type="text" placeholder={t("registration.placeholders.firstName")} value={formState.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
// //                   {fieldErrors.firstName && <div className="form__hint form__hint--error">{fieldErrors.firstName}</div>}
// //                 </div>
// //                 {/* Фамилия */}
// //                 <div className="form__row">
// //                   <label className="form__label" htmlFor="lastName">{t("registration.fields.lastName")} *</label>
// //                   <input id="lastName" className="form__input" type="text" placeholder={t("registration.placeholders.lastName")} value={formState.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
// //                   {fieldErrors.lastName && <div className="form__hint form__hint--error">{fieldErrors.lastName}</div>}
// //                 </div>
// //                 {/* Страна */}
// //                  <div className="form__row">
// //                   <label className="form__label" htmlFor="country">{t("registration.fields.country")} *</label>
// //                   <SimpleCountrySelector value={formState.country} onChange={(value) => handleInputChange("country", value)} placeholder={t("registration.placeholders.country")} />
// //                   {fieldErrors.country && <div className="form__hint form__hint--error">{fieldErrors.country}</div>}
// //                  </div>
// //                  {/* Телефон */}
// //                  <div className="form__row">
// //                   <label className="form__label" htmlFor="phoneNumber">{t("registration.fields.phone")} *</label>
// //                   <SimplePhoneInput value={formState.phoneNumber} onChange={(value) => handleInputChange("phoneNumber", value)} placeholder={t("registration.placeholders.phone")} countryCode={formState.country} />
// //                    {fieldErrors.phoneNumber && <div className="form__hint form__hint--error">{fieldErrors.phoneNumber}</div>}
// //                  </div>
// //                  {/* Email */}
// //                  <div className="form__row">
// //                   <label className="form__label" htmlFor="email">{t("registration.fields.email")} *</label>
// //                   <input id="email" className="form__input" type="email" placeholder={t("registration.placeholders.email")} value={formState.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
// //                   {fieldErrors.email && <div className="form__hint form__hint--error">{fieldErrors.email}</div>}
// //                  </div>
// //                  {/* Дата рождения */}
// //                  <div className="form__row">
// //                      <label className="form__label" htmlFor="birthDate">{t("registration.fields.birthDate")} *</label>
// //                      <DatePicker value={formState.birthDate} onChange={(value) => handleInputChange("birthDate", value)} placeholder={t("registration.datePicker.placeholder")} required />
// //                      {fieldErrors.birthDate && <div className="form__hint form__hint--error">{fieldErrors.birthDate}</div>}
// //                  </div>
// //                  {/* Адрес */}
// //                  <NetherlandsAddressInput
// //                      postalCode={formState.postalCode} street={formState.street} city={formState.city} houseNumber={formState.houseNumber}
// //                      onPostalCodeChange={(value) => handleInputChange("postalCode", value)}
// //                      onStreetChange={(value) => handleInputChange("street", value)}
// //                      onCityChange={(value) => handleInputChange("city", value)}
// //                      onHouseNumberChange={(value) => handleInputChange("houseNumber", value)}
// //                      onValidationChange={(isValid, errors) => setAddressValidation({ isValid, errors })}
// //                      required={true}
// //                  />
// //                   {/* Ошибки адреса */}
// //                   {(!addressValidation.isValid && (fieldErrors.postalCode || fieldErrors.street || fieldErrors.city || fieldErrors.houseNumber)) && (
// //                       <div className="form__hint form__hint--error mb-4">
// //                           {addressValidation.errors.length > 0 ? addressValidation.errors.join(' ') : t('registration.validation.address.incomplete')}
// //                       </div>
// //                   )}
// //                  {/* Предпочтения */}
// //                  <div className="form__row">
// //                      <label className="form__label" htmlFor="preferredFood">{t("registration.fields.preferredFood")} *</label>
// //                      <textarea id="preferredFood" className="form__input form__textarea" placeholder={t("registration.placeholders.preferredFood")}
// //                          value={formState.preferredFood || formState.feedback}
// //                          onChange={(e) => {
// //                              const v = e.target.value;
// //                              handleInputChange("preferredFood", v);
// //                              handleInputChange("feedback", v); // Синхронизируем с feedback для совместимости
// //                          }}
// //                          rows={4} required
// //                      />
// //                      {fieldErrors.preferredFood && <div className="form__hint form__hint--error">{fieldErrors.preferredFood}</div>}
// //                  </div>

// //                 {/* --- (!!!) ДОБАВЛЕННЫЕ ЧЕКБОКСЫ (!!!) --- */}
// //                 <div className="mb-4">
// //                   <label className="flex items-center">
// //                     <input
// //                       type="checkbox"
// //                       checked={consentEmail}
// //                       onChange={(e) => handleInputChange("consentEmail", e.target.checked)}
// //                       className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
// //                     />
// //                     <span className="text-sm text-gray-400">
// //                       {t('consentEmail')} {/* 'Я согласен получать email рассылку' */}
// //                     </span>
// //                   </label>
// //                 </div>
// //                 <div className="mb-6">
// //                   <label className="flex items-center">
// //                     <input
// //                       type="checkbox"
// //                       checked={consentSms}
// //                       onChange={(e) => handleInputChange("consentSms", e.target.checked)}
// //                       className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
// //                     />
// //                     <span className="text-sm text-gray-400">
// //                      {t('consentSms')} {/* 'Я согласен получать SMS рассылку' */}
// //                     </span>
// //                   </label>
// //                 </div>
// //                 {/* ==================================== */}

// //                 <div className="form__actions">
// //                   <InteractiveHoverButton
// //                     text={isSubmitting ? t("registration.actions.submitting") : t("registration.actions.submit")}
// //                     className="button button--primary"
// //                     type="submit"
// //                     disabled={isSubmitting}
// //                   />
// //                 </div>
// //               </form>
// //             </section>
// //           )}
// //         </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

import React, { useState, useCallback, useEffect, useMemo, useRef, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import "./App.css";
import "./i18n/config";
import { ParticleTextEffect } from "./components/ParticleTextEffect";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import SimpleCountrySelector from "./components/SimpleCountrySelector";
import SimplePhoneInput from "./components/SimplePhoneInput";
import DatePicker from "./components/DatePicker";
import { InteractiveHoverButton } from "./components/ui/interactive-hover-button";
import ThankYouPage from "./components/ThankYouPage";
import NetherlandsAddressInput from "./components/NetherlandsAddressInput";
import AccessDenied from "./components/AccessDenied"; // Оставляем

// --- 1. ИМПОРТИРУЕМ НАШИ НОВЫЕ КОМПОНЕНТЫ ---
import AdminLogin from "./components/AdminLogin";
import { EnhancedAdminPanel } from "./components/EnhancedAdminPanel"; // Используем наш файл

// --- Типы для формы регистрации (из вашего файла) ---
type RegistrationFormState = {
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  email: string;
  birthDate: string;
  city: string;
  street: string;
  postalCode: string;
  houseNumber: string;
  preferredFood: string;
  feedback: string;
  discountCode: string;
};
type StatusState = {
  type: "success" | "error";
  message: string;
  details?: string;
};
const defaultFormState: RegistrationFormState = {
  firstName: "",
  lastName: "",
  country: "",
  phoneNumber: "",
  email: "",
  birthDate: "",
  city: "",
  street: "",
  postalCode: "",
  houseNumber: "",
  preferredFood: "",
  feedback: "",
  discountCode: "",
};
// --- (Конец типов) ---

export default function App() {
  const { t } = useTranslation();
  
  // --- Состояния для формы регистрации (из вашего файла) ---
  const [formState, setFormState] = useState<RegistrationFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [addressValidation, setAddressValidation] = useState({
    isValid: false,
    errors: [] as string[]
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegistrationFormState, string>>>({});
  // --- (Конец состояний формы регистрации) ---
  
  // --- 2. НОВАЯ ЛОГИКА АДМИН-ПАНЕЛИ (JWT) ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false); 

  // Проверка аутентификации по ТОКЕНУ при загрузке
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // (Здесь можно добавить проверку токена на сервере)
      setIsAdminAuthenticated(true);
    } else {
      setIsAdminAuthenticated(false);
    }
  }, []);

  // Эта функция передается в <AdminLogin />
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('adminToken', token); // Сохраняем токен
    setIsAdminAuthenticated(true); // Устанавливаем статус "вошел"
    setShowAdminLogin(false); // Закрываем окно входа
  };

  // Эта функция передается в <EnhancedAdminPanel />
  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken'); // Удаляем токен
    setIsAdminAuthenticated(false); // Устанавливаем статус "вышел"
    setShowAdminLogin(false); // (На всякий случай)
  };
  // --- (Конец новой логики админки) ---
  
  //
  // --- ВСЯ ВАША ЛОГИКА ФОРМЫ РЕГИСТРАЦИИ ОСТАЕТСЯ ЗДЕСЬ ---
  // (validateForm, handleInputChange, handleSubmit, автосохранение и т.д.)
  //
  const lettersOnlyRegex = useMemo(() => /^[\p{L}]+(?:[-\s'][\p{L}]+)*$/u, []);
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, []);

  const generateLocalDiscountCode = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  };

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof RegistrationFormState, string>> = {};

    if (!formState.firstName || !lettersOnlyRegex.test(formState.firstName.trim())) {
      errors.firstName = !formState.firstName ? t('registration.validation.firstName.required') : t('registration.validation.firstName.lettersOnly');
    }
    if (!formState.lastName || !lettersOnlyRegex.test(formState.lastName.trim())) {
      errors.lastName = !formState.lastName ? t('registration.validation.lastName.required') : t('registration.validation.lastName.lettersOnly');
    }
    if (!formState.country) {
      errors.country = t('registration.validation.country.required');
    }
    const phoneDigits = (formState.phoneNumber || '').replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 7 || phoneDigits.length > 15) {
      errors.phoneNumber = t('registration.validation.phone.length');
    }
    if (!formState.email || !emailRegex.test(formState.email)) {
      errors.email = t('registration.validation.email.invalid');
    }
    if (!addressValidation.isValid) {
      if (!formState.postalCode) errors.postalCode = t('registration.validation.postalCode.format');
      if (!formState.street) errors.street = t('registration.validation.street.required');
      if (!formState.city) errors.city = t('registration.validation.city.required');
      if (!formState.houseNumber) errors.houseNumber = t('registration.validation.houseNumber.required');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState, addressValidation.isValid, t, lettersOnlyRegex, emailRegex]);

  const handleInputChange = useCallback((field: keyof RegistrationFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const ok = validateForm();
    if (!ok) return;
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await response.json();
      if (response.ok) {
        if (draftId) {
          try {
            await fetch(`/api/form-draft/${draftId}`, { method: 'DELETE' });
            setDraftId(null);
          } catch (error) { console.error('Ошибка удаления черновика:', error); }
        }
        setStatus({
          type: "success",
          message: t("registration.success.message"),
          details: data.discountCode ? t("registration.success.discountCode", { code: data.discountCode }) : undefined,
        });
        setShowThankYou(true);
        setFormState(prev => ({
          ...defaultFormState,
          discountCode: data.discountCode || prev.discountCode,
          firstName: prev.firstName,
          lastName: prev.lastName,
          phoneNumber: prev.phoneNumber,
          email: prev.email,
        }));
      } else {
        // Оффлайн/резервный успех
        const localCode = generateLocalDiscountCode();
        if (draftId) {
          try {
            await fetch(`/api/form-draft/${draftId}`, { method: 'DELETE' });
            setDraftId(null);
          } catch (error) { console.error('Ошибка удаления черновика:', error); }
        }
        setStatus({
          type: "success",
          message: t("registration.success.message"),
          details: t("registration.success.discountCode", { code: localCode })
        });
        setShowThankYou(true);
        setFormState(prev => ({
          ...defaultFormState,
          discountCode: localCode,
          firstName: prev.firstName,
          lastName: prev.lastName,
          phoneNumber: prev.phoneNumber,
          email: prev.email,
        }));
      }
    } catch {
      // Оффлайн/резервный успех
      const localCode = generateLocalDiscountCode();
      if (draftId) {
        try {
          await fetch(`/api/form-draft/${draftId}`, { method: 'DELETE' });
          setDraftId(null);
        } catch (error) { console.error('Ошибка удаления черновика:', error); }
      }
      setStatus({
        type: "success",
        message: t("registration.success.message"),
        details: t("registration.success.discountCode", { code: localCode })
      });
      setShowThankYou(true);
      setFormState(prev => ({
        ...defaultFormState,
        discountCode: localCode,
        firstName: prev.firstName,
        lastName: prev.lastName,
        phoneNumber: prev.phoneNumber,
        email: prev.email,
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, t, validateForm, draftId]);

  // Автосохранение черновика (из вашего файла)
  useEffect(() => {
    if (showThankYou || showAdminLogin || isAdminAuthenticated || showAccessDenied) {
      return;
    }
    const hasData = formState.firstName || formState.lastName || formState.email || 
                    formState.phoneNumber || formState.country || formState.city;
    if (!hasData) {
      return;
    }
    const saveDraft = async () => {
      try {
        const response = await fetch('/api/form-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formState, draftId: draftId }),
        });
        if (response.ok) {
          const data = await response.json();
          if (!draftId && data.draftId) {
            setDraftId(data.draftId);
          }
        }
      } catch (error) { console.error('Ошибка автосохранения черновика:', error); }
    };
    saveDraft(); 
    const intervalId = setInterval(saveDraft, 1000);
    return () => clearInterval(intervalId);
  }, [formState, draftId, showThankYou, showAdminLogin, isAdminAuthenticated, showAccessDenied]);
  // --- (Конец логики формы регистрации) ---

  
  // --- 3. НОВЫЙ РЕНДЕРИНГ (return) ---

  if (showThankYou) {
    return <ThankYouPage customerData={formState} onClose={() => setShowThankYou(false)} />;
  }

  if (showAccessDenied) {
    return <AccessDenied onBack={() => {
      setShowAccessDenied(false);
      setShowAdminLogin(false);
    }} />;
  }

  // (!!!) ВОТ ГЛАВНОЕ ИЗМЕНЕНИЕ (!!!)
  // Если мы вошли в систему, показываем <EnhancedAdminPanel>
  if (isAdminAuthenticated) {
    // EnhancedAdminPanel теперь занимает весь экран
    return <EnhancedAdminPanel onLogout={handleAdminLogout} />;
  }

  // Если мы НЕ вошли, показываем обычную страницу (форму ИЛИ логин)
  return (
    <div className="app">
      <div className="app__content">
        <header className="app__header">
          <div className="header__content"></div>
        </header>
        
        {/* Кнопка администратора (логика обновлена) */}
        <div className="admin-controls">
          <button 
            className="admin-toggle-btn"
            onClick={() => {
              // Показываем/скрываем форму входа
              // Если админ уже вошел, он увидит EnhancedAdminPanel (логика выше)
              setShowAdminLogin(!showAdminLogin);
            }}
            title="Войти в панель администратора"
          >
            ⚙️
          </button>
        </div>
        
        <LanguageSwitcher />

        <main className="app__main">
        <div className="container">
          
          {/* (!!!) ЗДЕСЬ ВТОРОЕ ГЛАВНОЕ ИЗМЕНЕНИЕ (!!!) */}
          {/* Показываем ЛИБО AdminLogin, ЛИБО форму регистрации */}
          
          {showAdminLogin ? (
            
            // 1. Показываем компонент входа
            // (Мы передаем ему 'onLoginSuccess', который он вызовет,
            // когда 2FA будет пройдена и токен будет получен)
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
          
          ) : (
            
            // 2. Показываем обычную форму регистрации
            <>
              <div className="header__title">
                <ParticleTextEffect 
                  words={["SUSHI ICON"]} 
                  maxWidth="700px"
                  minHeight="2px"
                  className="particle-text-effect"
                />
              </div>
              
              <section className="card card--registration">
                <h2 className="card__title">{t("registration.cardTitle")}</h2>
                
                {status && (
                  <div className={`status status--${status.type}`}>
                    <p className="status__message">{status.message}</p>
                    {status.details && <p className="status__details">{status.details}</p>}
                  </div>
                )}

                <form className="form" onSubmit={handleSubmit}>
                  {/* (Ваши поля формы: firstName, lastName...) */}
                  <div className="form__row">
                    <label className="form__label" htmlFor="firstName">
                      {t("registration.fields.firstName")} *
                    </label>
                    <input
                      id="firstName"
                      className="form__input"
                      type="text"
                      placeholder={t("registration.placeholders.firstName")}
                      value={formState.firstName}
                      onChange={(event) => handleInputChange("firstName", event.target.value)}
                      required
                    />
                    {fieldErrors.firstName && (
                      <div className="form__hint form__hint--error">{fieldErrors.firstName}</div>
                    )}
                  </div>
                  
                  <div className="form__row">
                    <label className="form__label" htmlFor="lastName">
                      {t("registration.fields.lastName")} *
                    </label>
                    <input
                      id="lastName"
                      className="form__input"
                      type="text"
                      placeholder={t("registration.placeholders.lastName")}
                      value={formState.lastName}
                      onChange={(event) => handleInputChange("lastName", event.target.value)}
                      required
                    />
                    {fieldErrors.lastName && (
                      <div className="form__hint form__hint--error">{fieldErrors.lastName}</div>
                    )}
                  </div>

                  <div className="form__row">
                    <label className="form__label" htmlFor="country">
                      {t("registration.fields.country")} *
                    </label>
                    <SimpleCountrySelector
                      value={formState.country}
                      onChange={(value) => handleInputChange("country", value)}
                      placeholder={t("registration.placeholders.country")}
                    />
                    {fieldErrors.country && (
                      <div className="form__hint form__hint--error">{fieldErrors.country}</div>
                    )}
                  </div>

                  <div className="form__row">
                    <label className="form__label" htmlFor="phoneNumber">
                      {t("registration.fields.phone")} *
                    </label>
                    <SimplePhoneInput
                      value={formState.phoneNumber}
                      onChange={(value) => handleInputChange("phoneNumber", value)}
                      placeholder={t("registration.placeholders.phone")}
                      countryCode={formState.country}
                    />
                    {fieldErrors.phoneNumber && (
                      <div className="form__hint form__hint--error">{fieldErrors.phoneNumber}</div>
                    )}
                  </div>

                  <div className="form__row">
                    <label className="form__label" htmlFor="email">
                      {t("registration.fields.email")} *
                    </label>
                    <input
                      id="email"
                      className="form__input"
                      type="email"
                      placeholder={t("registration.placeholders.email")}
                      value={formState.email}
                      onChange={(event) => handleInputChange("email", event.target.value)}
                      required
                    />
                    {fieldErrors.email && (
                      <div className="form__hint form__hint--error">{fieldErrors.email}</div>
                    )}
                  </div>

                  <div className="form__row">
                    <label className="form__label" htmlFor="birthDate">
                      {t("registration.fields.birthDate")} *
                    </label>
                    <DatePicker
                      value={formState.birthDate}
                      onChange={(value) => handleInputChange("birthDate", value)}
                      placeholder={t("registration.datePicker.placeholder")}
                      required
                    />
                  </div>
                  
                  <NetherlandsAddressInput
                    postalCode={formState.postalCode}
                    street={formState.street}
                    city={formState.city}
                    houseNumber={formState.houseNumber}
                    onPostalCodeChange={(value) => handleInputChange("postalCode", value)}
                    onStreetChange={(value) => handleInputChange("street", value)}
                    onCityChange={(value) => handleInputChange("city", value)}
                    onHouseNumberChange={(value) => handleInputChange("houseNumber", value)}
                    onValidationChange={(isValid, errors) => setAddressValidation({ isValid, errors })}
                    required={true}
                  />

                  <div className="form__row">
                    <label className="form__label" htmlFor="preferredFood">
                      {t("registration.fields.preferredFood")} *
                    </label>
                    <textarea
                      id="preferredFood"
                      className="form__input form__textarea"
                      placeholder={t("registration.placeholders.preferredFood")}
                      value={formState.preferredFood || formState.feedback}
                      onChange={(event) => {
                        const v = event.target.value;
                        handleInputChange("preferredFood", v);
                        handleInputChange("feedback", v);
                      }}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="form__actions">
                    <InteractiveHoverButton 
                      text={isSubmitting ? t("registration.actions.submitting") : t("registration.actions.submit")}
                      className="button button--primary"
                      type="submit"
                      disabled={isSubmitting}
                    />
                  </div>
                </form>
              </section>
            </>
          )}
          
        </div>
        </main>
      </div>
    </div>
  );
}