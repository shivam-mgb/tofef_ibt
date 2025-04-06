const DEEPSEEK_API_KEY = 'sk-984d49c9c6c14269ae2aadc767d5b43f';
let testState = {
    currentSection: 0,
    sections: ['reading', 'listening', 'speaking', 'writing'],
    timer: 10800, // 3 hours in seconds
    scores: { reading: 0, listening: 0, speaking: 0, writing: 0 }
};

class TOEFLTest {
    constructor() {
        this.init();
    }

    async init() {
        await this.generateTestContent();
        this.initEventListeners();
        this.startTimer();
        this.showCurrentSection();
    }

    async generateTestContent() {
        const sections = ['reading', 'listening', 'speaking', 'writing'];
        for (const section of sections) {
            const content = await this.generateSectionContent(section);
            this.renderSection(section, content);
        }
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('exam-container').classList.remove('hidden');
    }

    async generateSectionContent(section) {
        const prompts = {
            reading: "Generate a TOEFL-style reading passage with 3 multiple choice questions in JSON format.",
            listening: "Create a TOEFL listening scenario with transcript and 3 questions in JSON format.",
            speaking: "Provide 2 TOEFL speaking tasks with preparation and response time requirements.",
            writing: "Generate 2 TOEFL writing prompts (integrated and independent tasks)."
        };

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{
                    role: "user",
                    content: prompts[section]
                }]
            })
        });

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }

    renderSection(section, content) {
        const sectionEl = document.getElementById(section);
        // Add rendering logic for each section type
    }

    startTimer() {
        setInterval(() => {
            testState.timer--;
            const hours = Math.floor(testState.timer / 3600);
            const minutes = Math.floor((testState.timer % 3600) / 60);
            const seconds = testState.timer % 60;
            document.getElementById('timer').textContent = 
                `Time Remaining: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    async evaluateResponse(section, response) {
        const evaluationPrompt = {
            speaking: `Evaluate this TOEFL speaking response (0-30): ${response}`,
            writing: `Assess this TOEFL essay (0-30): ${response}`
        }[section];

        const result = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{
                    role: "user",
                    content: evaluationPrompt
                }]
            })
        });

        const data = await result.json();
        return this.extractScore(data.choices[0].message.content);
    }

    extractScore(text) {
        const match = text.match(/\b(30|2[0-9]|[0-1]?[0-9])\b/);
        return match ? parseInt(match[0]) : 0;
    }

    // Add more methods for section navigation, audio handling, etc.
}

// Initialize test
document.addEventListener('DOMContentLoaded', () => new TOEFLTest());
