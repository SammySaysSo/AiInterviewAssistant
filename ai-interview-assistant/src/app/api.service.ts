import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

interface TextItem {
  key: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiURL = 'https://aiinterviewbackend.azurewebsites.net';
  transcript: string = '';
  APIKey: string = '';

  constructor(private http: HttpClient) { }

  translateText(textItems: TextItem[], targetLang: string) {
    return this.http.post(`${this.apiURL}/api/translate`, { textItems, targetLang });
  }

  getQuestionsWithNoResume(pastQuestions: string[]){
    return this.http.post(`${this.apiURL}/api/getQuestionsWithNoResume`, pastQuestions);
  }

  getQuestionsWithResume(pastQuestions: string[], resumeText: any){
    return this.http.post(`${this.apiURL}/api/getQuestionsWithResume`, { pastQuestions, resumeText });
  }

  scoreResponse(userResponse: string, question: string){
    return this.http.post(`${this.apiURL}/api/scoreResponse`, { userResponse, question });
  }

  analyzeResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http.post(`${this.apiURL}/api/analyze-resume`, formData);
  }

//   async fetchAPIKey() {
//     try {
//        const res: any = await this.http.get(`${this.apiURL}/api/data`).toPromise();
//        this.APIKey = String(res.apiKey);
//     } catch (error) {
//        console.error("Error fetching API Key", error);
//     }
//  }

//   async startRealTimeTranscription(callback: (text: string) => void) {
//     console.log('Initializing Speech SDK...');
//     await this.fetchAPIKey();

//     const speechConfig = sdk.SpeechConfig.fromSubscription(
//       String(this.APIKey),
//       'eastus'
//     );

//     const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  
//     if (!audioConfig) {
//       console.error('Microphone not detected!');
//       return;
//     }

//     const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

//     recognizer.recognizing = (s, e) => {
//       callback("INTERIM000" + e.result.text);
//     };

//     recognizer.recognized = (s, e) => {
//       callback("FINAL00000" + e.result.text);
//     };

//     recognizer.startContinuousRecognitionAsync();

//     return recognizer;
//   }
}
