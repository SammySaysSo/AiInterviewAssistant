const express = require('express');
const cors = require('cors');
const multer = require("multer");
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;
const AZURE_FORM_RECOGNIZER_ENDPOINT = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const AZURE_FORM_RECOGNIZER_KEY = process.env.AZURE_FORM_RECOGNIZER_KEY;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT;

app.get('/', (req, res) => {
    res.send('Node.js backend is running!');
});

// app.get('/api/data', (req, res) => {
//     res.json({ apiKey: AZURE_SPEECH_KEY });
// });

app.post('/api/getQuestionsWithNoResume', async (req, res) => {
    const OpenAIResponseQuestion = await getResumeWithNoText(req.body);
    res.json(OpenAIResponseQuestion);
});

app.post('/api/getQuestionsWithResume', async (req, res) => {
    const OpenAIResponseQuestion = await getResumeWithText(req.body);
    res.json(OpenAIResponseQuestion);
});

app.post('/api/scoreResponse', async (req, res) => {
    const OpenAIResponse = await getResponseToQuestion(req.body);
    res.json(OpenAIResponse)
});

const upload = multer({ dest: "uploads/" });

app.post("/api/translate", async (req, res) => {
    try {
        const texts = req.body.textItems;
        const targetLang = req.body.targetLang;

        const requestBody = texts.map(item => ({ Text: item.text}));

        const response = await axios.post(
            `${AZURE_TRANSLATOR_ENDPOINT}?api-version=3.0&to=${targetLang}`,
            requestBody,
            {
                headers: {
                    "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
                    "Ocp-Apim-Subscription-Region": 'eastus',
                    "Content-Type": "application/json"
                }
            }
        );

        const translatedTexts = texts.map((item, index) => ({
            key: item.key,
            text: response.data[index].translations[0].text
        }));

        res.json(translatedTexts);
    } catch (error) {
        console.error("Translation Error:", error);
        res.status(500).send("Error translating text.");
    }
});

app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
    try {
        console.log("✅ 1/3 Extracting resume...");
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const fileBuffer = fs.readFileSync(req.file.path);

        const response = await axios.post(`
            ${AZURE_FORM_RECOGNIZER_ENDPOINT}formrecognizer/documentModels/prebuilt-read:analyze?api-version=2022-08-31`, 
            fileBuffer, {
            headers: {
                "Ocp-Apim-Subscription-Key": AZURE_FORM_RECOGNIZER_KEY,
                "Content-Type": "application/octet-stream"
            }
        });

        const operationLocation = response.headers['operation-location'];

        setTimeout(async () => {
            const resultResponse = await axios.get(operationLocation, {
                headers: {
                    'Ocp-Apim-Subscription-Key': AZURE_FORM_RECOGNIZER_KEY,
                },
            });

            if (resultResponse.data?.analyzeResult?.content) {
                console.log("✅ 2/3 Resume text extracted! Sending to AI analysis...");
                const OpenAIResponse = await processResume(resultResponse.data?.analyzeResult?.content);
                res.json(OpenAIResponse);
            } else {
                console.error("⚠️ No text extracted from OCR.");
            }
        }, 10000);

        fs.unlinkSync(req.file.path);
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ error: "Resume analysis failed" });
    }
});

async function getResponseToQuestion(userResponses){
    try {
        const response = await axios.post(
            AZURE_OPENAI_ENDPOINT,
            {
                messages: [
                    {
                        role: "system",
                        content: [{ type: "text", text: "You are an AI interviewer assistant. Provided from the user the question and userResponse. Say how good the user answered the question on a scale of 1-100%. Give respective feedback and improvements." }]
                    },
                    {
                        role: "user",
                        content: [{ type: "text", text: JSON.stringify(userResponses) }]
                    }
                ],
                temperature: 0.9,
                top_p: 0.95,
                max_tokens: 400
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": AZURE_OPENAI_KEY
                }
            }
        );
        console.log("✅ AI getting response to question completed");
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ AI getting response to question completed failed", error.response?.data || error.message);
    }
}

async function getResumeWithText(resumeTextAndPreviousQuestions) {
    if (resumeTextAndPreviousQuestions.pastQuestions.length === 0) {
        console.log("No previous questions provided");
        try {
            const response = await axios.post(
                AZURE_OPENAI_ENDPOINT,
                {
                    messages: [
                        {
                            role: "system",
                            content: [{ type: "text", text: "You are an Resume AI Assistant. Ask a good and thoughtful interview question based on the resume text provided." }]
                        },
                        {
                            role: "user",
                            content: [{ type: "text", text: resumeTextAndPreviousQuestions.resumeText.substring(0, 300) }]
                        }
                    ],
                    temperature: 0.9,
                    top_p: 0.95,
                    max_tokens: 300
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "api-key": AZURE_OPENAI_KEY
                    }
                }
            );
            console.log("✅ AI getting question with resume text completed");
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error("❌ OpenAI Resume with text failed", error.response?.data || error.message);
            return error.message;
        }
    }else{
        console.log("Previous questions provided");
        try {
            const response = await axios.post(
                AZURE_OPENAI_ENDPOINT,
                {
                    messages: [
                        {
                            role: "system",
                            content: [{ type: "text", text: "You are an Resume AI Assistant. Ask only a good and thoughtful interview question based on the provided resumeText but don't repeat the same questions that the user gives you." }]
                        },
                        {
                            role: "user",
                            content: [{ type: "text", text: JSON.stringify(resumeTextAndPreviousQuestions).substring(0, 300) }]
                        }
                    ],
                    temperature: 0.9,
                    top_p: 0.95,
                    max_tokens: 300
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "api-key": AZURE_OPENAI_KEY
                    }
                }
            );
            console.log("✅ AI getting question with resume text completed");
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error("❌ OpenAI Resume with text failed", error.response?.data || error.message);
            return error.message;
        }
    }
}

async function getResumeWithNoText(previousQuestions) {
    if (previousQuestions.length === 0) {
        console.log("No previous questions provided");
        try {
            const response = await axios.post(
                AZURE_OPENAI_ENDPOINT,
                {
                    messages: [
                        {
                            role: "system",
                            content: [{ type: "text", text: "You are an Resume AI Assistant. Ask a good and thoughtful interview question." }]
                        }
                    ],
                    temperature: 0.9,
                    top_p: 0.95,
                    max_tokens: 300
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "api-key": AZURE_OPENAI_KEY
                    }
                }
            );
            console.log("✅ AI getting question with no resume text completed");
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error("❌ OpenAI Resume with no text failed", error.response?.data || error.message);
            return error.message;
        }
    }else{
        console.log("Previous questions provided");
        try {
            const response = await axios.post(
                AZURE_OPENAI_ENDPOINT,
                {
                    messages: [
                        {
                            role: "system",
                            content: [{ type: "text", text: "You are an Resume AI Assistant. Ask only a good and thoughtful interview question but don't repeat the same questions that the user gives you." }]
                        },
                        {
                            role: "user",
                            content: [{ type: "text", text: JSON.stringify(previousQuestions) }]
                        }
                    ],
                    temperature: 0.9,
                    top_p: 0.95,
                    max_tokens: 300
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "api-key": AZURE_OPENAI_KEY
                    }
                }
            );
            console.log("✅ AI getting question with no resume text completed");
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error("❌ OpenAI Resume with no text failed", error.response?.data || error.message);
            return error.message;
        }
    }
}

async function processResume(resumeText) {
    if (!resumeText) {
        console.error("Error: No resume text provided!");
        return;
    }

    if (resumeText.length > 1200) {
        resumeText = resumeText.substring(0, 1200);
    }

    try {
        const response = await axios.post(
            AZURE_OPENAI_ENDPOINT,
            {
                messages: [
                    {
                        role: "system",
                        content: [{ type: "text", text: "You are an Resume AI Analyzer. Also say how good the resume is on a scale of 1-100%. Give improvements and respective feedback." }] 
                    },
                    {
                        role: "user",
                        content: [{ type: "text", text: resumeText }]
                    }
                ],
                temperature: 0.9,
                top_p: 0.95,
                max_tokens: 500
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": AZURE_OPENAI_KEY
                }
            }
        );
        console.log("✅ 3/3 AI analysis completed!");
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ OpenAI Request Failed:", error.response?.data || error.message);
    }
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});