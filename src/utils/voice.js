/**
 * Enhanced Voice Features Utility for React
 * - Text-to-Speech
 * - Speech Recognition
 */

export const VoiceFeatures = {
    currentUtterance: null,
    isReading: false,

    /**
     * Read text aloud
     */
    readText(text, options = {}) {
        this.stopReading();

        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        // Function to select a voice
        const setVoice = () => {
            const voices = speechSynthesis.getVoices();
            // Look for a high-quality Google English voice or any English voice
            const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                voices.find(v => v.lang.startsWith('en')) ||
                voices[0];

            if (englishVoice) {
                utterance.voice = englishVoice;
            }
        };

        setVoice();

        // If voices aren't loaded yet, try again when they are
        if (!utterance.voice) {
            speechSynthesis.onvoiceschanged = () => {
                setVoice();
                if (utterance.voice) {
                    speechSynthesis.speak(utterance);
                    speechSynthesis.onvoiceschanged = null;
                }
            };
        } else {
            speechSynthesis.speak(utterance);
        }

        if (options.onEnd) {
            utterance.onend = options.onEnd;
        }

        this.isReading = true;
        return utterance;
    },

    /**
     * Stop reading
     */
    stopReading() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        this.isReading = false;
    }
};

export const VoiceInput = {
    recognition: null,
    isListening: false,

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return false;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        return true;
    },

    startListening(onResult, onError, onEnd) {
        if (!this.recognition) {
            if (!this.init()) return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        this.recognition.onstart = () => {
            this.isListening = true;
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            onResult(finalTranscript, interimTranscript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            if (onError) onError(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (onEnd) onEnd();
        };

        this.recognition.start();
    },

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
};
