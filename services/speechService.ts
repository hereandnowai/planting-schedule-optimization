
interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface SpeechRecognitionOptions {
  lang?: string;
}

interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any | null = null;

export const speechService = {
  isSupported: (): boolean => !!SpeechRecognitionAPI,

  startListening: (callbacks: SpeechRecognitionCallbacks, options?: SpeechRecognitionOptions): void => {
    if (!SpeechRecognitionAPI) {
      callbacks.onError("Speech recognition is not supported in this browser.");
      return;
    }

    if (recognition) {
      recognition.stop(); // Stop any previous instance
    }

    recognition = new SpeechRecognitionAPI();
    recognition.continuous = false; // Process speech after a pause
    recognition.interimResults = true; // Get interim results
    recognition.lang = options?.lang || 'en-US'; // Set language from options or default

    recognition.onstart = () => {
      if (callbacks.onStart) {
        callbacks.onStart();
      }
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        callbacks.onResult(finalTranscript, true);
      } else if (interimTranscript) {
        callbacks.onResult(interimTranscript, false);
      }
    };

    recognition.onerror = (event: any) => {
      let errorMessage = "An unknown speech recognition error occurred.";
      if (event.error === 'no-speech') {
        errorMessage = `No speech was detected. Please try again. (Lang: ${recognition.lang})`;
      } else if (event.error === 'audio-capture') {
        errorMessage = "Audio capture failed. Ensure microphone is enabled.";
      } else if (event.error === 'not-allowed') {
        errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
      } else if (event.error === 'network') {
        errorMessage = "Network error during speech recognition.";
      } else if (event.error === 'language-not-supported') {
        errorMessage = `The selected language (${recognition.lang}) is not supported by speech recognition.`;
      }
      callbacks.onError(errorMessage);
      if (callbacks.onEnd) {
        callbacks.onEnd();
      }
    };

    recognition.onend = () => {
      if (callbacks.onEnd) {
        callbacks.onEnd();
      }
      recognition = null; // Clean up
    };

    recognition.start();
  },

  stopListening: (): void => {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
  },
};