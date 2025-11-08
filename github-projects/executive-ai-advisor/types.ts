export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
  update?: string;
  suggestedPrompts?: string[];
}

export interface ChatSession {
  id:string;
  title: string;
  messages: Message[];
  createdAt: Date;
}