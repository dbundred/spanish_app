/**
 * Enhanced Spanish Audio TTS Service
 * Ranks system voices for naturalness & human tone (Google, Premium, Neural, Natural)
 */

class AudioService {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public getSpanishVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const all = this.synth.getVoices();
    const esVoices = all.filter(v => v.lang.toLowerCase().startsWith('es'));

    return esVoices.sort((a, b) => {
      const rank = (v: SpeechSynthesisVoice) => {
        const name = v.name.toLowerCase();
        if (name.includes('google') || name.includes('natural') || name.includes('neural') || name.includes('premium') || name.includes('enhanced')) return 3;
        if (name.includes('monica') || name.includes('jorge') || name.includes('francisca') || name.includes('diego') || name.includes('paulina') || name.includes('marisol')) return 2;
        if (v.lang === 'es-ES' || v.lang === 'es-MX') return 1;
        return 0;
      };
      return rank(b) - rank(a);
    });
  }

  public speakSpanish(text: string, preferredVoiceName?: string, rate: number = 0.92, pitch: number = 1.0): void {
    if (!this.synth) return;

    this.synth.cancel();

    const cleanText = text.replace(/___/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = rate;
    utterance.pitch = pitch;

    const available = this.getSpanishVoices();
    let chosenVoice: SpeechSynthesisVoice | undefined;

    if (preferredVoiceName) {
      chosenVoice = available.find(v => v.name === preferredVoiceName);
    }

    if (!chosenVoice && available.length > 0) {
      chosenVoice = available[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const audioService = new AudioService();
