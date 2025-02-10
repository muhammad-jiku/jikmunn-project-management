import StepForm from '@/_components/auth/MultiStepForm/StepForm';
import Steps from '@/_components/auth/MultiStepForm/Steps';

interface Step {
  number: number;
  title: string;
}

const SignUp: React.FC = () => {
  const steps: Step[] = [
    {
      number: 1,
      title: 'Choose Your Role',
    },
    {
      number: 2,
      title: 'Personal Information',
    },
    {
      number: 3,
      title: 'User Information',
    },
    {
      number: 4,
      title: 'Submit and Confirmation',
    },
  ];

  return (
    <div className='bg-blue-50 min-h-screen p-4'>
      <div className='mx-auto w-full max-w-5xl p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 grid grid-cols-12 gap-4 min-h-screen'>
        {/* Steps */}
        <Steps steps={steps} />
        {/* Form */}
        <div className='rounded-lg col-span-full md:col-span-8'>
          <StepForm />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
