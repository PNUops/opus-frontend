import { createContext, ReactNode, useContext, useState } from 'react';

interface ContestCreateContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  contestId: number;
  setContestId: (id: number) => void;
}

const ContestCreateContext = createContext<ContestCreateContextType | undefined>(undefined);

interface ContestCreateProviderProps {
  children: ReactNode;
}

export const ContestCreateProvider = ({ children }: ContestCreateProviderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [contestId, setContestId] = useState<number>(0);

  const value = { currentStep, setCurrentStep, contestId, setContestId };

  return <ContestCreateContext.Provider value={value}>{children}</ContestCreateContext.Provider>;
};

export const useContestCreate = () => {
  const context = useContext(ContestCreateContext);
  if (context === undefined) {
    throw new Error('useContestCreate는 ContestCreateProvider 안에서 사용되어야 합니다.');
  }
  return context;
};
