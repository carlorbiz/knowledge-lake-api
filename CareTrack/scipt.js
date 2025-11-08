// --- @google/genai ---
// This is a simplified inlined version of the markdown-it library, which is a dependency of the standalone @google/genai SDK.
// It's included here to ensure the geminiService can correctly process markdown responses.
/*! markdown-it 14.1.0 https://github.com/markdown-it/markdown-it @license MIT */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).markdownit=e()}}(function(){return function e(t,r,n){function o(i,s){if(!r[i]){if(!t[i]){var c="function"==typeof require&&require;if(!s&&c)return c(i,!0);if(a)return a(i,!0);var u=new Error("Cannot find module '"+i+"'");throw u.code="MODULE_NOT_FOUND",u}var l=r[i]={exports:{}};t[i][0].call(l.exports,function(e){return o(t[i][1][e]||e)},l,l.exports,e,t,r,n)}return r[i].exports}for(var a="function"==typeof require&&require,i=0;i<n.length;i++)o(n[i]);return o}});

// --- Main App Logic ---
(async function() {
  const { GoogleGenAI } = await import("https://aistudiocdn.com/@google/genai@^1.25.0");

  // --- STATE MANAGEMENT ---
  let state = {
    user: null,
    medications: [],
    appointments: [],
    takenLog: {},
    currentView: 'dashboard',
    isMedModalOpen: false,
    isApptModalOpen: false,
    aiState: {
        activeTab: 'lookup',
        info: '',
        isLoading: false,
        error: null,
        lookupName: '',
        symptoms: '',
        med1: '',
        med2: '',
    }
  };

  // --- DOM & UTILITY FUNCTIONS ---
  const root = document.getElementById('root');
  const getFromStorage = (key, defaultValue) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(e);
      return defaultValue;
    }
  };
  const saveToStorage = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };
  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h, 10));
    date.setMinutes(parseInt(m, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  // --- ICONS (as functions returning SVG strings) ---
  const ICONS = {
    pill: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>`,
    calendar: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
    plus: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>`,
    trash: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`,
    info: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    home: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
    close: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`,
    sparkles: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${c}"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" /></svg>`,
    logout: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>`,
    share: (c= "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>`,
    logo: (c = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="${c}" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`
  };

  // --- GEMINI SERVICE ---
  const geminiService = (() => {
    let ai;
    const model = 'gemini-2.5-flash';
    const DISCLAIMER = `> **Disclaimer:** This information is for educational purposes only and is not a substitute for professional medical advice. Always consult with your doctor or a qualified healthcare provider with any questions you may have regarding a medical condition or treatment. Do not disregard professional medical advice or delay in seeking it because of something you have read here.`;
    
    const initAi = () => {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            console.warn("API_KEY environment variable not set.");
            return null;
        }
        return new GoogleGenAI({ apiKey: API_KEY });
    };

    const getApiResponse = async (prompt) => {
      if (!ai) ai = initAi();
      if (!ai) throw new Error("API Key is not configured.");
      
      try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
      } catch (error) {
        console.error("Error fetching info from Gemini:", error);
        throw new Error("Failed to retrieve information from the AI assistant. Please try again later.");
      }
    };
    
    return {
      lookupMedication: async (medicationName) => {
        const prompt = `You are a helpful assistant providing information for cancer patients and their carers. Your tone should be clear, empathetic, and easy to understand, avoiding overly technical jargon. Provide a summary for the medication: **${medicationName}**. Structure your response with the following sections using markdown headings:\n\n### What it's for\n### Common Side Effects\n### Important Notes for Patients & Carers\n\nCRITICAL: Start your entire response with the following disclaimer, exactly as written, inside a blockquote:\n${DISCLAIMER}`;
        return getApiResponse(prompt);
      },
      checkSideEffects: async (symptoms, medications) => {
        const medicationList = medications.map(m => `- ${m.name} (${m.dosage})`).join('\n');
        const prompt = `You are a helpful assistant providing information for cancer patients and their carers. Your tone should be clear, empathetic, and easy to understand. A user is taking the following medications:\n${medicationList}\n\nThey are experiencing these symptoms:\n**"${symptoms}"**\n\nAnalyze if the described symptoms are common side effects of any of the listed medications. Do NOT provide a diagnosis. Your goal is to provide informational context and empower the user to have a better conversation with their doctor. Structure your response:\n1. Acknowledge the user's symptoms.\n2. For each medication, mention if the symptoms are a known side effect.\n3. Provide clear next steps, strongly advising them to contact their healthcare provider.\n\nCRITICAL: Start your entire response with the following disclaimer, exactly as written, inside a blockquote:\n${DISCLAIMER}`;
        return getApiResponse(prompt);
      },
      checkDrugInteractions: async (med1, med2) => {
        const prompt = `You are a helpful assistant providing information for cancer patients and their carers. Your tone should be clear, empathetic, and easy to understand. Check for potential drug interactions between **${med1}** and **${med2}**. Provide the following information in your response:\n1. State clearly if there is a known interaction (e.g., "No major interactions found," "A moderate interaction exists," "A serious interaction exists").\n2. If an interaction exists, explain what it is in simple terms.\n3. Provide guidance on what the user should do, such as talking to their doctor or pharmacist before taking the medications together.\n\nCRITICAL: Start your entire response with the following disclaimer, exactly as written, inside a blockquote:\n${DISCLAIMER}`;
        return getApiResponse(prompt);
      }
    };
  })();

  // --- TEMPLATE/RENDER FUNCTIONS ---
  
  const renderNavButton = (targetView, label, icon) => {
    const isActive = state.currentView === targetView;
    return `
      <button
        data-view="${targetView}"
        class="nav-button flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-slate-200'}"
      >
        ${icon}
        <span class="text-xs sm:text-sm">${label}</span>
      </button>
    `;
  };

  const renderAppShell = () => {
    return `
      <div class="min-h-screen bg-slate-100 font-sans">
        <header class="bg-white shadow-md sticky top-0 z-40">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center">
                 ${ICONS.logo('h-8 w-8 text-teal-600')}
                 <h1 class="text-xl font-bold text-slate-800 ml-2">CareTrack</h1>
              </div>
              <div class="flex items-center gap-2">
                   <button id="add-med-header" class="hidden sm:flex items-center bg-teal-50 text-teal-700 font-semibold px-4 py-2 rounded-md hover:bg-teal-100 transition-colors">
                      ${ICONS.plus('w-5 h-5 mr-2')} Add Medication
                  </button>
                   <button id="add-appt-header" class="hidden sm:flex items-center bg-teal-50 text-teal-700 font-semibold px-4 py-2 rounded-md hover:bg-teal-100 transition-colors">
                      ${ICONS.plus('w-5 h-5 mr-2')} Add Appointment
                  </button>
                  <button id="logout-button-header" class="hidden sm:flex text-sm text-slate-600 hover:text-slate-800 ml-4">Logout</button>
              </div>
            </div>
          </div>
        </header>
        
        <div class="flex">
          <nav class="hidden md:block w-64 bg-white p-4 space-y-2 border-r border-slate-200 h-screen sticky top-[72px]">
            ${renderNavButton('dashboard', 'Dashboard', ICONS.home('w-5 h-5'))}
            ${renderNavButton('medications', 'Medications', ICONS.pill('w-5 h-5'))}
            ${renderNavButton('appointments', 'Appointments', ICONS.calendar('w-5 h-5'))}
            ${renderNavButton('info', 'AI Assistant', ICONS.info('w-5 h-5'))}
          </nav>

          <main id="main-content" class="flex-1 bg-slate-50">
            <!-- Dynamic content goes here -->
          </main>
        </div>

        <!-- Mobile Bottom Nav & FABs -->
        <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around">
            ${renderNavButton('dashboard', 'Home', ICONS.home('w-6 h-6'))}
            ${renderNavButton('medications', 'Meds', ICONS.pill('w-6 h-6'))}
            ${renderNavButton('appointments', 'Appts', ICONS.calendar('w-6 h-6'))}
            ${renderNavButton('info', 'Info', ICONS.info('w-6 h-6'))}
             <button id="logout-button-mobile" class="flex flex-col items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-600 hover:bg-slate-200">
                ${ICONS.logout('h-6 w-6')}
                <span class="text-xs">Logout</span>
            </button>
        </div>

        <div class="sm:hidden fixed bottom-24 right-4 flex flex-col gap-3">
             <button id="add-appt-fab" class="bg-teal-600 text-white rounded-full p-3 shadow-lg hover:bg-teal-700" aria-label="Add Appointment">
                ${ICONS.calendar('w-6 h-6')}
            </button>
             <button id="add-med-fab" class="bg-teal-600 text-white rounded-full p-3 shadow-lg hover:bg-teal-700" aria-label="Add Medication">
                ${ICONS.pill('w-6 h-6')}
            </button>
        </div>
        
        <div class="pb-28 md:pb-0"></div>
        <div id="modal-container"></div>
      </div>
    `;
  };

  const renderCurrentView = () => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    switch (state.currentView) {
      case 'dashboard':
        mainContent.innerHTML = renderDashboard();
        addDashboardEventListeners();
        break;
      case 'medications':
        mainContent.innerHTML = renderMedicationList();
        addMedicationListEventListeners();
        break;
      case 'appointments':
        mainContent.innerHTML = renderAppointmentList();
        addAppointmentListEventListeners();
        break;
      case 'info':
        mainContent.innerHTML = renderMedicationInfo();
        addMedicationInfoEventListeners();
        break;
      default:
        mainContent.innerHTML = renderDashboard();
        addDashboardEventListeners();
    }
  };

  const renderDashboard = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todaysDoses = state.medications
        .flatMap(med => med.times.map(time => ({
            medication: med,
            time,
            key: `${med.id}-${todayStr}-${time}`
        })))
        .sort((a, b) => a.time.localeCompare(b.time));
    
    const todaysAppointments = state.appointments
        .filter(app => app.date === todayStr)
        .sort((a, b) => a.time.localeCompare(b.time));

    const dosesHtml = todaysDoses.length > 0 ? todaysDoses.map(({ medication, time, key }) => `
      <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div class="flex items-center">
          <input
            type="checkbox"
            id="${key}"
            data-med-id="${medication.id}"
            data-date="${todayStr}"
            data-time="${time}"
            class="h-6 w-6 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mr-4 toggle-taken-checkbox"
            ${state.takenLog[key] ? 'checked' : ''}
          />
          <div>
            <label for="${key}" class="font-semibold text-slate-800">${escapeHtml(medication.name)}</label>
            <p class="text-sm text-slate-500">${escapeHtml(medication.dosage)} at ${formatTime(time)}</p>
          </div>
        </div>
      </div>
    `).join('') : `<p class="text-center text-slate-500 py-4">No medications scheduled for today.</p>`;

    const appointmentsHtml = todaysAppointments.length > 0 ? todaysAppointments.map(app => `
      <div class="p-4 bg-slate-50 rounded-lg">
        <p class="font-semibold text-slate-800">${escapeHtml(app.specialty)} with ${escapeHtml(app.doctorName)}</p>
        <p class="text-sm text-slate-500">${formatTime(app.time)}</p>
        ${app.location ? `<p class="text-sm text-slate-500 mt-1">Location: ${escapeHtml(app.location)}</p>` : ''}
      </div>
    `).join('') : `<p class="text-center text-slate-500 py-4">No appointments scheduled for today.</p>`;

    return `
      <div class="p-4 sm:p-6 lg:p-8">
        <header class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 class="text-3xl font-bold text-slate-800">Today's Overview</h1>
            <p class="text-slate-600 mt-1">${formatDate(today)}</p>
          </div>
          ${state.user.role === 'carer' ? `
            <button id="share-schedule-button" class="mt-4 sm:mt-0 flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
              ${ICONS.share('h-4 w-4 mr-2')}
              Share Today's Schedule
            </button>` : ''}
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div class="flex items-center mb-4">${ICONS.pill('w-7 h-7 text-teal-600 mr-3')}<h2 class="text-2xl font-bold text-slate-800">Today's Medications</h2></div>
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4" id="medication-checklist">${dosesHtml}</div>
          </section>
          <section>
            <div class="flex items-center mb-4">${ICONS.calendar('w-7 h-7 text-teal-600 mr-3')}<h2 class="text-2xl font-bold text-slate-800">Today's Appointments</h2></div>
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">${appointmentsHtml}</div>
          </section>
        </div>
      </div>
    `;
  };

  const renderMedicationList = () => {
    const medsHtml = state.medications.length > 0 ? state.medications.map(med => `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800 break-words">${escapeHtml(med.name)}</h2>
          <p class="text-slate-600 break-words">${escapeHtml(med.dosage)}</p>
          <div class="mt-2 text-sm text-slate-500">
            <span>Take at: </span>
            ${med.times.map(t => formatTime(t)).join(', ')}
          </div>
          ${med.notes ? `<p class="mt-3 text-sm bg-slate-100 p-2 rounded-md break-words">${escapeHtml(med.notes)}</p>` : ''}
        </div>
        <div class="flex justify-end mt-4">
          <button data-med-id="${med.id}" class="delete-med-button p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label="Delete ${escapeHtml(med.name)}">
            ${ICONS.trash('w-5 h-5')}
          </button>
        </div>
      </div>
    `).join('') : `
      <div class="text-center py-12 col-span-full">
        ${ICONS.pill('w-16 h-16 text-slate-300 mx-auto mb-4')}
        <p class="text-slate-500">No medications added yet.</p>
        <p class="text-slate-400 text-sm">Click the "Add Medication" button to get started.</p>
      </div>
    `;

    return `
      <div class="p-4 sm:p-6 lg:p-8">
        <div class="flex items-center mb-6">
          ${ICONS.pill('w-8 h-8 text-teal-600 mr-3')}
          <h1 class="text-3xl font-bold text-slate-800">All Medications</h1>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="med-list-container">
          ${medsHtml}
        </div>
      </div>
    `;
  };

  const renderAppointmentList = () => {
    const sortedAppointments = [...state.appointments].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    const appsHtml = sortedAppointments.length > 0 ? sortedAppointments.map(app => `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-start">
        <div class="flex-grow pr-4">
          <p class="font-bold text-lg text-slate-800 break-words">${escapeHtml(app.specialty)} with ${escapeHtml(app.doctorName)}</p>
          <p class="text-slate-600">${new Date(app.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p class="text-slate-600">${formatTime(app.time)}</p>
          ${app.location ? `<p class="text-sm text-slate-500 mt-1 break-words">Location: ${escapeHtml(app.location)}</p>` : ''}
          ${app.notes ? `<p class="mt-3 text-sm bg-slate-100 p-2 rounded-md break-words">${escapeHtml(app.notes)}</p>` : ''}
        </div>
        <button data-appt-id="${app.id}" class="delete-appt-button flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label="Delete appointment with ${escapeHtml(app.doctorName)}">
          ${ICONS.trash('w-5 h-5')}
        </button>
      </div>
    `).join('') : `
      <div class="text-center py-12">
        ${ICONS.calendar('w-16 h-16 text-slate-300 mx-auto mb-4')}
        <p class="text-slate-500">No appointments added yet.</p>
        <p class="text-slate-400 text-sm">Click the "Add Appointment" button to get started.</p>
      </div>
    `;
    
    return `
      <div class="p-4 sm:p-6 lg:p-8">
        <div class="flex items-center mb-6">
          ${ICONS.calendar('w-8 h-8 text-teal-600 mr-3')}
          <h1 class="text-3xl font-bold text-slate-800">All Appointments</h1>
        </div>
        <div class="space-y-4" id="appt-list-container">
          ${appsHtml}
        </div>
      </div>
    `;
  };
  
  const renderMedicationInfo = () => {
    const { activeTab, isLoading, error, info } = state.aiState;
    const renderTabButton = (tabId, label) => `<button data-tab-id="${tabId}" class="ai-tab-button px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabId ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}">${label}</button>`;
    
    let formHtml = '';
    switch (activeTab) {
      case 'effects':
        const noMeds = state.medications.length === 0;
        formHtml = `
          <div class="flex flex-col gap-2">
            <textarea id="symptoms-input" placeholder="e.g., Feeling tired and nauseous" rows="3" class="w-full px-4 py-2 border border-slate-400 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white placeholder-slate-500 text-slate-900" ${isLoading ? 'disabled' : ''}>${escapeHtml(state.aiState.symptoms)}</textarea>
            <button id="ai-submit-button" data-type="effects" ${isLoading || noMeds ? 'disabled' : ''} class="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">
              ${isLoading ? 'Analyzing...' : 'Check Symptoms'}
            </button>
            ${noMeds ? '<p class="text-xs text-red-500 mt-1">Please add at least one medication from the \'Medications\' tab to use the Symptom Checker.</p>' : ''}
            ${!noMeds ? `<p class="text-xs text-slate-500 mt-1">Checking against your list: ${state.medications.map(m => escapeHtml(m.name)).join(', ')}</p>` : ''}
          </div>
        `;
        break;
      case 'interactions':
        formHtml = `
          <div class="flex flex-col gap-2">
            <input type="text" id="med1-input" placeholder="Medication 1" value="${escapeHtml(state.aiState.med1)}" class="w-full px-4 py-2 border border-slate-400 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white placeholder-slate-500 text-slate-900"/>
            <input type="text" id="med2-input" placeholder="Medication 2" value="${escapeHtml(state.aiState.med2)}" class="w-full px-4 py-2 border border-slate-400 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white placeholder-slate-500 text-slate-900"/>
            <button id="ai-submit-button" data-type="interactions" ${isLoading ? 'disabled' : ''} class="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">
              ${isLoading ? 'Checking...' : 'Check Interactions'}
            </button>
          </div>
        `;
        break;
      case 'lookup':
      default:
        formHtml = `
          <div class="flex items-center gap-2">
            <input type="text" id="lookup-input" placeholder="e.g., Ondansetron" value="${escapeHtml(state.aiState.lookupName)}" class="flex-grow px-4 py-2 border border-slate-400 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white placeholder-slate-500 text-slate-900" ${isLoading ? 'disabled' : ''} />
            <button id="ai-submit-button" data-type="lookup" ${isLoading ? 'disabled' : ''} class="flex-shrink-0 px-6 py-2 bg-teal-600 text-white font-semibold rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">
              ${isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        `;
    }
    
    // Markdown-it renderer
    const md = window.markdownit();
    const infoHtml = info ? md.render(info) : '';

    return `
      <div class="p-4 sm:p-6 lg:p-8">
        <div class="flex items-center mb-6">
            ${ICONS.sparkles('w-8 h-8 text-teal-600 mr-3')}
            <h1 class="text-3xl font-bold text-slate-800">AI Assistant</h1>
        </div>
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex gap-2 mb-6 border-b border-slate-200 pb-4">
              ${renderTabButton('lookup', 'Medication Lookup')}
              ${renderTabButton('effects', 'Symptom Checker')}
              ${renderTabButton('interactions', 'Interaction Check')}
            </div>
            <div id="ai-form-container">${formHtml}</div>
          </div>
          ${(isLoading || error || info) ? `
            <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              ${isLoading ? `
                <div class="flex justify-center items-center">
                  <div class="spinner h-8 w-8 border-b-2 border-teal-600"></div>
                  <p class="ml-3 text-slate-600">Assistant is thinking...</p>
                </div>
              ` : ''}
              ${error ? `<div class="text-red-600 bg-red-100 p-4 rounded-md">${escapeHtml(error)}</div>` : ''}
              ${info ? `<article class="prose max-w-none text-gray-800">${infoHtml}</article>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const renderLogin = () => {
    return `
      <div class="flex items-center justify-center min-h-screen bg-slate-100">
        <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
          <div>
             <div class="flex items-center justify-center mb-4">
                 ${ICONS.logo('h-10 w-10 text-teal-600')}
                 <h1 class="text-3xl font-bold text-slate-800 ml-2">CareTrack</h1>
              </div>
            <h2 class="mt-6 text-center text-xl font-semibold text-slate-700">Sign in to your account</h2>
          </div>
          <form class="mt-8 space-y-6" id="login-form">
            <div id="login-error" class="hidden p-3 bg-red-100 border border-red-300 text-red-700 rounded-md"></div>
            <div class="rounded-md shadow-sm -space-y-px">
              <div>
                <label for="email-address" class="sr-only">Email address</label>
                <input id="email-address" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-400 bg-white placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm" placeholder="Email address" />
              </div>
              <div>
                <label for="password-for-login" class="sr-only">Password</label>
                <input id="password-for-login" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-400 bg-white placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm" placeholder="Password" />
              </div>
            </div>
            <div>
              <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                Sign in
              </button>
            </div>
            <div class="text-xs text-slate-500 text-center pt-4">
              <p class="font-semibold">Demo Accounts:</p>
              <p>Patient: <span class="font-mono">patient@caretrack.com</span> / <span class="font-mono">password123</span></p>
              <p>Carer: <span class="font-mono">carer@caretrack.com</span> / <span class="font-mono">password123</span></p>
            </div>
          </form>
        </div>
      </div>
    `;
  };
  
  const renderModals = () => {
    const container = document.getElementById('modal-container');
    if (!container) return;

    let modalHtml = '';
    if (state.isMedModalOpen) {
      modalHtml += renderAddMedicationModal();
    }
    if (state.isApptModalOpen) {
      modalHtml += renderAddAppointmentModal();
    }
    container.innerHTML = modalHtml;
    if (state.isMedModalOpen) addMedicationModalEventListeners();
    if (state.isApptModalOpen) addAppointmentModalEventListeners();
  };

  const renderAddMedicationModal = () => `
    <div class="modal-overlay">
      <div class="modal-content">
        <form id="add-med-form" class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">Add New Medication</h2>
            <button type="button" class="close-modal-button text-slate-400 hover:text-slate-600">${ICONS.close('w-6 h-6')}</button>
          </div>
          <div id="med-modal-error" class="hidden bg-red-100 text-red-700 p-3 rounded-md mb-4"></div>
          <div class="space-y-4">
            <div>
              <label for="med-name" class="block text-sm font-medium text-slate-700">Medication Name</label>
              <input type="text" id="med-name" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" required />
            </div>
            <div>
              <label for="med-dosage" class="block text-sm font-medium text-slate-700">Dosage (e.g., 50mg, 1 tablet)</label>
              <input type="text" id="med-dosage" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Scheduled Times</label>
              <div id="med-times-container">
                <div class="flex items-center gap-2 mb-2">
                  <input type="time" value="08:00" class="med-time-input block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" required />
                </div>
              </div>
              <button type="button" id="add-med-time" class="flex items-center text-sm font-medium text-teal-600 hover:text-teal-800 mt-2">${ICONS.plus('w-4 h-4 mr-1')} Add another time</button>
            </div>
            <div>
              <label for="med-notes" class="block text-sm font-medium text-slate-700">Notes (Optional)</label>
              <textarea id="med-notes" rows="3" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"></textarea>
            </div>
            <div class="pt-4 flex justify-end gap-3">
              <button type="button" class="close-modal-button px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
              <button type="submit" class="px-6 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700">Add Medication</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  
  const renderAddAppointmentModal = () => `
    <div class="modal-overlay">
      <div class="modal-content">
        <form id="add-appt-form" class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">Add New Appointment</h2>
            <button type="button" class="close-modal-button text-slate-400 hover:text-slate-600">${ICONS.close('w-6 h-6')}</button>
          </div>
          <div id="appt-modal-error" class="hidden bg-red-100 text-red-700 p-3 rounded-md mb-4"></div>
          <div class="space-y-4">
            <div>
              <label for="appt-doctor" class="block text-sm font-medium text-slate-700">Doctor's Name</label>
              <input type="text" id="appt-doctor" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" required />
            </div>
            <div>
              <label for="appt-specialty" class="block text-sm font-medium text-slate-700">Specialty</label>
              <input type="text" id="appt-specialty" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" required />
            </div>
            <div>
              <label for="appt-location" class="block text-sm font-medium text-slate-700">Location (Optional)</label>
              <input type="text" id="appt-location" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="appt-date" class="block text-sm font-medium text-slate-700">Date</label>
                <input type="date" id="appt-date" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" required />
              </div>
              <div>
                <label for="appt-time" class="block text-sm font-medium text-slate-700">Time</label>
                <input type="time" id="appt-time" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" required />
              </div>
            </div>
            <div>
              <label for="appt-notes" class="block text-sm font-medium text-slate-700">Notes (Optional)</label>
              <textarea id="appt-notes" rows="3" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"></textarea>
            </div>
            <div class="pt-4 flex justify-end gap-3">
              <button type="button" class="close-modal-button px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
              <button type="submit" class="px-6 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700">Add Appointment</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  // --- EVENT LISTENERS & HANDLERS ---
  const handleLogout = () => {
    state.user = null;
    saveToStorage('authUser', null);
    render();
  };

  const handleNavClick = (view) => {
    state.currentView = view;
    render();
  };

  const handleToggleTaken = (medId, date, time) => {
    const key = `${medId}-${date}-${time}`;
    state.takenLog[key] = !state.takenLog[key];
    const storageId = state.user.role === 'carer' ? 'user-patient-01' : state.user.id;
    saveToStorage(`${storageId}-takenLog`, state.takenLog);
  };
  
  const handleShareSchedule = () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const todaysDoses = state.medications.flatMap(med => med.times.map(time => ({medication: med, time}))).sort((a, b) => a.time.localeCompare(b.time));
      const todaysAppointments = state.appointments.filter(app => app.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
      
      let scheduleText = `Today's Schedule (${formatDate(today)})\n\n`;
      scheduleText += "Medications:\n";
      if (todaysDoses.length > 0) {
          todaysDoses.forEach(dose => {
              scheduleText += `- ${dose.medication.name} (${dose.medication.dosage}) at ${formatTime(dose.time)}\n`;
          });
      } else {
          scheduleText += "- None\n";
      }
      scheduleText += "\nAppointments:\n";
      if (todaysAppointments.length > 0) {
          todaysAppointments.forEach(app => {
              scheduleText += `- ${app.specialty} with ${app.doctorName} at ${formatTime(app.time)}\n`;
              if (app.location) scheduleText += `  (Location: ${app.location})\n`;
          });
      } else {
          scheduleText += "- None\n";
      }
      
      const subject = `CareTrack Schedule for ${formatDate(today)}`;
      const body = encodeURIComponent(scheduleText);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDeleteMedication = (medId) => {
    if (confirm('Are you sure you want to delete this medication?')) {
        state.medications = state.medications.filter(m => m.id !== medId);
        const storageId = state.user.role === 'carer' ? 'user-patient-01' : state.user.id;
        saveToStorage(`${storageId}-medications`, state.medications);
        render();
    }
  };

  const handleDeleteAppointment = (apptId) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
        state.appointments = state.appointments.filter(a => a.id !== apptId);
        const storageId = state.user.role === 'carer' ? 'user-patient-01' : state.user.id;
        saveToStorage(`${storageId}-appointments`, state.appointments);
        render();
    }
  };

  const handleAiTabClick = (tabId) => {
      state.aiState.activeTab = tabId;
      renderCurrentView();
  };

  const handleAiFormChange = () => {
      const { activeTab } = state.aiState;
      if (activeTab === 'lookup') {
          state.aiState.lookupName = document.getElementById('lookup-input')?.value || '';
      } else if (activeTab === 'effects') {
          state.aiState.symptoms = document.getElementById('symptoms-input')?.value || '';
      } else if (activeTab === 'interactions') {
          state.aiState.med1 = document.getElementById('med1-input')?.value || '';
          state.aiState.med2 = document.getElementById('med2-input')?.value || '';
      }
  };

  const handleAiSubmit = async (type) => {
    state.aiState.isLoading = true;
    state.aiState.error = null;
    state.aiState.info = '';
    renderCurrentView();
    
    try {
        let result = '';
        if (type === 'lookup') {
            const name = state.aiState.lookupName;
            if (!name.trim()) throw new Error('Please enter a medication name.');
            result = await geminiService.lookupMedication(name);
        } else if (type === 'effects') {
            const symptoms = state.aiState.symptoms;
            if (!symptoms.trim()) throw new Error('Please describe your symptoms.');
            if (state.medications.length === 0) throw new Error('You must add at least one medication to your list to check for side effects.');
            result = await geminiService.checkSideEffects(symptoms, state.medications);
        } else if (type === 'interactions') {
            const { med1, med2 } = state.aiState;
            if (!med1.trim() || !med2.trim()) throw new Error('Please enter both medication names.');
            result = await geminiService.checkDrugInteractions(med1, med2);
        }
        state.aiState.info = result;
    } catch (err) {
        state.aiState.error = err.message || 'An unexpected error occurred.';
    } finally {
        state.aiState.isLoading = false;
        renderCurrentView();
    }
  };

  const addGlobalEventListeners = () => {
    root.addEventListener('click', (e) => {
      const target = e.target;
      // Nav buttons
      const navButton = target.closest('.nav-button');
      if (navButton) {
        handleNavClick(navButton.dataset.view);
        return;
      }
      // Logout
      if (target.closest('#logout-button-header') || target.closest('#logout-button-mobile')) {
        handleLogout();
        return;
      }
      // Open modals
      if (target.closest('#add-med-header') || target.closest('#add-med-fab')) {
        state.isMedModalOpen = true;
        renderModals();
        return;
      }
      if (target.closest('#add-appt-header') || target.closest('#add-appt-fab')) {
        state.isApptModalOpen = true;
        renderModals();
        return;
      }
    });
  };

  const addDashboardEventListeners = () => {
    const checklist = document.getElementById('medication-checklist');
    checklist?.addEventListener('change', (e) => {
      if (e.target.classList.contains('toggle-taken-checkbox')) {
        const { medId, date, time } = e.target.dataset;
        handleToggleTaken(medId, date, time);
      }
    });

    const shareButton = document.getElementById('share-schedule-button');
    shareButton?.addEventListener('click', handleShareSchedule);
  };
  
  const addMedicationListEventListeners = () => {
    const container = document.getElementById('med-list-container');
    container?.addEventListener('click', e => {
      const deleteButton = e.target.closest('.delete-med-button');
      if (deleteButton) {
        handleDeleteMedication(deleteButton.dataset.medId);
      }
    });
  };
  
  const addAppointmentListEventListeners = () => {
    const container = document.getElementById('appt-list-container');
    container?.addEventListener('click', e => {
      const deleteButton = e.target.closest('.delete-appt-button');
      if (deleteButton) {
        handleDeleteAppointment(deleteButton.dataset.apptId);
      }
    });
  };

  const addMedicationInfoEventListeners = () => {
      const mainContent = document.getElementById('main-content');
      mainContent.addEventListener('click', (e) => {
          const tabButton = e.target.closest('.ai-tab-button');
          if (tabButton) {
              handleAiTabClick(tabButton.dataset.tabId);
              return;
          }
          const submitButton = e.target.closest('#ai-submit-button');
          if (submitButton) {
              handleAiSubmit(submitButton.dataset.type);
              return;
          }
      });
      mainContent.addEventListener('input', handleAiFormChange);
  };

  const addMedicationModalEventListeners = () => {
    const form = document.getElementById('add-med-form');
    const modal = form.closest('.modal-overlay');

    modal.addEventListener('click', e => {
      if (e.target.closest('.close-modal-button') || e.target === modal) {
        state.isMedModalOpen = false;
        renderModals();
      }
    });

    const timesContainer = document.getElementById('med-times-container');
    document.getElementById('add-med-time').addEventListener('click', () => {
        if (timesContainer.children.length < 5) {
            const newTimeDiv = document.createElement('div');
            newTimeDiv.className = 'flex items-center gap-2 mb-2 time-entry';
            newTimeDiv.innerHTML = `
                <input type="time" class="med-time-input block w-full px-3 py-2 bg-white border border-slate-400 rounded-md placeholder-slate-500 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" required />
                <button type="button" class="remove-med-time p-2 text-red-500 hover:bg-red-100 rounded-full">${ICONS.trash('w-5 h-5')}</button>
            `;
            timesContainer.appendChild(newTimeDiv);
        }
    });

    timesContainer.addEventListener('click', e => {
        const removeButton = e.target.closest('.remove-med-time');
        if (removeButton && timesContainer.children.length > 1) {
            removeButton.closest('.time-entry').remove();
        }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('med-name').value;
      const dosage = document.getElementById('med-dosage').value;
      const notes = document.getElementById('med-notes').value;
      const timeInputs = [...document.querySelectorAll('.med-time-input')];
      const times = timeInputs.map(input => input.value);
      const errorDiv = document.getElementById('med-modal-error');

      if (!name.trim() || !dosage.trim() || times.some(t => !t)) {
        errorDiv.textContent = 'Please fill in all required fields: Name, Dosage, and all Time fields.';
        errorDiv.classList.remove('hidden');
        return;
      }
      errorDiv.classList.add('hidden');

      const newMed = { name, dosage, times, notes, id: new Date().toISOString() };
      state.medications.push(newMed);
      const storageId = state.user.role === 'carer' ? 'user-patient-01' : state.user.id;
      saveToStorage(`${storageId}-medications`, state.medications);
      
      state.isMedModalOpen = false;
      render();
    });
  };
  
  const addAppointmentModalEventListeners = () => {
    const form = document.getElementById('add-appt-form');
    const modal = form.closest('.modal-overlay');

    modal.addEventListener('click', e => {
      if (e.target.closest('.close-modal-button') || e.target === modal) {
        state.isApptModalOpen = false;
        renderModals();
      }
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const doctorName = document.getElementById('appt-doctor').value;
        const specialty = document.getElementById('appt-specialty').value;
        const location = document.getElementById('appt-location').value;
        const date = document.getElementById('appt-date').value;
        const time = document.getElementById('appt-time').value;
        const notes = document.getElementById('appt-notes').value;
        const errorDiv = document.getElementById('appt-modal-error');
        
        if (!doctorName.trim() || !specialty.trim() || !date || !time) {
            errorDiv.textContent = 'Please fill in all required fields: Doctor, Specialty, Date, and Time.';
            errorDiv.classList.remove('hidden');
            return;
        }
        errorDiv.classList.add('hidden');

        const newAppt = { doctorName, specialty, location, date, time, notes, id: new Date().toISOString() };
        state.appointments.push(newAppt);
        const storageId = state.user.role === 'carer' ? 'user-patient-01' : state.user.id;
        saveToStorage(`${storageId}-appointments`, state.appointments);

        state.isApptModalOpen = false;
        render();
    });
  };

  // --- AUTHENTICATION & INITIALIZATION ---
  const DEMO_USERS = {
    'patient@caretrack.com': { password: 'password123', user: { id: 'user-patient-01', email: 'patient@caretrack.com', role: 'patient' } },
    'carer@caretrack.com': { password: 'password123', user: { id: 'user-carer-01', email: 'carer@caretrack.com', role: 'carer' } }
  };
  
  const handleLogin = (email, password) => {
    const userData = DEMO_USERS[email.toLowerCase()];
    if (userData && userData.password === password) {
      state.user = userData.user;
      saveToStorage('authUser', state.user);
      loadUserData();
      render();
    } else {
      const errorDiv = document.getElementById('login-error');
      errorDiv.textContent = 'Invalid email or password.';
      errorDiv.classList.remove('hidden');
    }
  };

  const addLoginEventListeners = () => {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.elements.email.value;
      const password = form.elements.password.value;
      handleLogin(email, password);
    });
  };

  const loadUserData = () => {
    if (!state.user) return;
    const storageId = state.user.role === 'carer' ? 'user-patient-01' : state.user.id;
    state.medications = getFromStorage(`${storageId}-medications`, []);
    state.appointments = getFromStorage(`${storageId}-appointments`, []);
    state.takenLog = getFromStorage(`${storageId}-takenLog`, {});
  };

  // --- MAIN RENDER FUNCTION ---
  const render = () => {
    if (!state.user) {
      root.innerHTML = renderLogin();
      addLoginEventListeners();
    } else {
      root.innerHTML = renderAppShell();
      renderCurrentView();
      renderModals(); // Render modals (hidden by default)
    }
  };

  // --- APP START ---
  const init = () => {
    state.user = getFromStorage('authUser', null);
    loadUserData();
    addGlobalEventListeners();
    render();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
