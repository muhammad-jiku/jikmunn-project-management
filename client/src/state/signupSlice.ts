/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the form data
interface FormData {
  [key: string]: any; // Adjust the type if you know the specific structure of your form data
}

// Define the shape of the initial state
interface SignupState {
  currentStep: number;
  formData: FormData;
}

const initialState: SignupState = {
  currentStep: 1,
  formData: {},
};

export const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateFormData: (state, action: PayloadAction<FormData>) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },
  },
});

export const { setCurrentStep, updateFormData } = signupSlice.actions;
export default signupSlice.reducer;
