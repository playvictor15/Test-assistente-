// Variáveis globais
let userName = ""; // Nome do usuário
let isReady = false; // Estado do assistente (pronto ou não)
let recognition; // Declaração da variável de reconhecimento de voz

// Configuração da OpenAI API
const OPENAI_API_KEY = "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"; // Sua chave OpenAI

// Inicializando o reconhecimento de voz
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    // Evento de resultado do reconhecimento de voz
    recognition.onresult = async (event) => {
        let transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Usuário disse:", transcript);

        // Se o nome "Jarvis" for mencionado, o assistente fica pronto
        if (transcript.includes("jarvis") && !isReady) {
            isReady = true;
            speak("Sim, em que posso ajudar?");
        }

        // Se o assistente estiver pronto, executa comandos
        if (isReady) {
            let response = await getAIResponse(transcript);
            speak(response);
            processCommand(response);
        }
    };

    recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
    };

    // Função para iniciar o reconhecimento de voz ao clicar no botão
    document.getElementById('startButton').addEventListener('click', () => {
        recognition.start();
        askUserName(); // Perguntar o nome do usuário
        document.getElementById('startButton').style.display = 'none'; // Esconde o botão após o clique
    });
} else {
    console.log('API de voz não suportada.');
}

// Perguntar o nome do usuário
function askUserName() {
    speak("Olá! Qual é o seu nome?");
    recognition.onresult = (event) => {
        let name = event.results[0][0].transcript.trim();
        userName = name;
        speak(`Prazer em conhecê-lo, ${name}! Agora, me chame de 'Jarvis' e eu estarei pronto para ajudá-lo.`);
        console.log(`Nome do usuário gravado: ${userName}`);
    };
}

// Função para falar com o usuário
function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'pt-BR'; // Define o idioma como português

    // Configura a voz masculina
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices.find(voice => voice.name.toLowerCase().includes("male"));
    if (!speech.voice) {
        speech.voice = voices[0]; // Caso não encontre uma voz masculina
    }

    window.speechSynthesis.speak(speech);
}

// Função para obter resposta da OpenAI
async function getAIResponse(text) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: text }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

// Função para processar comandos (exemplo: abrir site ou tocar música)
function processCommand(response) {
    if (response.includes("abrir")) {
        openWebsite(response);
    } else if (response.includes("tocar música")) {
        playMusic();
    }
}

// Função para abrir sites
function openWebsite(command) {
    let sites = {
        "youtube": "https://www.youtube.com",
        "google": "https://www.google.com",
        "whatsapp": "https://web.whatsapp.com"
    };

    for (let key in sites) {
        if (command.includes(key)) {
            window.open(sites[key], "_blank");
            speak(`Abrindo ${key}`);
            return;
        }
    }
    speak("Não reconheci esse site.");
}

// Função para tocar música (funcionalidade futura com integração ao Spotify)
function playMusic() {
    speak("Tocando música... (integração com Spotify em breve)");
}