import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from './api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';

interface TextItem {
  key: string;
  text: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') myInputVariable: ElementRef | undefined;
  @ViewChild('transcriptBox') transcriptBox!: ElementRef<HTMLTextAreaElement>;

  title = 'ai-interview-assistant';
  transcript: string = '';
  currentMessages: string = '';
  resumeFile: File | null = null;
  resumeFileName: string = '';
  analysisResult: any = '';
  // recognizer!: SpeechRecognizer;
  private interval: any;
  timeElapsed: number = 0;
  clickedResumeButton: boolean = false;
  clickedHelpButton: boolean = true;
  totalQuestions: string[] = [""];
  openAIScoreResponse: string = '';
  selectedLanguage = 'es';
  languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'bn', name: 'Bengali' },
    { code: 'it', name: 'Italian' },
    { code: 'ko', name: 'Korean' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' }
  ];
  instructions1: string = "Instructions";
  instructions2: string = "This is an AI Interview Assistant tool divided into two parts: Smart Resume Analyzer & AI-Powered Interview Assistant";
  instructions3: string = "Smart Resume Analyzer";
  instructions4: string = "The is able to take any resume in PDF format by using the Choose File button";
  instructions5: string = "Once the resume is selected, click the Analyze Resume button to see the analysis result from Azure OpenAI (This will also score your resume 1-100%)";
  instructions6: string = "You are able to clear the resume and the AI's response to submit again";
  instructions7: string = "AI-Powered Interview Assistant";
  instructions8: string = "The main idea of this section is to prepare you for relevant interview questions";
  instructions9: string = "To get an interview question, select the Get Interview Question button. This is also designed so you don't get the same interview question if clicked again. Also, if a resume is inserted into this website, the assistant asks a question from your resume.";
  instructions10: string = "Therefore, to make this as realistic as possible, you will be able to speak into a microphone for real-time transmission in you answering the question like a real job interview. (Using the Start & stop Real time transmission buttons respectively)";
  instructions11: string = "If you don't want to speak into the microphone, you are also able to just type in your answer as well. This textbox is also used to make corrections for any mistakes the real-time transmission make as well";
  instructions12: string = "Once you are done answering the question, you are able to click the Score Your Response button to see how well you did. This will also give you feedback on how to improve your response";
  instructions13: string = "You are able to clear the AI's response to submit again.";
  otherTextOnScreen1: string = "Click me to show/hide instructions on how to use this";
  otherTextOnScreen2: string = "Made by Sam";
  otherTextOnScreen3: string = "Click me to Translate";
  otherTextOnScreen4: string = "Smart Resume Analyzer";
  otherTextOnScreen5: string = "Choose File";
  otherTextOnScreen6: string = "Analyze Resume";
  otherTextOnScreen7: string = "Clear Resume";
  otherTextOnScreen8: string = "Selected File";
  otherTextOnScreen9: string = "Analyzing Resume... Time elapsed";
  otherTextOnScreen10: string = "seconds";
  otherTextOnScreen11: string = "Please allow 15-25 seconds of processing time";
  otherTextOnScreen12: string = "Analysis Result";
  otherTextOnScreen13: string = "AI-Powered Interview Assistant";
  otherTextOnScreen14: string = "Start Real Time Transcription";
  otherTextOnScreen15: string = "Stop Real Time Transcription";
  otherTextOnScreen16: string = "Clear Transcript";
  otherTextOnScreen17: string = "Get Interview Question";
  otherTextOnScreen18: string = "Score Your Response";
  otherTextOnScreen19: string = "Clear AI's Response";
  otherTextOnScreen20: string = "Live Transcript";
  otherTextOnScreen21: string = "Complete Transcript";

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  translate() {
    const textArray: TextItem[] = [
      { key: 'instructions1', text: this.instructions1 },
      { key: 'instructions2', text: this.instructions2 },
      { key: 'instructions3', text: this.instructions3 },
      { key: 'instructions4', text: this.instructions4 },
      { key: 'instructions5', text: this.instructions5 },
      { key: 'instructions6', text: this.instructions6 },
      { key: 'instructions7', text: this.instructions7 },
      { key: 'instructions8', text: this.instructions8 },
      { key: 'instructions9', text: this.instructions9 },
      { key: 'instructions10', text: this.instructions10 },
      { key: 'instructions11', text: this.instructions11 },
      { key: 'instructions12', text: this.instructions12 },
      { key: 'instructions13', text: this.instructions13 },
      { key: 'otherTextOnScreen1', text: this.otherTextOnScreen1 },
      { key: 'otherTextOnScreen2', text: this.otherTextOnScreen2 },
      { key: 'otherTextOnScreen3', text: this.otherTextOnScreen3 },
      { key: 'otherTextOnScreen4', text: this.otherTextOnScreen4 },
      { key: 'otherTextOnScreen5', text: this.otherTextOnScreen5 },
      { key: 'otherTextOnScreen6', text: this.otherTextOnScreen6 },
      { key: 'otherTextOnScreen7', text: this.otherTextOnScreen7 },
      { key: 'otherTextOnScreen8', text: this.otherTextOnScreen8 },
      { key: 'otherTextOnScreen9', text: this.otherTextOnScreen9 },
      { key: 'otherTextOnScreen10', text: this.otherTextOnScreen10 },
      { key: 'otherTextOnScreen11', text: this.otherTextOnScreen11 },
      { key: 'otherTextOnScreen12', text: this.otherTextOnScreen12 },
      { key: 'otherTextOnScreen13', text: this.otherTextOnScreen13 },
      { key: 'otherTextOnScreen14', text: this.otherTextOnScreen14 },
      { key: 'otherTextOnScreen15', text: this.otherTextOnScreen15 },
      { key: 'otherTextOnScreen16', text: this.otherTextOnScreen16 },
      { key: 'otherTextOnScreen17', text: this.otherTextOnScreen17 },
      { key: 'otherTextOnScreen18', text: this.otherTextOnScreen18 },
      { key: 'otherTextOnScreen19', text: this.otherTextOnScreen19 },
      { key: 'otherTextOnScreen20', text: this.otherTextOnScreen20 },
      { key: 'otherTextOnScreen21', text: this.otherTextOnScreen21 },
      { key: 'openAIScoreResponse', text: this.openAIScoreResponse },
      { key: 'totalQuestions', text: this.totalQuestions[(this.totalQuestions.length - 1)] },
      { key: 'currentMessages', text: this.currentMessages },
      { key: 'analysisResult', text: this.analysisResult}
    ];
    this.apiService.translateText(textArray, this.selectedLanguage)
      .subscribe((translated: any) => {
        console.log(translated);
        this.instructions1 = translated.find((item: TextItem) => item.key == 'instructions1')?.text;
        this.instructions2 = translated.find((item: TextItem) => item.key == 'instructions2')?.text;
        this.instructions3 = translated.find((item: TextItem) => item.key == 'instructions3')?.text;
        this.instructions4 = translated.find((item: TextItem) => item.key == 'instructions4')?.text;
        this.instructions5 = translated.find((item: TextItem) => item.key == 'instructions5')?.text;
        this.instructions6 = translated.find((item: TextItem) => item.key == 'instructions6')?.text;
        this.instructions7 = translated.find((item: TextItem) => item.key == 'instructions7')?.text;
        this.instructions8 = translated.find((item: TextItem) => item.key == 'instructions8')?.text;
        this.instructions9 = translated.find((item: TextItem) => item.key == 'instructions9')?.text;
        this.instructions10 = translated.find((item: TextItem) => item.key == 'instructions10')?.text;
        this.instructions11 = translated.find((item: TextItem) => item.key == 'instructions11')?.text;
        this.instructions12 = translated.find((item: TextItem) => item.key == 'instructions12')?.text;
        this.instructions13 = translated.find((item: TextItem) => item.key == 'instructions13')?.text;
        this.otherTextOnScreen1 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen1')?.text;
        this.otherTextOnScreen2 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen2')?.text;
        this.otherTextOnScreen3 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen3')?.text;
        this.otherTextOnScreen4 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen4')?.text;
        this.otherTextOnScreen5 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen5')?.text;
        this.otherTextOnScreen6 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen6')?.text;
        this.otherTextOnScreen7 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen7')?.text;
        this.otherTextOnScreen8 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen8')?.text;
        this.otherTextOnScreen9 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen9')?.text;
        this.otherTextOnScreen10 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen10')?.text;
        this.otherTextOnScreen11 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen11')?.text;
        this.otherTextOnScreen12 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen12')?.text;
        this.otherTextOnScreen13 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen13')?.text;
        this.otherTextOnScreen14 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen14')?.text;
        this.otherTextOnScreen15 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen15')?.text;
        this.otherTextOnScreen16 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen16')?.text;
        this.otherTextOnScreen17 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen17')?.text;
        this.otherTextOnScreen18 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen18')?.text;
        this.otherTextOnScreen19 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen19')?.text;
        this.otherTextOnScreen20 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen20')?.text;
        this.otherTextOnScreen21 = translated.find((item: TextItem) => item.key == 'otherTextOnScreen21')?.text;
        this.openAIScoreResponse = translated.find((item: TextItem) => item.key == 'openAIScoreResponse')?.text;
        this.totalQuestions[(this.totalQuestions.length - 1)] = translated.find((item: TextItem) => item.key == 'totalQuestions')?.text;
        this.currentMessages = translated.find((item: TextItem) => item.key == 'currentMessages')?.text;
        this.analysisResult = translated.find((item: TextItem) => item.key == 'analysisResult')?.text;
      });
  }

  onFileSelected(event: any) {
    this.resumeFile = event.target.files[0];
    this.resumeFileName = this.resumeFile!.name;
    console.log(this.resumeFile!.name);
  }

  clearResume(event: any){
    event.target.value = "";
    this.myInputVariable!.nativeElement.value = '';
    this.resumeFile = null;
    this.clickedResumeButton = false;
    this.resumeFileName = '';
    this.analysisResult = null;
  }

  analyzeResume() {
    if (!this.resumeFile) {
      alert('Please upload a resume file first.');
      return;
    }
    this.timeElapsed = 0;
    this.clickedResumeButton = true;
    this.interval = setInterval(() => {
      this.timeElapsed++;
    }, 1000);

    this.apiService.analyzeResume(this.resumeFile).subscribe(
      (data) => {
        this.analysisResult = data;
      },
      (error) => {
        console.error('Error analyzing resume:', error);
      }
    );
  }

  formattedText(): string {
    return this.analysisResult
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/###/g, '—');
  }
  
  startTranscription() {
    // if(!this.recognizer) {
    //   this.apiService.startRealTimeTranscription((text: string) => {
    //     if(text.includes('INTERIM000')){
    //       this.currentMessages = text.slice(10);
    //     }
    //     if(text.includes('FINAL00000')){
    //       this.transcript += text.slice(10) + " ";
    //       setTimeout(() => this.adjustTextareaHeight(), 0);
    //     }
    //   }).then(recognizer => {
    //     this.recognizer = recognizer!;
    //   }).catch(error => {
    //     console.error('Error starting transcription:', error);
    //   });
    // }
  }

  stopTranscription() {
    // this.recognizer?.stopContinuousRecognitionAsync();
  }

  clearTranscription() {  
    this.transcript = '';
    this.currentMessages = '';
    setTimeout(() => this.adjustTextareaHeight(), 10);
  }

  adjustTextareaHeight() {
    if (this.transcriptBox) {
      const textarea = this.transcriptBox.nativeElement;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  showHelpText(){
    this.clickedHelpButton = !this.clickedHelpButton;
  }

  getRelevantInterviewQuestions(){
    if(this.analysisResult){ //send resume analysis to form questions
      this.apiService.getQuestionsWithResume(this.totalQuestions, this.analysisResult).subscribe(
        (response) => {
          this.totalQuestions.push(String(response));
          if(this.totalQuestions[(this.totalQuestions.length - 1)] != undefined && this.totalQuestions[(this.totalQuestions.length - 1)].includes("429")){
            this.totalQuestions[this.totalQuestions.length - 1] += ". Clicking button too fast. Please wait 60 seconds before trying again.";
          }
        },
        (error) => {
          console.error('Error getting questions:', error);
        }
      );
    }else{ //get a questions from top 10 relevant interview questions
      this.apiService.getQuestionsWithNoResume(this.totalQuestions).subscribe(
        (response) => {
          this.totalQuestions.push(String(response));
          if(this.totalQuestions[(this.totalQuestions.length - 1)] != undefined && this.totalQuestions[(this.totalQuestions.length - 1)].includes("429")){
            this.totalQuestions[this.totalQuestions.length - 1] += ". Clicking button too fast. Please wait 60 seconds before trying again.";
          }
        },
        (error) => {
          console.error('Error getting questions:', error);
        }
      );
    }
  }

  getScoreOfUsersResponse(){ 
    if(this.totalQuestions.length == 0){
      alert('Please get relevant interview questions first.');
      return;
    }
    if(this.transcript == ''){
      alert('Please start recording or type in your transcript first.');
      return;
    }
    this.apiService.scoreResponse(this.transcript, this.totalQuestions[(this.totalQuestions.length - 1)]).subscribe(
      (response) => {
        this.openAIScoreResponse = String(response);
        console.log(response);
      },
      (error) => {
        console.error('Error getting score:', error);
      }
    );
  }

  clearResponses(){
    this.openAIScoreResponse = '';
  }
}
