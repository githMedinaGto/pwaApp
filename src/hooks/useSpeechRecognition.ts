import { useEffect, useState } from "react";

let recognition: any = null;
if (`webkitSpeechRecognition` in window) {
    recognition = new webkitSpeechRecognition();

    recognition.continuos = true;

    recognition.lang = 'es-ES';
}

const useSpeechRecognition = () => {
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            console.warn('onresult event: ', event);
            setText(event.results[0][0].transcript);
            recognition.stop(); // Aquí detenemos el reconocimiento correctamente
        }
    }, []);

    const startListening = () => {
        setText('')
        setIsListening(true)
        recognition.start()
    }

    const stopListening = () => {
        setIsListening(false);
        recognition.stop();
    }

    return {
        text,
        startListening,
        stopListening,
        isListening,
        hasRecognitionSupport: !!recognition,
    }
}

export default useSpeechRecognition;