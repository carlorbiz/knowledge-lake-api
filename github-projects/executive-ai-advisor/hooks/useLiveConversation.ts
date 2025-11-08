
import { useState, useRef, useCallback } from 'react';
import { LiveSession, LiveServerMessage } from '@google/genai';
import { connectLiveSession } from '../services/geminiService';
import { decode, decodeAudioData, createPcmBlob } from '../utils/audio';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export const useLiveConversation = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [transcript, setTranscript] = useState<{ user: string, model: string, history: string[] }>({ user: '', model: '', history: [] });
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const nextStartTimeRef = useRef(0);
    const audioPlaybackQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const userTranscriptRef = useRef('');
    const modelTranscriptRef = useRef('');

    const stopAudioPlayback = useCallback(() => {
        if (outputAudioContextRef.current) {
            audioPlaybackQueueRef.current.forEach(source => {
                source.stop();
            });
            audioPlaybackQueueRef.current.clear();
            nextStartTimeRef.current = 0;
        }
    }, []);

    const stopConversation = useCallback(async () => {
        setIsListening(false);
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
        }
        
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if(mediaStreamSourceRef.current){
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
           await inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
           await outputAudioContextRef.current.close();
        }

        stopAudioPlayback();
        sessionPromiseRef.current = null;
        setIsSessionActive(false);
    }, [stopAudioPlayback]);

    const startConversation = useCallback(async () => {
        if (isListening) return;

        setError(null);
        setTranscript({ user: '', model: '', history: [] });
        userTranscriptRef.current = '';
        modelTranscriptRef.current = '';
        setIsListening(true);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Your browser does not support audio recording.");
            }
            
            microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });

            const callbacks = {
                onopen: () => {
                    setIsSessionActive(true);
                    if (!microphoneStreamRef.current || !inputAudioContextRef.current) return;
                    
                    mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(microphoneStreamRef.current);
                    scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        if (sessionPromiseRef.current) {
                           sessionPromiseRef.current.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };
                    
                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        userTranscriptRef.current += message.serverContent.inputTranscription.text;
                        setTranscript(prev => ({ ...prev, user: userTranscriptRef.current }));
                    }
                    if (message.serverContent?.outputTranscription) {
                        modelTranscriptRef.current += message.serverContent.outputTranscription.text;
                        setTranscript(prev => ({ ...prev, model: modelTranscriptRef.current }));
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, OUTPUT_SAMPLE_RATE, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        source.onended = () => audioPlaybackQueueRef.current.delete(source);
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioPlaybackQueueRef.current.add(source);
                    }
                    
                    if (message.serverContent?.interrupted) {
                        stopAudioPlayback();
                    }

                    if (message.serverContent?.turnComplete) {
                        const finalUser = userTranscriptRef.current;
                        const finalModel = modelTranscriptRef.current;
                        
                        setTranscript(prev => ({
                            user: '',
                            model: '',
                            history: [...prev.history, `You: ${finalUser}`, `Advisor: ${finalModel}`]
                        }));
                        userTranscriptRef.current = '';
                        modelTranscriptRef.current = '';
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Live session error:", e);
                    setError("A connection error occurred.");
                    stopConversation();
                },
                onclose: () => {
                    stopConversation();
                }
            };

            sessionPromiseRef.current = connectLiveSession(callbacks);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setIsListening(false);
        }
    }, [isListening, stopConversation, stopAudioPlayback]);

    return { isListening, isSessionActive, transcript, error, startConversation, stopConversation };
};
