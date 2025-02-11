/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  contact: string;
  profileImage: string;
}

export interface BaseFormData {
  role: 'DEVELOPER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Final form data will have nested personal info.
export interface SignupFormData extends BaseFormData {
  developer?: PersonalInfo;
  manager?: PersonalInfo;
  admin?: PersonalInfo;
  superAdmin?: PersonalInfo;
}

// Define a payload type that accepts both base and personal info fields.
export type SignupFormPayload = Partial<BaseFormData> & Partial<PersonalInfo>;

interface SignupState {
  currentStep: number;
  formData: SignupFormData;
}

const initialState: SignupState = {
  currentStep: 1,
  formData: {
    role: 'DEVELOPER',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
};

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateFormData: (state, action: PayloadAction<SignupFormPayload>) => {
      // Keys that belong to personal info
      const personalKeys = [
        'firstName',
        'middleName',
        'lastName',
        'contact',
        'profileImage',
      ];
      const personalInfo: Partial<PersonalInfo> = {};
      const baseData: Partial<BaseFormData> = {};

      for (const key in action.payload) {
        if (personalKeys.includes(key)) {
          (personalInfo as any)[key] = (action.payload as any)[key];
        } else {
          (baseData as any)[key] = (action.payload as any)[key];
        }
      }

      // Merge the base fields into state.formData.
      state.formData = { ...state.formData, ...baseData };

      // If any personal info fields exist, nest them under the proper key.
      if (Object.keys(personalInfo).length > 0) {
        switch (state.formData.role) {
          case 'MANAGER':
            state.formData.manager = {
              ...(state.formData.manager || {}),
              ...personalInfo,
            } as PersonalInfo;
            break;
          case 'DEVELOPER':
            state.formData.developer = {
              ...(state.formData.developer || {}),
              ...personalInfo,
            } as PersonalInfo;
            break;
          case 'ADMIN':
            state.formData.admin = {
              ...(state.formData.admin || {}),
              ...personalInfo,
            } as PersonalInfo;
            break;
          case 'SUPER_ADMIN':
            state.formData.superAdmin = {
              ...(state.formData.superAdmin || {}),
              ...personalInfo,
            } as PersonalInfo;
            break;
          default:
            break;
        }
      }
    }, // New action to reset the state.
    resetSignup: (state) => {
      state.currentStep = 1;
      state.formData = {
        role: 'DEVELOPER',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      };
    },
  },
});

export const { setCurrentStep, updateFormData, resetSignup } =
  signupSlice.actions;
export default signupSlice.reducer;
