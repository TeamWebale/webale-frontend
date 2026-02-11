import { createContext, useContext, useState, useEffect } from 'react';

// Language definitions
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'lg', name: 'Luganda', flag: '🇺🇬', dir: 'ltr' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
];

// Translation strings
const translations = {
  en: {
    // Common
    app_name: 'Webale',
    app_tagline: 'Private Group Fundraising',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    download: 'Download',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied!',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    yes: 'Yes',
    no: 'No',
    or: 'or',
    and: 'and',
    all: 'All',
    none: 'None',
    optional: 'Optional',
    required: 'Required',

    // Navigation
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_profile: 'Profile',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    nav_login: 'Login',
    nav_register: 'Register',

    // Auth
    auth_login: 'Login',
    auth_register: 'Register',
    auth_email: 'Email',
    auth_password: 'Password',
    auth_confirm_password: 'Confirm Password',
    auth_first_name: 'First Name',
    auth_last_name: 'Last Name',
    auth_country: 'Country',
    auth_forgot_password: 'Forgot Password?',
    auth_no_account: "Don't have an account?",
    auth_have_account: 'Already have an account?',
    auth_login_success: 'Login successful!',
    auth_register_success: 'Account created successfully!',
    auth_logout_success: 'Logged out successfully',

    // Dashboard
    dashboard_title: 'Dashboard',
    dashboard_welcome: 'Welcome back',
    dashboard_my_groups: 'My Groups',
    dashboard_recent_activity: 'Recent Activity',
    dashboard_quick_stats: 'Quick Stats',
    dashboard_no_groups: 'No groups yet',
    dashboard_create_first: 'Create your first group to get started!',
    dashboard_total_pledged: 'Total Pledged',
    dashboard_total_received: 'Total Received',
    dashboard_groups_count: 'Groups',
    dashboard_pledges_count: 'Pledges',

    // Groups
    group_create: 'Create Group',
    group_create_new: 'Create New Group',
    group_name: 'Group Name',
    group_description: 'Description',
    group_goal: 'Goal Amount',
    group_currency: 'Currency',
    group_deadline: 'Deadline',
    group_members: 'Members',
    group_pledges: 'Pledges',
    group_activity: 'Activity',
    group_settings: 'Settings',
    group_admin: 'Admin',
    group_leave: 'Leave Group',
    group_delete: 'Delete Group',
    group_invite: 'Invite Members',
    group_join: 'Join Group',
    group_overview: 'Overview',
    group_no_members: 'No members yet',
    group_no_pledges: 'No pledges yet',
    group_progress: 'Progress',
    group_pledged_amount: 'Pledged',
    group_received_amount: 'Received',
    group_remaining: 'Remaining',

    // Pledges
    pledge_make: 'Make Pledge',
    pledge_amount: 'Amount',
    pledge_due_date: 'Due Date',
    pledge_notes: 'Notes',
    pledge_anonymous: 'Make Anonymous',
    pledge_status: 'Status',
    pledge_status_pending: 'Pending',
    pledge_status_partial: 'Partial',
    pledge_status_paid: 'Paid',
    pledge_mark_paid: 'Mark as Paid',
    pledge_record_payment: 'Record Payment',
    pledge_total: 'Total Pledged',
    pledge_paid: 'Total Paid',
    pledge_your_pledges: 'Your Pledges',
    pledge_all_pledges: 'All Pledges',

    // Recurring Pledges
    recurring_title: 'Recurring Pledges',
    recurring_setup: 'Set Up Recurring',
    recurring_frequency: 'Frequency',
    recurring_weekly: 'Weekly',
    recurring_biweekly: 'Every 2 Weeks',
    recurring_monthly: 'Monthly',
    recurring_quarterly: 'Quarterly',
    recurring_start_date: 'Start Date',
    recurring_end_date: 'End Date',
    recurring_next_due: 'Next Due',
    recurring_active: 'Active',
    recurring_cancelled: 'Cancelled',
    recurring_cancel: 'Cancel Recurring',

    // Members
    member_role: 'Role',
    member_role_admin: 'Admin',
    member_role_member: 'Member',
    member_joined: 'Joined',
    member_remove: 'Remove',
    member_promote: 'Promote to Admin',
    member_demote: 'Demote to Member',

    // Invite
    invite_title: 'Invite Members',
    invite_email: 'Email Addresses',
    invite_email_hint: 'Comma-separated emails',
    invite_generate: 'Generate Links',
    invite_link: 'Invite Link',
    invite_via_whatsapp: 'Share via WhatsApp',
    invite_via_email: 'Share via Email',
    invite_via_sms: 'Share via SMS',
    invite_qr_code: 'QR Code',
    invite_download_qr: 'Download QR',

    // Export & Reports
    export_data: 'Export Data',
    export_pledges: 'Export Pledges',
    export_members: 'Export Members',
    export_all: 'Export All',
    export_format: 'Format',
    export_excel: 'Excel (.xlsx)',
    export_csv: 'CSV',
    report_generate: 'Generate Report',
    report_pdf: 'PDF Report',
    report_summary: 'Summary Report',

    // Messages
    messages_title: 'Messages',
    messages_send: 'Send',
    messages_type_here: 'Type a message...',
    messages_no_messages: 'No messages yet',

    // Notifications
    notifications_title: 'Notifications',
    notifications_none: 'No notifications',
    notifications_mark_read: 'Mark as Read',
    notifications_clear_all: 'Clear All',

    // Audit Trail
    audit_title: 'Audit Trail',
    audit_all: 'All Activity',
    audit_members: 'Member Activity',
    audit_pledges: 'Pledge Activity',
    audit_admin: 'Admin Activity',

    // Templates
    template_choose: 'Choose a Template',
    template_wedding: 'Wedding Fund',
    template_memorial: 'Memorial Fund',
    template_medical: 'Medical Expenses',
    template_education: 'Education Fund',
    template_startup: 'Business Startup',
    template_community: 'Community Project',
    template_charity: 'Charity Drive',
    template_travel: 'Group Trip',
    template_custom: 'Custom',

    // Currency Converter
    converter_title: 'Currency Converter',
    converter_from: 'From',
    converter_to: 'To',
    converter_amount: 'Amount',
    converter_result: 'Result',

    // Errors & Success
    error_generic: 'Something went wrong',
    error_network: 'Network error. Please try again.',
    error_unauthorized: 'Please login to continue',
    error_not_found: 'Not found',
    error_required_field: 'This field is required',
    error_invalid_email: 'Invalid email address',
    error_password_mismatch: 'Passwords do not match',
    success_saved: 'Saved successfully!',
    success_deleted: 'Deleted successfully!',
    success_updated: 'Updated successfully!',
    success_created: 'Created successfully!',

    // Time
    time_just_now: 'Just now',
    time_minutes_ago: '{n} minutes ago',
    time_hours_ago: '{n} hours ago',
    time_days_ago: '{n} days ago',
    time_weeks_ago: '{n} weeks ago',
  },

  lg: {
    // Common - Luganda
    app_name: 'Webale',
    app_tagline: 'Okukuŋŋaanya Ssente mu Kibiina',
    loading: 'Kirimu okulonda...',
    save: 'Tereka',
    cancel: 'Sazaamu',
    delete: 'Sazaamu',
    edit: 'Kyusa',
    close: 'Ggalawo',
    confirm: 'Kakasa',
    search: 'Noonya',
    filter: 'Londawo',
    export: 'Fulumya',
    download: 'Dawunilooda',
    share: 'Gabana',
    copy: 'Koppa',
    copied: 'Bikoppeddwa!',
    submit: 'Weereza',
    back: 'Dda emabega',
    next: 'Ekiddako',
    yes: 'Yee',
    no: 'Nedda',
    optional: 'Si kyetaagisa',
    required: 'Kyetaagisa',

    // Navigation
    nav_home: 'Awaka',
    nav_dashboard: 'Dashiboodi',
    nav_profile: 'Ebikukwatako',
    nav_settings: 'Enteekateeka',
    nav_logout: 'Fuluma',
    nav_login: 'Yingira',
    nav_register: 'Wandiikibwe',

    // Auth
    auth_login: 'Yingira',
    auth_register: 'Wandiikibwe',
    auth_email: 'Emeyilo',
    auth_password: 'Ekigambo ekyama',
    auth_confirm_password: 'Kakasa ekigambo ekyama',
    auth_first_name: 'Erinnya Eryasooka',
    auth_last_name: 'Erinnya Eryasembyeyo',
    auth_country: 'Ensi',
    auth_forgot_password: 'Werabidde ekigambo ekyama?',
    auth_no_account: "Tolina akawunti?",
    auth_have_account: 'Olina akawunti dda?',
    auth_login_success: 'Oyingidde bulungi!',
    auth_register_success: 'Akawunti yo etondeddwa!',
    auth_logout_success: 'Ofulumye bulungi',

    // Dashboard
    dashboard_title: 'Dashiboodi',
    dashboard_welcome: 'Tukusanyukira',
    dashboard_my_groups: 'Ebibiina Byange',
    dashboard_recent_activity: 'Ebyabaddewo',
    dashboard_quick_stats: 'Obubaka Obwangu',
    dashboard_no_groups: 'Toli mu kibiina kyonna',
    dashboard_create_first: 'Tandika ekibiina ekyasooka!',
    dashboard_total_pledged: 'Byonna Ebyasuubizibwa',
    dashboard_total_received: 'Byonna Ebyfunidwa',
    dashboard_groups_count: 'Ebibiina',
    dashboard_pledges_count: 'Ebyasuubizibwa',

    // Groups
    group_create: 'Tandika Ekibiina',
    group_create_new: 'Tandika Ekibiina Ekipya',
    group_name: 'Erinnya ly\'Ekibiina',
    group_description: 'Ennyinyonnyola',
    group_goal: 'Ekigendererwa',
    group_currency: 'Ensimbi',
    group_deadline: 'Olunaku Olusembayo',
    group_members: 'Abakibiina',
    group_pledges: 'Ebyasuubizibwa',
    group_activity: 'Ebyabaddewo',
    group_settings: 'Enteekateeka',
    group_admin: 'Omukulembeze',
    group_leave: 'Va mu Kibiina',
    group_delete: 'Sazaamu Ekibiina',
    group_invite: 'Kuba Abantu',
    group_join: 'Yingira mu Kibiina',
    group_overview: 'Endabika',
    group_progress: 'Entambula',
    group_pledged_amount: 'Ebyasuubizibwa',
    group_received_amount: 'Ebifunidwa',
    group_remaining: 'Ebisigaddewo',

    // Pledges
    pledge_make: 'Suubiza',
    pledge_amount: 'Omuwendo',
    pledge_due_date: 'Olunaku lw\'okusasula',
    pledge_notes: 'Ebigambo',
    pledge_anonymous: 'Kweka erinnya',
    pledge_status: 'Embeera',
    pledge_status_pending: 'Kyalindirira',
    pledge_status_partial: 'Ekitundu',
    pledge_status_paid: 'Kisasuldwa',
    pledge_mark_paid: 'Laga nti Kisasuldwa',
    pledge_record_payment: 'Wandiika Okusasula',
    pledge_total: 'Byonna Ebyasuubizibwa',
    pledge_paid: 'Byonna Ebisasuldwa',

    // Members
    member_role: 'Ekifo',
    member_role_admin: 'Omukulembeze',
    member_role_member: 'Memba',
    member_joined: 'Yayingira',
    member_remove: 'Ggyawo',
    member_promote: 'Fuula Omukulembeze',

    // Invite
    invite_title: 'Kuba Abantu',
    invite_email: 'Emeyilo',
    invite_generate: 'Kola Enyunzi',
    invite_link: 'Enyunzi',
    invite_via_whatsapp: 'Gabana ku WhatsApp',
    invite_qr_code: 'QR Code',

    // Time
    time_just_now: 'Kaakano',
    time_minutes_ago: 'Eddakiika {n} eziyise',
    time_hours_ago: 'Essaawa {n} eziyise',
    time_days_ago: 'Ennaku {n} eziyise',
  },

  sw: {
    // Common - Swahili
    app_name: 'Webale',
    app_tagline: 'Ukusanyaji wa Fedha kwa Kikundi',
    loading: 'Inapakia...',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    delete: 'Futa',
    edit: 'Hariri',
    close: 'Funga',
    confirm: 'Thibitisha',
    search: 'Tafuta',
    filter: 'Chuja',
    export: 'Hamisha',
    download: 'Pakua',
    share: 'Shiriki',
    copy: 'Nakili',
    copied: 'Imenakiliwa!',
    submit: 'Wasilisha',
    back: 'Rudi',
    next: 'Ifuatayo',
    yes: 'Ndiyo',
    no: 'Hapana',
    optional: 'Si lazima',
    required: 'Inahitajika',

    // Navigation
    nav_home: 'Nyumbani',
    nav_dashboard: 'Dashibodi',
    nav_profile: 'Wasifu',
    nav_settings: 'Mipangilio',
    nav_logout: 'Ondoka',
    nav_login: 'Ingia',
    nav_register: 'Jisajili',

    // Auth
    auth_login: 'Ingia',
    auth_register: 'Jisajili',
    auth_email: 'Barua pepe',
    auth_password: 'Nenosiri',
    auth_confirm_password: 'Thibitisha nenosiri',
    auth_first_name: 'Jina la kwanza',
    auth_last_name: 'Jina la mwisho',
    auth_country: 'Nchi',
    auth_forgot_password: 'Umesahau nenosiri?',
    auth_no_account: 'Huna akaunti?',
    auth_have_account: 'Una akaunti tayari?',
    auth_login_success: 'Umeingia kwa mafanikio!',
    auth_register_success: 'Akaunti imeundwa!',

    // Dashboard
    dashboard_title: 'Dashibodi',
    dashboard_welcome: 'Karibu tena',
    dashboard_my_groups: 'Vikundi Vyangu',
    dashboard_recent_activity: 'Shughuli za Hivi Karibuni',
    dashboard_quick_stats: 'Takwimu za Haraka',
    dashboard_no_groups: 'Hakuna vikundi bado',
    dashboard_create_first: 'Unda kikundi chako cha kwanza!',
    dashboard_total_pledged: 'Jumla ya Ahadi',
    dashboard_total_received: 'Jumla Iliyopokelewa',
    dashboard_groups_count: 'Vikundi',
    dashboard_pledges_count: 'Ahadi',

    // Groups
    group_create: 'Unda Kikundi',
    group_create_new: 'Unda Kikundi Kipya',
    group_name: 'Jina la Kikundi',
    group_description: 'Maelezo',
    group_goal: 'Lengo',
    group_currency: 'Sarafu',
    group_deadline: 'Tarehe ya Mwisho',
    group_members: 'Wanachama',
    group_pledges: 'Ahadi',
    group_activity: 'Shughuli',
    group_admin: 'Msimamizi',
    group_leave: 'Ondoka Kikundi',
    group_delete: 'Futa Kikundi',
    group_invite: 'Alika Wanachama',
    group_join: 'Jiunge na Kikundi',
    group_overview: 'Muhtasari',
    group_progress: 'Maendeleo',
    group_pledged_amount: 'Kiasi cha Ahadi',
    group_received_amount: 'Kiasi Kilichopokelewa',

    // Pledges
    pledge_make: 'Toa Ahadi',
    pledge_amount: 'Kiasi',
    pledge_due_date: 'Tarehe ya Kulipa',
    pledge_notes: 'Maelezo',
    pledge_anonymous: 'Fanya Siri',
    pledge_status: 'Hali',
    pledge_status_pending: 'Inasubiri',
    pledge_status_partial: 'Sehemu',
    pledge_status_paid: 'Imelipwa',
    pledge_mark_paid: 'Weka kama Imelipwa',
    pledge_record_payment: 'Rekodi Malipo',

    // Members
    member_role: 'Jukumu',
    member_role_admin: 'Msimamizi',
    member_role_member: 'Mwanachama',
    member_joined: 'Alijiunga',

    // Invite
    invite_title: 'Alika Wanachama',
    invite_via_whatsapp: 'Shiriki kupitia WhatsApp',
    invite_qr_code: 'Msimbo wa QR',

    // Time
    time_just_now: 'Sasa hivi',
    time_minutes_ago: 'Dakika {n} zilizopita',
    time_hours_ago: 'Masaa {n} yaliyopita',
    time_days_ago: 'Siku {n} zilizopita',
  },

  fr: {
    // Common - French
    app_name: 'Webale',
    app_tagline: 'Collecte de Fonds de Groupe Privé',
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    confirm: 'Confirmer',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    download: 'Télécharger',
    share: 'Partager',
    copy: 'Copier',
    copied: 'Copié!',
    submit: 'Soumettre',
    back: 'Retour',
    next: 'Suivant',
    yes: 'Oui',
    no: 'Non',
    optional: 'Optionnel',
    required: 'Requis',

    // Navigation
    nav_home: 'Accueil',
    nav_dashboard: 'Tableau de Bord',
    nav_profile: 'Profil',
    nav_settings: 'Paramètres',
    nav_logout: 'Déconnexion',
    nav_login: 'Connexion',
    nav_register: 'Inscription',

    // Auth
    auth_login: 'Connexion',
    auth_register: 'Inscription',
    auth_email: 'Email',
    auth_password: 'Mot de passe',
    auth_confirm_password: 'Confirmer le mot de passe',
    auth_first_name: 'Prénom',
    auth_last_name: 'Nom',
    auth_country: 'Pays',
    auth_forgot_password: 'Mot de passe oublié?',
    auth_no_account: "Pas de compte?",
    auth_have_account: 'Déjà un compte?',
    auth_login_success: 'Connexion réussie!',
    auth_register_success: 'Compte créé avec succès!',

    // Dashboard
    dashboard_title: 'Tableau de Bord',
    dashboard_welcome: 'Bon retour',
    dashboard_my_groups: 'Mes Groupes',
    dashboard_recent_activity: 'Activité Récente',
    dashboard_quick_stats: 'Statistiques Rapides',
    dashboard_no_groups: 'Pas encore de groupes',
    dashboard_create_first: 'Créez votre premier groupe!',
    dashboard_total_pledged: 'Total Promis',
    dashboard_total_received: 'Total Reçu',
    dashboard_groups_count: 'Groupes',
    dashboard_pledges_count: 'Promesses',

    // Groups
    group_create: 'Créer un Groupe',
    group_create_new: 'Créer un Nouveau Groupe',
    group_name: 'Nom du Groupe',
    group_description: 'Description',
    group_goal: 'Objectif',
    group_currency: 'Devise',
    group_deadline: 'Date Limite',
    group_members: 'Membres',
    group_pledges: 'Promesses',
    group_activity: 'Activité',
    group_admin: 'Administrateur',
    group_leave: 'Quitter le Groupe',
    group_delete: 'Supprimer le Groupe',
    group_invite: 'Inviter des Membres',
    group_join: 'Rejoindre le Groupe',
    group_overview: 'Aperçu',
    group_progress: 'Progression',
    group_pledged_amount: 'Montant Promis',
    group_received_amount: 'Montant Reçu',

    // Pledges
    pledge_make: 'Faire une Promesse',
    pledge_amount: 'Montant',
    pledge_due_date: 'Date d\'échéance',
    pledge_notes: 'Notes',
    pledge_anonymous: 'Anonyme',
    pledge_status: 'Statut',
    pledge_status_pending: 'En attente',
    pledge_status_partial: 'Partiel',
    pledge_status_paid: 'Payé',
    pledge_mark_paid: 'Marquer comme Payé',
    pledge_record_payment: 'Enregistrer Paiement',

    // Members
    member_role: 'Rôle',
    member_role_admin: 'Administrateur',
    member_role_member: 'Membre',
    member_joined: 'Rejoint',

    // Invite
    invite_title: 'Inviter des Membres',
    invite_via_whatsapp: 'Partager via WhatsApp',
    invite_qr_code: 'Code QR',

    // Time
    time_just_now: 'À l\'instant',
    time_minutes_ago: 'Il y a {n} minutes',
    time_hours_ago: 'Il y a {n} heures',
    time_days_ago: 'Il y a {n} jours',
  },

  es: {
    // Common - Spanish
    app_name: 'Webale',
    app_tagline: 'Recaudación de Fondos Grupal Privada',
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    confirm: 'Confirmar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    download: 'Descargar',
    share: 'Compartir',
    copy: 'Copiar',
    copied: '¡Copiado!',
    submit: 'Enviar',
    back: 'Volver',
    next: 'Siguiente',
    yes: 'Sí',
    no: 'No',
    optional: 'Opcional',
    required: 'Requerido',

    // Navigation
    nav_home: 'Inicio',
    nav_dashboard: 'Panel',
    nav_profile: 'Perfil',
    nav_settings: 'Configuración',
    nav_logout: 'Cerrar Sesión',
    nav_login: 'Iniciar Sesión',
    nav_register: 'Registrarse',

    // Auth
    auth_login: 'Iniciar Sesión',
    auth_register: 'Registrarse',
    auth_email: 'Correo Electrónico',
    auth_password: 'Contraseña',
    auth_confirm_password: 'Confirmar Contraseña',
    auth_first_name: 'Nombre',
    auth_last_name: 'Apellido',
    auth_country: 'País',
    auth_forgot_password: '¿Olvidaste tu contraseña?',
    auth_no_account: '¿No tienes cuenta?',
    auth_have_account: '¿Ya tienes cuenta?',
    auth_login_success: '¡Sesión iniciada!',
    auth_register_success: '¡Cuenta creada!',

    // Dashboard
    dashboard_title: 'Panel',
    dashboard_welcome: 'Bienvenido de nuevo',
    dashboard_my_groups: 'Mis Grupos',
    dashboard_recent_activity: 'Actividad Reciente',
    dashboard_quick_stats: 'Estadísticas Rápidas',
    dashboard_no_groups: 'Sin grupos aún',
    dashboard_create_first: '¡Crea tu primer grupo!',
    dashboard_total_pledged: 'Total Prometido',
    dashboard_total_received: 'Total Recibido',
    dashboard_groups_count: 'Grupos',
    dashboard_pledges_count: 'Promesas',

    // Groups
    group_create: 'Crear Grupo',
    group_create_new: 'Crear Nuevo Grupo',
    group_name: 'Nombre del Grupo',
    group_description: 'Descripción',
    group_goal: 'Meta',
    group_currency: 'Moneda',
    group_deadline: 'Fecha Límite',
    group_members: 'Miembros',
    group_pledges: 'Promesas',
    group_activity: 'Actividad',
    group_admin: 'Administrador',
    group_leave: 'Salir del Grupo',
    group_delete: 'Eliminar Grupo',
    group_invite: 'Invitar Miembros',
    group_join: 'Unirse al Grupo',
    group_overview: 'Resumen',
    group_progress: 'Progreso',
    group_pledged_amount: 'Monto Prometido',
    group_received_amount: 'Monto Recibido',

    // Pledges
    pledge_make: 'Hacer Promesa',
    pledge_amount: 'Monto',
    pledge_due_date: 'Fecha de Vencimiento',
    pledge_notes: 'Notas',
    pledge_anonymous: 'Anónimo',
    pledge_status: 'Estado',
    pledge_status_pending: 'Pendiente',
    pledge_status_partial: 'Parcial',
    pledge_status_paid: 'Pagado',
    pledge_mark_paid: 'Marcar como Pagado',
    pledge_record_payment: 'Registrar Pago',

    // Members
    member_role: 'Rol',
    member_role_admin: 'Administrador',
    member_role_member: 'Miembro',
    member_joined: 'Se unió',

    // Invite
    invite_title: 'Invitar Miembros',
    invite_via_whatsapp: 'Compartir por WhatsApp',
    invite_qr_code: 'Código QR',

    // Time
    time_just_now: 'Ahora mismo',
    time_minutes_ago: 'Hace {n} minutos',
    time_hours_ago: 'Hace {n} horas',
    time_days_ago: 'Hace {n} días',
  }
};

// Fill in missing translations with English fallback
Object.keys(translations).forEach(lang => {
  if (lang !== 'en') {
    Object.keys(translations.en).forEach(key => {
      if (!translations[lang][key]) {
        translations[lang][key] = translations.en[key];
      }
    });
  }
});

// Create context
const LanguageContext = createContext(null);

// Provider component
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    const langInfo = LANGUAGES.find(l => l.code === language);
    if (langInfo) {
      document.documentElement.dir = langInfo.dir;
    }
  }, [language]);

  // Translation function
  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations.en[key] || key;
    
    // Replace parameters like {n} with values
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  // Get current language info
  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      currentLanguage,
      languages: LANGUAGES 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
