export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string;
  tag: string;
}

export interface Vital {
  id: string;
  date: string;
  bp: string;
  temperature: string;
  weight: string;
  heartRate: string;
  spo2: string;
  notes: string;
}

export interface Visit {
  id: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  prescription: string;
  doctor: string;
  followUp: string;
  notes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: number;
}

export interface Note {
  id: string;
  date: string;
  content: string;
  author: string;
}

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number | '';
  gender: string;
  bloodGroup: string;
  contact: string;
  emergencyContact: string;
  building: string;
  locality: string;
  landmark: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  allergies: string;
  medicalHistory: string;
  attachments: Attachment[];
  visits: Visit[];
  vitals: Vital[];
  notes: Note[];
  photoUrl: string | null;
  createdAt: number;
}
