import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

type Language = 'uz' | 'ru' | 'en';

type SettingsStore = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
};

const LANG_KEY = 'app_language';

export const useSettingsStore = create<SettingsStore>((set) => ({
  language: 'uz',

  setLanguage: async (lang) => {
    set({ language: lang });
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  },

  loadLanguage: async () => {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved) {
      const lang = saved as Language;
      set({ language: lang });
      await i18n.changeLanguage(lang);
    }
  },
}));